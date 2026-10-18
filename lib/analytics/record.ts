/**
 * Counts one ping from the browser (see docs/analytics.md). Cookie-less: a visitor is a hash of
 * (a random salt for the day + IP + user agent); the salt is gone when the day ends, so nobody
 * can be followed across days.
 */

import { detailsOf, isEvent, MOBILE_UA } from "./events";
import { store } from "./store";

export interface Visit {
  ua: string;
  ip: string;
  /** Vercel's location for the connection (approximate). */
  country: string;
  city: string;
  host: string;
}

export const today = () => new Date().toISOString().slice(0, 10);

/** The hour in Romania (where most visitors are), "00"–"23". */
const localHour = (date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Europe/Bucharest" }).format(date);

async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|httpclient|go-http/i;

// Friendly names for common sources (sites send many variants: www., m., l., country domains).
const SOURCE_NAMES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(facebook\.com|fb\.me|messenger\.com)$/, "Facebook"],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "X"],
  [/(^|\.)(threads\.net|threads\.com)$/, "Threads"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)(read\.cv|dribbble\.com|behance\.net)$/, "Portfolio sites"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/(^|\.)claude\.ai$/, "Claude"],
];

/** Where a visit came from: a tagged link (?ref=linkedin), else the site the visitor clicked a link on. */
function sourceOf(visit: Visit, ref: unknown, src: unknown) {
  const tag = String(src ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);
  if (tag) return `${tag} (tagged link)`;
  try {
    if (ref) {
      const host = new URL(String(ref)).hostname.replace(/^www\./, "");
      if (host && host !== visit.host.replace(/^www\./, "")) return SOURCE_NAMES.find(([re]) => re.test(host))?.[1] ?? host;
    }
  } catch {
    /* not a URL */
  }
  return "Direct";
}

const clean = (s: string) => s.replace(/\|/g, " ").slice(0, 60);

export async function record(visit: Visit, body: Record<string, unknown>) {
  if (!store) return;
  const day = today();
  if (BOTS.test(visit.ua) || !visit.ua) {
    // Counted apart, so the stats page can say how much was left out
    if (body.type !== "event") await store.bump(day, ["ignored|Bots"]);
    return;
  }
  const id = await sha((await store.salt(day)) + visit.ip + visit.ua);
  const mobile = MOBILE_UA.test(visit.ua);

  if (body.type === "event") {
    const name = String(body.name ?? "");
    if (!isEvent(name)) return;
    // Totals, plus how many different people did it today, and how many of those were on a phone
    const fields = [`event|${name}`];
    if (await store.firstToday(day, `${id}:${name}`)) {
      fields.push(`people|${name}`);
      if (mobile) fields.push(`people_mobile|${name}`);
    }
    // Details: totals for each, and different people for each value of a list (which project, which network…)
    for (const [field, value, isList] of detailsOf(name, body)) {
      fields.push(`d:${name}.${field}|${value}`);
      if (isList && (await store.firstToday(day, `${id}:${name}.${field}:${value}`))) fields.push(`p:${name}.${field}|${value}`);
    }
    await store.bump(day, fields);
    return;
  }

  if (body.type !== "pageview") return;
  const fields = ["views"];
  if (await store.firstToday(day, id)) {
    fields.push("visitors", `hour|${localHour()}`, `ref|${clean(sourceOf(visit, body.ref, body.src))}`);
    if (mobile) fields.push("mobile");
    if (visit.country) fields.push(`country|${clean(visit.country)}`);
    if (visit.country && visit.city) fields.push(`city|${clean(visit.city)}|${clean(visit.country)}`);
  }
  await store.bump(day, fields);
}
