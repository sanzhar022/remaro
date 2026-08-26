export function withVerifiedPostgresTls(connectionString: string): string {
  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}
