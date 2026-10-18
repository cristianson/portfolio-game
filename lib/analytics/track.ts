/**
 * Sends counts to our own server (/api/hit). No cookies, no third parties. See docs/analytics.md.
 *
 * To keep the numbers about real visitors:
 *  - our own devices can opt out: open the site once with ?notrack (?track undoes it);
 *  - shared links can say where they were posted: cristianiordan.design/?ref=linkedin (many apps
 *    don't tell sites where a visitor came from);
 *  - a visit only counts once the page has been on screen for a few seconds (bots leave at once);
 *  - the server also ignores bots that say so (lib/analytics/record.ts).
 *
 * Links are tracked by their data attributes (see `trackAttrs`), so the game, the section pages
 * and the text version all report clicks the same way.
 */

import { MOBILE_UA, type EventDetails, type EventName } from "./events";

const OPT_OUT_KEY = "portfolio:notrack";
/** Milliseconds the page must be on screen before the visit counts. */
const SEEN_MS = 3000;

let off = false;
let tag = "";
let started = false;
let viewSent = false;
let sessionSent = false;
/** Visible time so far, and since when the page has been visible (0 while hidden). */
let visibleMs = 0;
let visibleSince = 0;
const sent = new Set<string>();
const sections = new Set<string>();

function optedOut(url: URL) {
  try {
    if (url.searchParams.has("notrack")) localStorage.setItem(OPT_OUT_KEY, "1");
    if (url.searchParams.has("track")) localStorage.removeItem(OPT_OUT_KEY);
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function send(body: Record<string, string>) {
  if (off) return;
  try {
    const data = JSON.stringify(body);
    if (!navigator.sendBeacon?.("/api/hit", new Blob([data], { type: "application/json" }))) {
      fetch("/api/hit", { method: "POST", body: data, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* analytics must never break the site */
  }
}

function sendView() {
  if (viewSent || off) return;
  viewSent = true;
  send({ type: "pageview", ref: document.referrer, src: tag });
}

const visibleSeconds = () => (visibleMs + (visibleSince ? performance.now() - visibleSince : 0)) / 1000;

/**
 * Once per visit, when the visitor leaves. On computers that's when the page goes away (switching
 * tabs and coming back is the same visit). Phones often kill a background tab without telling the
 * page, so there it's the first time the page is hidden.
 */
function sendSessionEnd() {
  if (sessionSent || !viewSent) return;
  sessionSent = true;
  trackEvent("session_end", { secs: Math.round(visibleSeconds()), sections: sections.size });
}

export function trackEvent(name: EventName, details: EventDetails = {}) {
  if (off || !started) return;
  sendView(); // someone using the site is a visitor, even within the first seconds
  const body: Record<string, string> = { type: "event", name };
  for (const [k, v] of Object.entries(details)) body[k] = String(v);
  send(body);
}

/** Like trackEvent, but only the first time on this visit for the same `key` (by default: name and details). */
export function trackOnce(name: EventName, details: EventDetails = {}, key = `${name}:${JSON.stringify(details)}`) {
  if (sent.has(key)) return;
  sent.add(key);
  trackEvent(name, details);
}

/** One of the four sections (About, Case studies, Built projects, Socials) was reached. */
export function sectionReached(id: string) {
  sections.add(id);
  trackOnce("explored");
}

/** Data attributes that make a link report a click: `<a {...trackAttrs("project_click", { … })}>`. */
export function trackAttrs(name: EventName, details: EventDetails) {
  const attrs: Record<string, string> = { "data-track": name };
  for (const [k, v] of Object.entries(details)) attrs[`data-track-${k}`] = String(v);
  return attrs;
}

/** Reports a link out (and, the first time, that the visitor left for a link at all). */
export function trackLink(name: EventName, details: EventDetails) {
  // Links on the section pages also show in the text version: say which one it was
  const fallback = document.documentElement.hasAttribute("data-fallback");
  trackEvent(name, fallback && details.from === "page" ? { ...details, from: "text" } : details);
  trackOnce("outbound");
}

function onClick(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.("a[data-track]") as HTMLAnchorElement | null;
  if (!a) return;
  const details: EventDetails = {};
  for (const [k, v] of Object.entries(a.dataset)) {
    if (k.startsWith("track") && k !== "track" && v !== undefined) details[k[5].toLowerCase() + k.slice(6)] = v;
  }
  trackLink(a.dataset.track as EventName, details);
}

/** Starts tracking for this page load: the visit, link clicks and the end of the visit. */
export function startTracking() {
  if (started) return;
  started = true;
  const url = new URL(location.href);
  off = optedOut(url);
  tag = url.searchParams.get("ref") ?? url.searchParams.get("utm_source") ?? "";
  // Tidy the address bar (other parameters, like ?debug, stay as they were)
  const params = ["notrack", "track", "ref", "utm_source", "utm_medium", "utm_campaign"];
  if (params.some((p) => url.searchParams.has(p))) {
    const kept = url.search
      .slice(1)
      .split("&")
      .filter((part) => part && !params.includes(decodeURIComponent(part.split("=")[0])));
    history.replaceState(history.state, "", url.pathname + (kept.length ? `?${kept.join("&")}` : "") + url.hash);
  }
  if (off) return;

  document.addEventListener("click", onClick, true);
  document.addEventListener("auxclick", onClick, true);

  const phone = MOBILE_UA.test(navigator.userAgent);
  // The visit counts after SEEN_MS of visible time (time in a background tab doesn't count)
  let timer = 0;
  if (document.visibilityState === "visible") visibleSince = performance.now();
  const arm = () => {
    clearTimeout(timer);
    if (visibleSince && !viewSent) timer = window.setTimeout(sendView, Math.max(0, SEEN_MS - visibleMs));
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") visibleSince = performance.now();
    else {
      if (visibleSince) visibleMs += performance.now() - visibleSince;
      visibleSince = 0;
      if (phone) sendSessionEnd();
    }
    arm();
  });
  window.addEventListener("pagehide", sendSessionEnd);
  arm();
}
