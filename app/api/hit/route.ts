// Pings from the browser (lib/analytics/track.ts). Answers at once; the counting happens after
// the response is sent, so a slow database never holds up the page.

import { after } from "next/server";
import { record } from "@/lib/analytics/record";

// Vercel sends the city URL-encoded ("S%C3%A3o%20Paulo")
const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return new Response(null, { status: 204 });
  const h = req.headers;
  const visit = {
    ua: h.get("user-agent") ?? "",
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || (h.get("x-real-ip") ?? ""),
    country: h.get("x-vercel-ip-country") ?? "",
    city: decode(h.get("x-vercel-ip-city") ?? ""),
    host: h.get("host") ?? "",
  };
  after(() => record(visit, body as Record<string, unknown>).catch((e) => console.error("analytics", e)));
  return new Response(null, { status: 204 });
}
