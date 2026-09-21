function originFrom(protocol: string, host: string | null) {
  if (!host || (protocol !== "http:" && protocol !== "https:")) return null;
  try {
    return new URL(`${protocol}//${host}`).origin;
  } catch {
    return null;
  }
}

export function isSameOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return true;

  try {
    const requestUrl = new URL(request.url);
    const requestOrigin = new URL(originHeader).origin;
    const allowedOrigins = new Set([requestUrl.origin]);

    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (configuredSiteUrl) allowedOrigins.add(new URL(configuredSiteUrl).origin);

    // In development Next may construct request.url with its bind/interface host.
    // The direct Host header still represents the browser's actual request target.
    if (process.env.NODE_ENV !== "production") {
      const developmentOrigin = originFrom(requestUrl.protocol, request.headers.get("host"));
      if (developmentOrigin) allowedOrigins.add(developmentOrigin);
    }

    // Vercel owns and normalizes these proxy headers. Do not trust them elsewhere.
    if (process.env.VERCEL === "1") {
      const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? null;
      const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
      const vercelOrigin = originFrom(`${forwardedProtocol}:`, forwardedHost);
      if (vercelOrigin) allowedOrigins.add(vercelOrigin);
    }

    return allowedOrigins.has(requestOrigin);
  } catch {
    return false;
  }
}
