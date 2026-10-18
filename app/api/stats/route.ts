// Raw daily counters as JSON, for audits and exports: /api/stats?key=…&days=14 (up to 120 days).

import { lastDays, statsKeyOk } from "@/lib/analytics/read";
import { today } from "@/lib/analytics/record";
import { store } from "@/lib/analytics/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!statsKeyOk(url)) return new Response("Not found", { status: 404 });
  const days = Math.min(120, Math.max(1, Number(url.searchParams.get("days")) || 14));
  const list = lastDays(days);
  const counts = store ? await store.counters(list) : {};
  return Response.json(
    { from: list[0], to: today(), counts },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
