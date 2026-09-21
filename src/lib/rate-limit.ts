import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitScope = "login-ip" | "login-account" | "register" | "orders" | "uploads";
export interface RateLimitResult { allowed: boolean; retryAfterSeconds: number; reason?: "limit" | "configuration" | "unavailable" }

const policies = {
  "login-ip": { limit: 10, window: "10 m" },
  "login-account": { limit: 20, window: "10 m" },
  register: { limit: 5, window: "1 h" },
  orders: { limit: 8, window: "15 m" },
  uploads: { limit: 30, window: "10 m" },
} as const;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const distributedConfigured = Boolean(redisUrl && redisToken);
const production = process.env.NODE_ENV === "production";

const distributedLimiters = distributedConfigured
  ? Object.fromEntries(Object.entries(policies).map(([scope, policy]) => [scope, new Ratelimit({
      redis: new Redis({ url: redisUrl!, token: redisToken! }),
      limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
      prefix: `remaro:ratelimit:${scope}`,
      analytics: false,
      ephemeralCache: false,
      timeout: 2_000,
    })])) as Record<RateLimitScope, Ratelimit>
  : null;

// Development-only fallback. Production never reaches this local state.
const developmentWindows = new Map<string, { count: number; reset: number }>();

function windowMilliseconds(window: string) { const [amount, unit] = window.split(" "); return Number(amount) * (unit === "h" ? 3_600_000 : 60_000); }
function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function clientIp(request: Request) { const candidate=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??""; return isIP(candidate)?candidate:"unknown"; }

export function rateLimitKey(request: Request, scope: RateLimitScope, discriminator?: string) {
  const normalized=discriminator?.trim().toLowerCase().slice(0,320)??"";
  return `${scope}:${digest(`${clientIp(request)}:${normalized}`)}`;
}

export async function checkRateLimit(scope: RateLimitScope, identifier: string): Promise<RateLimitResult> {
  const policy=policies[scope];
  const fallbackRetry=Math.ceil(windowMilliseconds(policy.window)/1_000);
  if(distributedLimiters){try{const result=await distributedLimiters[scope].limit(identifier);if(result.reason==="timeout")return{allowed:false,retryAfterSeconds:30,reason:"unavailable"};return{allowed:result.success,retryAfterSeconds:Math.max(1,Math.ceil((result.reset-Date.now())/1_000)),reason:result.success?undefined:"limit"};}catch{return{allowed:false,retryAfterSeconds:30,reason:"unavailable"};}}
  if(production)return{allowed:false,retryAfterSeconds:60,reason:"configuration"};
  const now=Date.now(),current=developmentWindows.get(identifier);
  if(!current||current.reset<=now){developmentWindows.set(identifier,{count:1,reset:now+windowMilliseconds(policy.window)});return{allowed:true,retryAfterSeconds:fallbackRetry};}
  current.count+=1;const allowed=current.count<=policy.limit;return{allowed,retryAfterSeconds:Math.max(1,Math.ceil((current.reset-now)/1_000)),reason:allowed?undefined:"limit"};
}

export function rateLimitHeaders(result: RateLimitResult) { return { "Retry-After": String(result.retryAfterSeconds) }; }
