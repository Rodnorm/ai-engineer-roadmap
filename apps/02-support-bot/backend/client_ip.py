"""Resolve client addresses only across explicitly trusted reverse proxies."""

from __future__ import annotations

from ipaddress import ip_address, ip_network
from typing import Iterable


def parse_trusted_proxy_cidrs(raw_value: str) -> tuple:
    networks = []
    for value in raw_value.split(","):
        candidate = value.strip()
        if candidate:
            networks.append(ip_network(candidate, strict=False))
    return tuple(networks)


def resolve_client_ip(
    peer_host: str | None,
    forwarded_for: str | None,
    trust_proxy_headers: bool,
    trusted_proxy_cidrs: Iterable,
) -> str:
    peer = peer_host or "unknown"
    if not trust_proxy_headers or not forwarded_for:
        return peer

    try:
        peer_address = ip_address(peer)
    except ValueError:
        return peer

    networks = tuple(trusted_proxy_cidrs)
    if not networks or not any(peer_address in network for network in networks):
        return peer

    forwarded = [value.strip() for value in forwarded_for.split(",") if value.strip()]
    try:
        chain = [ip_address(value) for value in forwarded]
    except ValueError:
        return peer

    for candidate in reversed(chain):
        if not any(candidate in network for network in networks):
            return str(candidate)
    return peer
