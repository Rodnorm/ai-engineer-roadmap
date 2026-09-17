"""Tests for trusted reverse-proxy client address resolution."""

from __future__ import annotations

import unittest

from client_ip import parse_trusted_proxy_cidrs, resolve_client_ip


class TestClientIpResolution(unittest.TestCase):
    def setUp(self) -> None:
        self.trusted = parse_trusted_proxy_cidrs("172.16.0.0/12")

    def test_ignores_forwarded_header_when_disabled(self) -> None:
        self.assertEqual(
            resolve_client_ip("172.18.0.2", "198.51.100.7", False, self.trusted),
            "172.18.0.2",
        )

    def test_ignores_forwarded_header_from_untrusted_peer(self) -> None:
        self.assertEqual(
            resolve_client_ip("203.0.113.8", "198.51.100.7", True, self.trusted),
            "203.0.113.8",
        )

    def test_uses_rightmost_untrusted_address(self) -> None:
        self.assertEqual(
            resolve_client_ip(
                "172.18.0.2",
                "192.0.2.99, 198.51.100.7, 172.18.0.3",
                True,
                self.trusted,
            ),
            "198.51.100.7",
        )

    def test_rejects_malformed_forwarded_chain(self) -> None:
        self.assertEqual(
            resolve_client_ip("172.18.0.2", "not-an-ip", True, self.trusted),
            "172.18.0.2",
        )


if __name__ == "__main__":
    unittest.main()
