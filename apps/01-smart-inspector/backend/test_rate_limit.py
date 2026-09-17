"""Tests for persistent and atomic AI request quotas."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from rate_limit import PersistentRateLimiter


class MutableClock:
    def __init__(self, value: float = 1_700_000_000) -> None:
        self.value = value

    def __call__(self) -> float:
        return self.value


class PersistentRateLimiterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = str(Path(self.temp_dir.name) / "quota.sqlite3")
        self.clock = MutableClock()

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def limiter(self, minute: int = 2, daily: int = 10, global_daily: int = 100):
        return PersistentRateLimiter(
            minute,
            daily,
            global_daily,
            database_path=self.database_path,
            clock=self.clock,
        )

    def test_blocks_ip_after_minute_limit(self) -> None:
        limiter = self.limiter(minute=2)
        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-a").allowed)
        decision = limiter.check_and_record("client-a")
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.scope, "minute_per_ip")
        self.assertGreater(decision.retry_after, 0)

    def test_minute_limit_is_independent_per_ip(self) -> None:
        limiter = self.limiter(minute=1)
        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-b").allowed)

    def test_allows_ip_again_after_minute_window(self) -> None:
        limiter = self.limiter(minute=1)
        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.clock.value += 61
        self.assertTrue(limiter.check_and_record("client-a").allowed)

    def test_blocks_ip_after_daily_limit(self) -> None:
        limiter = self.limiter(minute=10, daily=2)
        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertEqual(limiter.check_and_record("client-a").scope, "day_per_ip")

    def test_blocks_all_ips_after_global_daily_limit(self) -> None:
        limiter = self.limiter(minute=10, daily=10, global_daily=2)
        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-b").allowed)
        self.assertEqual(limiter.check_and_record("client-c").scope, "global_day")

    def test_quota_survives_limiter_recreation(self) -> None:
        first = self.limiter(minute=1)
        self.assertTrue(first.check_and_record("client-a").allowed)
        second = self.limiter(minute=1)
        self.assertEqual(second.check_and_record("client-a").scope, "minute_per_ip")


if __name__ == "__main__":
    unittest.main()
