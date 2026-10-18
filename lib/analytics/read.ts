// Shared by the stats page and the stats JSON.

import { timingSafeEqual } from "node:crypto";

/** True when the address carries the right ?key= (STATS_KEY; "dev" works locally when it isn't set). */
export function statsKeyOk(url: URL) {
  const expected = process.env.STATS_KEY ?? (process.env.NODE_ENV !== "production" ? "dev" : "");
  const given = Buffer.from(url.searchParams.get("key") ?? "");
  const want = Buffer.from(expected);
  return want.length > 0 && given.length === want.length && timingSafeEqual(given, want);
}

/** The last `n` days (UTC), oldest first, as "YYYY-MM-DD". */
export function lastDays(n: number) {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => new Date(now - (n - 1 - i) * 864e5).toISOString().slice(0, 10));
}
