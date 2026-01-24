# app/utils/rate_limiter.py
import time
from collections import defaultdict, deque

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self.storage = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.time()
        q = self.storage[key]

        # Remove old requests
        while q and q[0] <= now - self.window:
            q.popleft()

        if len(q) >= self.max_requests:
            return False

        q.append(now)
        return True
