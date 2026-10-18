/**
 * What the portfolio reports to /api/hit, shared by the browser (track.ts), the server
 * (record.ts) and the stats page (stats-page.ts), so names and labels always match.
 * See docs/analytics.md. Anything not listed here is ignored by the server.
 */

import { CASE_STUDIES, JOBS, PROJECTS, SOCIALS } from "@/components/city/content";

/** [upper bound, label]: a number is counted in the first bucket it doesn't exceed. */
export type Buckets = readonly (readonly [number, string])[];

export const LOAD_BUCKETS: Buckets = [
  [2000, "under 2 s"],
  [5000, "2–5 s"],
  [10000, "5–10 s"],
  [Infinity, "10 s or more"],
];
export const STAY_BUCKETS: Buckets = [
  [15, "under 15 s"],
  [60, "15 s–1 min"],
  [180, "1–3 min"],
  [Infinity, "3 min or more"],
];
export const SESSION_BUCKETS: Buckets = [
  [30, "under 30 s"],
  [60, "30 s–1 min"],
  [180, "1–3 min"],
  [600, "3–10 min"],
  [Infinity, "10 min or more"],
];

export const SECTIONS = { about: "About Me", case_studies: "Case Studies", socials: "Socials" } as const;
export const VIA = { walk: "Walked to the marker", menu: "Pause menu" } as const;
export const LINK_FROM = {
  gallery: "Gallery card",
  pickup: "Street pickup",
  guestbook: "Guestbook",
  page: "Section page",
  text: "Text version",
} as const;
export const FALLBACK_REASONS = { "no-webgl": "No WebGL", crashed: "Crashed or never started" } as const;
export const INPUTS = { keyboard: "Keyboard", joystick: "Joystick" } as const;

/** A detail is either one of a fixed list of values, or a number counted in buckets. */
type Detail = { values: readonly string[] } | { buckets: Buckets };

const oneOf = (values: readonly string[]): Detail => ({ values });
const inBuckets = (buckets: Buckets): Detail => ({ buckets });

const project = oneOf(PROJECTS.map((p) => p.title));
const network = oneOf(SOCIALS.map((s) => s.name));

export const EVENTS = {
  /** The 3D world finished loading (ms since the page started). */
  ready: { ms: inBuckets(LOAD_BUCKETS) },
  /** The text version was shown instead of the game. */
  fallback: { reason: oneOf(Object.keys(FALLBACK_REASONS)) },
  /** Pressed Start on the title screen. */
  start: {},
  /** First time the character moved. */
  first_move: { input: oneOf(Object.keys(INPUTS)) },
  /** About Me, Case Studies or Socials opened. */
  section_open: { section: oneOf(Object.keys(SECTIONS)), via: oneOf(Object.keys(VIA)) },
  /** Walked into the Built Projects gallery. */
  gallery_enter: { via: oneOf(Object.keys(VIA)) },
  /** Left the gallery, with the time spent inside. */
  gallery_exit: { secs: inBuckets(STAY_BUCKETS) },
  /** Walked up to a project's painting (its card appeared). */
  painting_near: { project },
  soon_near: {},
  guestbook_near: {},
  guard_talk: {},
  /** Found a social pickup on the street. */
  pickup_near: { network },
  project_click: { project, from: oneOf(Object.keys(LINK_FROM)) },
  social_click: { network, from: oneOf(Object.keys(LINK_FROM)) },
  case_study_click: { study: oneOf(CASE_STUDIES.map((c) => c.company)), from: oneOf(Object.keys(LINK_FROM)) },
  job_click: { company: oneOf(JOBS.map((j) => j.company)) },
  menu_open: {},
  /** First section reached on this visit (any of the four). */
  explored: {},
  /** First link out on this visit (project, case study, social or job). */
  outbound: {},
  /** The visitor left: visible time on the page and how many of the four sections they reached. */
  session_end: { secs: inBuckets(SESSION_BUCKETS), sections: oneOf(["0", "1", "2", "3", "4"]) },
} satisfies Record<string, Record<string, Detail>>;

export type EventName = keyof typeof EVENTS;

/** Details an event may carry (all sent as strings or numbers). */
export type EventDetails = Record<string, string | number>;

export const bucketOf = (n: number, buckets: Buckets) => buckets.find(([max]) => n <= max)?.[1] ?? buckets[buckets.length - 1][1];

export const isEvent = (name: string): name is EventName => Object.hasOwn(EVENTS, name);

/**
 * The details of an event the server keeps: [field, value, isList] for each known field whose
 * value is allowed. Numbers come back as their bucket's label, never as the raw value.
 */
export function detailsOf(name: EventName, body: Record<string, unknown>): [string, string, boolean][] {
  const out: [string, string, boolean][] = [];
  for (const [field, detail] of Object.entries(EVENTS[name]) as [string, Detail][]) {
    const raw = body[field];
    if (raw === undefined || raw === null || raw === "") continue;
    if ("values" in detail) {
      const value = String(raw);
      if (detail.values.includes(value)) out.push([field, value, true]);
    } else {
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) out.push([field, bucketOf(n, detail.buckets), false]);
    }
  }
  return out;
}

export const MOBILE_UA = /mobile|android|iphone/i;
