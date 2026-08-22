import unittest

from rate_limit import InMemoryRateLimiter


class MutableClock:
    def __init__(self, value: float = 1_700_000_000) -> None:
        self.value = value

    def __call__(self) -> float:
        return self.value


class InMemoryRateLimiterTests(unittest.TestCase):
    def test_blocks_ip_after_minute_limit(self) -> None:
        clock = MutableClock()
        limiter = InMemoryRateLimiter(2, 10, 100, clock=clock)

        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-a").allowed)

        decision = limiter.check_and_record("client-a")
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.scope, "minute_per_ip")
        self.assertGreater(decision.retry_after, 0)

    def test_minute_limit_is_independent_per_ip(self) -> None:
        clock = MutableClock()
        limiter = InMemoryRateLimiter(1, 10, 100, clock=clock)

        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-b").allowed)

    def test_allows_ip_again_after_minute_window(self) -> None:
        clock = MutableClock()
        limiter = InMemoryRateLimiter(1, 10, 100, clock=clock)

        self.assertTrue(limiter.check_and_record("client-a").allowed)
        clock.value += 61
        self.assertTrue(limiter.check_and_record("client-a").allowed)

    def test_blocks_ip_after_daily_limit(self) -> None:
        clock = MutableClock()
        limiter = InMemoryRateLimiter(10, 2, 100, clock=clock)

        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-a").allowed)

        decision = limiter.check_and_record("client-a")
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.scope, "day_per_ip")

    def test_blocks_all_ips_after_global_daily_limit(self) -> None:
        clock = MutableClock()
        limiter = InMemoryRateLimiter(10, 10, 2, clock=clock)

        self.assertTrue(limiter.check_and_record("client-a").allowed)
        self.assertTrue(limiter.check_and_record("client-b").allowed)

        decision = limiter.check_and_record("client-c")
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.scope, "global_day")


if __name__ == "__main__":
    unittest.main()
