"""Small dependency-free rate limiter for the Support Bot demo.

The state is process-local. This is useful for local development and basic
abuse protection, but it is not a distributed quota across serverless
instances. Use a shared store or an edge/WAF limit for a strict global cap.
"""

from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import date, datetime, timezone
from threading import Lock
from time import time
from typing import Callable


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    scope: str | None = None
    retry_after: int = 0


class InMemoryRateLimiter:
    def __init__(
        self,
        requests_per_minute: int,
        requests_per_day_per_ip: int,
        global_requests_per_day: int,
        clock: Callable[[], float] = time,
    ) -> None:
        self.requests_per_minute = requests_per_minute
        self.requests_per_day_per_ip = requests_per_day_per_ip
        self.global_requests_per_day = global_requests_per_day
        self._clock = clock
        self._minute_requests: dict[str, deque[float]] = defaultdict(deque)
        self._daily_requests: dict[str, int] = defaultdict(int)
        self._global_daily_requests = 0
        self._current_day = self._utc_day()
        self._lock = Lock()

    def _utc_day(self) -> date:
        return datetime.fromtimestamp(
            self._clock(), tz=timezone.utc
        ).date()

    def _reset_daily_counts_if_needed(self) -> None:
        today = self._utc_day()
        if today != self._current_day:
            self._current_day = today
            self._daily_requests.clear()
            self._global_daily_requests = 0

    def check_and_record(self, client_key: str) -> RateLimitDecision:
        now = self._clock()
        cutoff = now - 60

        with self._lock:
            self._reset_daily_counts_if_needed()
            minute_window = self._minute_requests[client_key]

            while minute_window and minute_window[0] <= cutoff:
                minute_window.popleft()

            if len(minute_window) >= self.requests_per_minute:
                retry_after = max(1, int(60 - (now - minute_window[0])))
                return RateLimitDecision(
                    allowed=False,
                    scope="minute_per_ip",
                    retry_after=retry_after,
                )

            if (
                self._daily_requests[client_key]
                >= self.requests_per_day_per_ip
            ):
                return RateLimitDecision(
                    allowed=False,
                    scope="day_per_ip",
                    retry_after=self._seconds_until_next_utc_day(now),
                )

            if (
                self._global_daily_requests
                >= self.global_requests_per_day
            ):
                return RateLimitDecision(
                    allowed=False,
                    scope="global_day",
                    retry_after=self._seconds_until_next_utc_day(now),
                )

            minute_window.append(now)
            self._daily_requests[client_key] += 1
            self._global_daily_requests += 1
            return RateLimitDecision(allowed=True)

    @staticmethod
    def _seconds_until_next_utc_day(timestamp: float) -> int:
        now = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        tomorrow = datetime.combine(
            now.date(),
            datetime.min.time(),
            tzinfo=timezone.utc,
        ).replace(day=now.day)  # initialized below without local timezone
        tomorrow = datetime.fromordinal(
            now.date().toordinal() + 1
        ).replace(tzinfo=timezone.utc)
        return max(1, int((tomorrow - now).total_seconds()))
