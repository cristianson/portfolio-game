// The private stats page: /stats?key=… (the key is the STATS_KEY environment variable).
// Wrong or missing key → "Not found". See docs/analytics.md.

import { lastDays, statsKeyOk } from "@/lib/analytics/read";
import { today } from "@/lib/analytics/record";
import { renderStats, STATS_RANGES } from "@/lib/analytics/stats-page";
import { store, storeKind } from "@/lib/analytics/store";

export const dynamic = "force-dynamic";

/** The page covers the last 90 days. */
const SPAN = 90;

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!statsKeyOk(url)) return new Response("Not found", { status: 404 });
  const asked = Number(url.searchParams.get("range"));
  const range = STATS_RANGES.includes(asked) ? asked : 7;
  const note =
    storeKind === "memory"
      ? "Local test data: no database connected, so these numbers live in the dev server's memory."
      : storeKind === "none"
        ? "No database connected yet: add Upstash Redis to the project in Vercel (see docs/analytics.md)."
        : "";
  const counters = store ? await store.counters(lastDays(SPAN)) : {};
  return new Response(renderStats(counters, today(), SPAN, range, note), {
    // Private page: never indexed or cached, and its address (with the key) is never passed on
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
