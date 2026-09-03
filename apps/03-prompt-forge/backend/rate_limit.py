import time
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    scope: Optional[str] = None
    retry_after: int = 0


class InMemoryRateLimiter:
    def __init__(
        self,
        requests_per_minute: int,
        requests_per_day_per_ip: int,
        global_requests_per_day: int,
        clock: Optional[Callable[[], float]] = None,
    ) -> None:
        self.requests_per_minute = requests_per_minute
        self.requests_per_day_per_ip = requests_per_day_per_ip
        self.global_requests_per_day = global_requests_per_day
        self._clock = clock or time.time

        self._ip_minute: Dict[str, List[float]] = {}
        self._ip_day: Dict[str, List[float]] = {}
        self._global_day: List[float] = []

    def _clean(self, timestamps: List[float], window_seconds: float, now: float) -> List[float]:
        cutoff = now - window_seconds
        return [t for t in timestamps if t > cutoff]

    def check_and_record(self, client_ip: str) -> RateLimitDecision:
        now = self._clock()

        # Clean global daily window
        self._global_day = self._clean(self._global_day, 86400.0, now)
        if len(self._global_day) >= self.global_requests_per_day:
            return RateLimitDecision(allowed=False, scope="global_day", retry_after=86400)

        # Clean IP minute window
        ip_min = self._clean(self._ip_minute.get(client_ip, []), 60.0, now)
        if len(ip_min) >= self.requests_per_minute:
            oldest = ip_min[0]
            retry_after = max(1, int(60.0 - (now - oldest)))
            return RateLimitDecision(allowed=False, scope="minute_per_ip", retry_after=retry_after)

        # Clean IP daily window
        ip_day = self._clean(self._ip_day.get(client_ip, []), 86400.0, now)
        if len(ip_day) >= self.requests_per_day_per_ip:
            oldest = ip_day[0]
            retry_after = max(1, int(86400.0 - (now - oldest)))
            return RateLimitDecision(allowed=False, scope="day_per_ip", retry_after=retry_after)

        # Record request
        ip_min.append(now)
        ip_day.append(now)
        self._global_day.append(now)

        self._ip_minute[client_ip] = ip_min
        self._ip_day[client_ip] = ip_day

        return RateLimitDecision(allowed=True)
