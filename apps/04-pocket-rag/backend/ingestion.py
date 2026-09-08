import io
import re
import zipfile
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree


SUPPORTED_EXTENSIONS = {"pdf", "txt", "md", "docx"}


class IngestionError(ValueError):
    pass


@dataclass(frozen=True)
class ParsedChunk:
    content: str
    page_number: int | None
    chunk_index: int


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    words = text.split()
    if not words:
        return []
    step = chunk_size - overlap
    return [" ".join(words[index : index + chunk_size]) for index in range(0, len(words), step)]


def _parse_pdf(content: bytes, pdf_reader, max_pages: int) -> list[tuple[str, int | None]]:
    if not content.startswith(b"%PDF"):
        raise IngestionError("The file is not a valid PDF")
    if pdf_reader is None:
        raise IngestionError("PDF parsing is unavailable")
    try:
        reader = pdf_reader(io.BytesIO(content))
        if getattr(reader, "is_encrypted", False):
            raise IngestionError("Encrypted PDFs are not supported")
        if len(reader.pages) > max_pages:
            raise IngestionError(f"PDF exceeds the {max_pages}-page limit")
        pages = [((page.extract_text() or "").strip(), index + 1) for index, page in enumerate(reader.pages)]
    except IngestionError:
        raise
    except Exception as error:
        raise IngestionError("The PDF is corrupted or cannot be parsed") from error
    pages = [page for page in pages if page[0]]
    if not pages:
        raise IngestionError("The PDF contains no extractable text; OCR is not supported")
    return pages


def _parse_docx(content: bytes) -> list[tuple[str, int | None]]:
    if not content.startswith(b"PK"):
        raise IngestionError("The file is not a valid DOCX")
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            entries = archive.infolist()
            if len(entries) > 1000:
                raise IngestionError("DOCX contains too many archive entries")
            total_uncompressed = sum(entry.file_size for entry in entries)
            total_compressed = max(sum(entry.compress_size for entry in entries), 1)
            if total_uncompressed > 20_000_000 or total_uncompressed / total_compressed > 100:
                raise IngestionError("DOCX expanded content exceeds the safety limit")
            if "word/document.xml" not in archive.namelist():
                raise IngestionError("DOCX has no document body")
            root = ElementTree.fromstring(archive.read("word/document.xml"))
    except IngestionError:
        raise
    except (zipfile.BadZipFile, ElementTree.ParseError, OSError) as error:
        raise IngestionError("The DOCX is corrupted or cannot be parsed") from error

    paragraphs = []
    for paragraph in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        text = "".join(paragraph.itertext()).strip()
        if text:
            paragraphs.append(text)
    extracted = "\n".join(paragraphs)
    if not extracted:
        raise IngestionError("The DOCX contains no extractable text")
    return [(extracted, None)]


def parse_document(
    content: bytes,
    extension: str,
    *,
    pdf_reader,
    max_pages: int,
    max_text_chars: int,
    chunk_size: int,
    overlap: int,
    max_chunks: int,
) -> list[ParsedChunk]:
    if extension not in SUPPORTED_EXTENSIONS:
        raise IngestionError("Unsupported file format. Upload PDF, TXT, MD, or DOCX")
    if not content:
        raise IngestionError("The uploaded file is empty")

    if extension == "pdf":
        sections = _parse_pdf(content, pdf_reader, max_pages)
    elif extension == "docx":
        sections = _parse_docx(content)
    else:
        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError as error:
            raise IngestionError("Text files must use UTF-8 encoding") from error
        if extension == "md" and b"\x00" in content:
            raise IngestionError("The Markdown file contains binary data")
        sections = [(text.strip(), None)]

    total_chars = sum(len(text) for text, _ in sections)
    if total_chars == 0:
        raise IngestionError("The document contains no text")
    if total_chars > max_text_chars:
        raise IngestionError(f"Extracted text exceeds the {max_text_chars}-character limit")

    chunks: list[ParsedChunk] = []
    for text, page_number in sections:
        normalized = re.sub(r"[ \t]+", " ", text).strip()
        for chunk in chunk_text(normalized, chunk_size, overlap):
            chunks.append(ParsedChunk(chunk, page_number, len(chunks)))
            if len(chunks) > max_chunks:
                raise IngestionError(f"Document exceeds the {max_chunks}-chunk limit")
    if not chunks:
        raise IngestionError("The document contains no indexable text")
    return chunks
