interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private requests: Map<string, RateLimitRecord> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(identifier: string): { allowed: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetInMs: this.windowMs,
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetInMs: Math.max(0, record.resetTime - now),
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetInMs: Math.max(0, record.resetTime - now),
    };
  }

  public reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter(
  parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || "10", 10),
  60000
);

export function isGenerationEnabled(): boolean {
  const flag = process.env.GENERATION_ENABLED;
  if (flag === undefined || flag === null) {
    return true;
  }
  return flag.toLowerCase() !== "false";
}

export class SimpleSemaphore {
  private maxConcurrency: number;
  private currentCount: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrency: number = 2) {
    this.maxConcurrency = maxConcurrency;
  }

  public async acquire(): Promise<() => void> {
    if (this.currentCount < this.maxConcurrency) {
      this.currentCount++;
      return () => this.release();
    }

    return new Promise((resolve) => {
      this.queue.push(() => {
        this.currentCount++;
        resolve(() => this.release());
      });
    });
  }

  private release(): void {
    this.currentCount--;
    if (this.queue.length > 0 && this.currentCount < this.maxConcurrency) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  public get activeCount(): number {
    return this.currentCount;
  }
}

export const globalSemaphore = new SimpleSemaphore(2);
