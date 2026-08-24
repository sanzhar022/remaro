import "server-only";
export interface RateLimitResult { allowed: boolean; retryAfterSeconds?: number }
export interface RateLimiter { check(key: string): Promise<RateLimitResult> }
class NoopRateLimiter implements RateLimiter { async check() { return { allowed: true }; } }
// Replace with a distributed Redis/Upstash adapter in production. In-memory state is intentionally avoided.
export const rateLimiter: RateLimiter = new NoopRateLimiter();
export const rateLimitKey = (request: Request, scope: string) => `${scope}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`;
