const canonicalSiteUrl = "https://remaro.asia";

export const siteUrl = canonicalSiteUrl;
export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString();
