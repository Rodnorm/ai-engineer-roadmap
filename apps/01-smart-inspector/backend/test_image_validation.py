import io
import unittest
from PIL import Image
from fastapi.testclient import TestClient

from main import app, _process_and_sanitize_image, GENERATION_ENABLED


def create_test_image(width: int = 100, height: int = 100, fmt: str = "JPEG") -> bytes:
    buf = io.BytesIO()
    mode = "RGB" if fmt == "JPEG" else "RGBA"
    img = Image.new(mode, (width, height), color="red")
    img.save(buf, format=fmt)
    return buf.getvalue()


class ImageValidationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_valid_image_processing(self) -> None:
        raw = create_test_image(200, 200, "PNG")
        clean_bytes, mime = _process_and_sanitize_image(raw)
        self.assertTrue(len(clean_bytes) > 0)
        self.assertEqual(mime, "image/png")

    def test_rejects_empty_file(self) -> None:
        response = self.client.post(
            "/analyze",
            files={"image": ("empty.png", b"", "image/png")},
        )
        self.assertEqual(response.status_code, 400)

    def test_rejects_fake_text_file_as_image(self) -> None:
        fake_content = b"This is not a real PNG image content."
        response = self.client.post(
            "/analyze",
            files={"image": ("fake.png", fake_content, "image/png")},
        )
        self.assertIn(response.status_code, (400, 415))

    def test_rejects_oversized_dimensions(self) -> None:
        # Create an image exceeding max dimensions (9000 > 8000)
        raw_large = create_test_image(9000, 100, "PNG")
        response = self.client.post(
            "/analyze",
            files={"image": ("large.png", raw_large, "image/png")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("exceed", response.json()["detail"].lower())

    def test_health_endpoint_minimal_exposure(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("generation_enabled", data)
        # Verify secrets and deployment endpoints are not exposed
        self.assertNotIn("endpoint", data)
        self.assertNotIn("deployment", data)


if __name__ == "__main__":
    unittest.main()
