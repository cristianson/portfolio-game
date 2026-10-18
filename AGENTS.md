# Design District: Cristian Iordan's portfolio

A product designer's portfolio built as a small 3D open-world game in the style of GTA 3. You walk
down one city street as a low-poly Cristian; glowing markers open About Me and Case Studies, the
Built Projects building has a museum interior where each project hangs as a painting, and social
links lie on the street as spinning pickups. A plain-HTML copy of the whole portfolio is always in
the page for search engines, link previews and devices without WebGL.

Live at **https://www.cristianiordan.design** (the bare domain redirects there).

Start here: this file, then [README.md](README.md) (features, controls, file map) and
[docs/analytics.md](docs/analytics.md) (what is tracked and the private stats page).

## Keep the docs current

The docs are the owner's reference. **Every change that makes a doc wrong updates that doc in the
same commit:**

| If you change… | Update |
|---|---|
| Features, controls, the file layout, commands | `README.md` (Features, How to Play, Project Structure) and this file |
| How the game is put together, a recipe below, a gotcha you hit | this file |
| Anything tracked (`lib/analytics/`, `/api/hit`, data attributes on links), the database, the stats page | `docs/analytics.md` |
| Hosting, domains, environment variables, external services | this file (Hosting) and `docs/analytics.md` if it's about stats |

Before finishing a task, check the table; if nothing in the docs is affected, no change is needed.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**, package manager **pnpm**.
- **three.js 0.170** through **@react-three/fiber 9** for the 3D world. No 3D models or texture
  files: every mesh is built from primitives and every texture is painted on a `<canvas>` at
  runtime (`components/city/textures.ts`). The only images are the avatars and project covers in
  `public/`.
- **Tailwind CSS 4** for the HUD, panels and section pages; fonts Anton (`font-gta`) and
  Bowlby One SC (`font-hud`) from `next/font`. Icons from lucide-react plus `components/city/icons.tsx`.
- **Upstash Redis** (`@upstash/redis`) for our own analytics; **@vercel/analytics** also runs
  (page views only). `web-haptics` for vibration on phones.

## Hosting and deploy

- **Vercel**, project `v0-interactive-portfolio-game`, hobby plan. **A push to `main` deploys
  production**; other branches get preview deploys. There is no CI besides Vercel's build.
- Environment variables (set in Vercel, never in the repo): `STATS_KEY` (Production) for
  `/stats`, and the Upstash ones added by the integration: `KV_REST_API_URL`, `KV_REST_API_TOKEN`
  (+ `KV_URL`, `REDIS_URL`, `KV_REST_API_READ_ONLY_TOKEN`, unused), on Production and Preview.
- The repo is **public**: never commit keys, tokens or the stats link. `.env*.local` is ignored.
- `.nojekyll` and the ignored `out/` folder are leftovers from an old GitHub Pages deploy.

## Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000 ; local stats at /stats?key=dev (in-memory, no database needed)
pnpm lint
npx tsc --noEmit -p .   # ignore errors inside .next/ (stale route types from an old build)
pnpm build        # production build, also type-checks
```

`pnpm build` rewrites `next-env.d.ts` (`.next/dev/types` → `.next/types`); don't commit that change.

## How it's put together

Routes (`app/`):
- `/` → `app/(city)/page.tsx`: the static portfolio (`static-portfolio.tsx`, server-rendered) plus
  `GameLoader`, which mounts the client-only game when WebGL works and otherwise reveals the
  static copy (`html[data-fallback]`, styled in `app/(city)/city.css`).
- `/api/hit` (pings), `/stats` (private HTML page), `/api/stats` (raw JSON): see `docs/analytics.md`.
- `app/layout.tsx`: metadata, `<Tracking />` (our analytics, first in the body so it starts before
  the game reports anything) and Vercel `<Analytics />`.
- `/3d` and `/classic` redirect to `/` (`next.config.mjs`).

The game (`components/city/`). Every file opens with a comment saying what it does; the main ideas:

- **Data vs rendering.** Plain-data files describe the world; components render it.
  `content.ts` (all copy and links), `world.ts` (the street: buildings, zones, props, cars,
  pedestrian paths, colliders), `museum.ts` (the gallery: wall slots, spots, colliders, visitor
  routes). Rendering, collisions and the radar all read these, so moving something there moves it
  everywhere.
- **The store** (`store.ts`) is one mutable object shared by the render loop and the DOM HUD:
  player position, camera, input, what you're standing near. Per-frame values live there, not in
  React state; React state (in `index.tsx`) only holds rare changes. Phases: `title`, `play`,
  `panel` (a section page is open), `menu` (pause menu). Location: `street` or `gallery`; both
  stay mounted and only one is visible, so walking in and out is instant (fade in `index.tsx`).
- **Zones** (`world.ts` `ZONES`): `ABOUT`, `CASE_STUDIES`, `PROJECTS`, `SOCIALS`. Walking into
  a marker and pressing Enter opens a section page in `panel.tsx` (content from `sections.tsx`);
  `PROJECTS` is a room (`ROOM_ZONES`), so walking into its marker fades you into the gallery.
  Socials are found through the street pickups (`pickups.tsx`) or the pause menu.
- **Coordinates.** Street: Y up, the street runs along Z (north = +Z), road x ∈ [-5, 5],
  sidewalks x ∈ [5, 9]. Gallery: its own coordinates, 16 × 22 m hall, entrance wall at
  z = -11, centrepiece on the back wall at z = +11; walking in you face +z, so **+x is on your left**.
- **Visited sections** (stars, cash, MISSION PASSED) are saved in localStorage
  (`design-district-visited`).
- **Time and season** follow the visitor's own clock (`daylight.ts`, `season.ts`,
  `seasonal.tsx`): day/dusk/night, spring/summer/autumn/winter, Christmas 1 Dec–6 Jan.
- **Section pages** (`sections.tsx`) are shared by the game panel and the static portfolio, so
  copy changes show in both.

## Recipes

- **Change copy or links:** `components/city/content.ts` only.
- **Add a built project:** add it to `PROJECTS` in `content.ts` (**newest first**: the first one
  is the gallery's centrepiece). Give it a `cover`: a **1280 × 800 (16:10) WebP** in
  `public/projects/`, around 20–40 KB. Make covers with `sharp` (it's in `node_modules/.pnpm`);
  sharp runs `resize` before `extend` whatever order you chain them, so pad first into a buffer,
  then resize. Without a cover the painting shows a generated title card.
- **Gallery walls** (`museum.ts` `SLOTS`): projects fill the slots in order: centrepiece, then
  round the hall from the left of the door: left wall by the door, left wall at the back, right
  wall at the back, right wall by the door. The next free slot shows the **In progress** frame
  (sized to its sketch); any slot after it is bare wall with a **bench and a potted plant**
  (`BENCHES`, `URNS`). With 3 projects: Airbnb, Tickets, Draw a Run (centre), In progress, bench.
  When reordering, also check the visitors' routes, pilasters and the guard/guestbook positions.
- **Something new to track:** see "Common tasks" in `docs/analytics.md`. Outbound links get
  `{...trackAttrs("…_click", { … })}`; game moments call `trackEvent` / `trackOnce`.

## Testing in the browser

- `pnpm dev`, open `http://localhost:3000/?debug`, press Enter to start. `?debug` exposes the
  store as `window.__dd`, so you can teleport: `Object.assign(__dd.player, { x, z, heading })`,
  set `__dd.camYaw` (same as heading to look that way) and `__dd.snapCamera = true`.
- Into the gallery: teleport onto the Built Projects marker (`x: -7.3, z: -4`), wait ~3 s.
  Inside, **don't land on the exit marker** (`x: 0, z: -9.3`): it walks you straight out.
  Painting spots are 2.3 m in front of each painting.
- `?time=22:30` and `?date=2026-12-24` preview any moment (night, winter, Christmas).
- After changing textures or materials, **do a full reload**: hot reload can show a texture
  as a plain white plane.
- Our analytics run locally too (in memory); see the numbers at `/stats?key=dev`.

## Conventions

- Match the surrounding code: every file starts with a short block comment on what it is;
  comments explain why, not what. No Prettier config: keep the existing style and long lines.
- Keep the early-2000s look: low-poly primitives, small canvas textures, `MeshLambertMaterial`,
  shared materials, instancing for repeated small things.
- Mobile first: portrait layout, joystick, the ENTER button near markers; test both.
- Analytics stay cookie-less and never send anything identifying (see `docs/analytics.md`).
  The site has no privacy note yet: the owner chose not to add one for now.
- `Airbnb Listing Comparer.md` and `public transport tickets.md` are longer project write-ups
  kept as reference; the site doesn't read them.
- The owner (Cristian) writes in Romanian; answer in Romanian. Code, comments, commits and docs
  are in English.
