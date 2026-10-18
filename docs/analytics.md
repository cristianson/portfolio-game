# Analytics: what we track and how

Our own, built in, free: no cookies, no third-party scripts, no consent banner. The browser sends
small pings to `/api/hit`; the server counts them in an Upstash Redis database; the private
`/stats` page shows the numbers. Same approach as Draw a Run's stats page.

> Keep this file true: any change to what is tracked, how it is counted, the database or the
> stats page updates this file in the same commit.

Vercel Web Analytics (`<Analytics />` in `app/layout.tsx`) still runs alongside; it only counts
page views.

## Where to look

- **https://www.cristianiordan.design/stats?key=…** (the key is the `STATS_KEY` environment variable
  in Vercel; keep the link private). Wrong or missing key → "Not found". The page is `noindex`,
  `no-store`, `no-referrer`. Tabs: Today, 7, 30 or 90 days (`&range=`).
- **https://www.cristianiordan.design/api/stats?key=…&days=14** returns the raw daily counters as JSON
  (up to 120 days), for audits.
- Locally, `pnpm dev` then **http://localhost:3000/stats?key=dev** (without a database the
  numbers live in the dev server's memory and are gone when it restarts).

## Setup

Done on Oct 18, 2026, for the Vercel project `v0-interactive-portfolio-game`:

1. Vercel → Storage → **Upstash for Redis** (free plan), connected to the project on Production and Preview. It adds `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` (the code also accepts the `UPSTASH_REDIS_REST_*` names). Preview deploys
   write to the same database, so visits to preview links show up in the stats too.
2. Project → Settings → **Environment Variables** → `STATS_KEY` (a long random string, Secret)
   for Production.
3. Environment variables only reach new deploys: after changing one, redeploy. Without a
   database, production simply doesn't count anything.

## What the browser sends (`lib/analytics/track.ts`)

Every event and every allowed value is listed in `lib/analytics/events.ts`; the server ignores
anything else. Project, network, case study and company names come from `components/city/content.ts`,
so new projects are tracked without code changes.

| Ping | When | Details |
|---|---|---|
| `pageview` | After the page has been on screen for 3 s (background-tab time doesn't count), or at the first event | `ref` (the site the visitor came from), `src` (a link tag, see below) |
| `ready` | The 3D world finished loading | `ms` since the page started → bucket |
| `fallback` | The text version was shown instead of the game | `reason`: `no-webgl`, `crashed` (also when it never started) |
| `start` | Start on the title screen | — |
| `first_move` | First time the character moves | `input`: `keyboard`, `joystick` |
| `section_open` | About Me, Case Studies or Socials opened | `section`, `via`: `walk` (marker) or `menu` |
| `gallery_enter` | Into the Built Projects gallery | `via` |
| `gallery_exit` | Out of the gallery | `secs` inside → bucket |
| `painting_near` | Walked up to a project's painting (once per visit per project) | `project` |
| `soon_near`, `guestbook_near`, `guard_talk` | Walked up to the In progress frame, the guestbook, the guard (once per visit) | — |
| `pickup_near` | Found a social pickup on the street (once per visit per network) | `network` |
| `project_click` | Opened a project | `project`, `from`: `gallery`, `page`, `text` |
| `social_click` | Opened LinkedIn, X or GitHub | `network`, `from`: `pickup`, `guestbook`, `page`, `text` |
| `case_study_click` | Opened a case study | `study`, `from` |
| `job_click` | A company link on About Me | `company` |
| `menu_open` | Opened the pause menu | — |
| `explored` | First section reached on this visit (About, Case Studies, the gallery or a social pickup / page) | — |
| `outbound` | First link out on this visit | — |
| `session_end` | The visitor left (computers: the page went away; phones: the page was first hidden, since phones often close background tabs silently) | `secs` visible → bucket, `sections` reached (0–4) |

Links report clicks through data attributes (`trackAttrs` in `track.ts`, one document-wide
listener), so the game's cards, the section pages and the text version all count the same way.
`from: page` becomes `text` when the text version is showing. Pressing Enter at a painting, the
guestbook or a pickup reports the same events from `components/city/index.tsx`.

**Opt out (our own devices):** open `www.cristianiordan.design/?notrack` once per device and browser;
it is remembered in localStorage and nothing is sent any more. `?track` undoes it.

**Tagged links:** `www.cristianiordan.design/?ref=linkedin` (or `?utm_source=`) records the source as
"linkedin (tagged link)" and is removed from the address bar. Useful because many apps don't
tell sites where a visitor came from (they show as Direct).

## What the server counts (`lib/analytics/record.ts`)

1. **Left out:** bots that say so in their user agent, and requests without one (counted apart
   as "Bots"). Vercel doesn't say which network a visit comes from, so unlike Draw a Run, server
   networks can't be filtered; the 3 seconds on screen keep most scanners out.
2. **Visitors:** a visitor is a hash of (a random salt for the day + IP + user agent). The salt
   expires when the day ends, so nobody can be followed across days.
3. **Events:** each known event adds to its total, and once per visitor per day to "people" (and
   to "people_mobile" on a phone). Each detail adds to its total, and for list details (which
   project, network, section…) once per visitor per day to its people count.
4. **First visit of the day:** the hour (Romania time), the source, the country and city (Vercel's
   approximate location of the connection).

## Database (Upstash Redis, `lib/analytics/store.ts`)

| Key | Holds | Kept |
|---|---|---|
| `c:<day>` | Hash of daily counters, `<metric>\|<key>` → n. Metrics: `views`, `visitors`, `mobile`, `hour`, `ref`, `country`, `city` (`City\|CC`), `ignored`, `event`, `people`, `people_mobile`, `d:<event>.<detail>` (totals), `p:<event>.<detail>` (people) | Forever (the page shows 90 days) |
| `v:<day>` | Set of today's visitor hashes, and `hash:event…` to count people | Expires an hour after the day ends |
| `salt:<day>` | Today's random salt | Expires an hour after the day ends |

Each ping costs a handful of Redis commands, and the stats page one per day shown (90): far below
the free plan's monthly limit for a portfolio's traffic.

## The stats page (`lib/analytics/stats-page.ts`, served by `app/stats/route.ts`)

Key numbers (visitors, page views, % on phones, % who started the game, reached a section,
clicked a link out, stayed a minute or more, got the text version), the daily chart, the funnel
(visited → started → moved → reached a section → clicked a link out, phones and computers side by
side), sections reached and how (walked or menu), time on the site and in the gallery, the
gallery (each project: walked up vs opened; the In progress frame, guestbook, guard), socials
(found the pickup vs opened, and from where), case studies and company links, loading time and
the text version, keyboard vs joystick, hours, sources, countries, cities, and what was left out.

## Common tasks

- **Track something new:** add it to `EVENTS` in `lib/analytics/events.ts` (with its details),
  send it with `trackEvent` / `trackOnce` / `trackAttrs`, show it in `stats-page.ts`, update this
  file.
- **New stats key:** change `STATS_KEY` in Vercel and redeploy.
- **Reset the stats:** delete the `c:*` keys in the Upstash console (Data Browser).
