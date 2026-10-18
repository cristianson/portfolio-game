/**
 * Renders the private /stats page from the daily counters (see docs/analytics.md). Same look as
 * Draw a Run's stats page. `span` days are loaded (the daily chart); `range` days (1, 7, 30 or 90)
 * feed everything else.
 */

import { CASE_STUDIES, JOBS, PROJECTS, SOCIALS } from "@/components/city/content";
import { FALLBACK_REASONS, INPUTS, LINK_FROM, LOAD_BUCKETS, SESSION_BUCKETS, STAY_BUCKETS, VIA, type Buckets } from "./events";

type Day = Record<string, number>;

const esc = (s: unknown) => String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

const RANGES: [number, string][] = [
  [1, "Today"],
  [7, "7 days"],
  [30, "30 days"],
  [90, "90 days"],
];

export const STATS_RANGES = RANGES.map(([r]) => r);

/** The counters of one day, grouped: "metric|key" → { metric: { key: n } }; plain fields stay as numbers. */
function group(row: Day) {
  const out: Record<string, Record<string, number>> = {};
  for (const [field, n] of Object.entries(row)) {
    const at = field.indexOf("|");
    if (at < 0) (out[""] ??= {})[field] = n;
    else (out[field.slice(0, at)] ??= {})[field.slice(at + 1)] = n;
  }
  return out;
}

export function renderStats(counters: Record<string, Day>, todayStr: string, span: number, range: number, note = "") {
  const days: [string, ReturnType<typeof group>][] = [];
  const end = new Date(`${todayStr}T00:00:00Z`);
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 864e5).toISOString().slice(0, 10);
    days.push([d, group(counters[d] ?? {})]);
  }
  const plainOf = (b: ReturnType<typeof group>, k: string) => b[""]?.[k] ?? 0;
  const period = days.slice(-range);
  const sum = (k: string) => period.reduce((s, [, b]) => s + plainOf(b, k), 0);
  /** Totals of one counter map (e.g. "people") over the period. */
  const total = (metric: string) => {
    const out: Record<string, number> = {};
    for (const [, b] of period) for (const [k, v] of Object.entries(b[metric] ?? {})) out[k] = (out[k] ?? 0) + v;
    return out;
  };
  const sorted = (obj: Record<string, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1]);
  const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const periodLabel = range === 1 ? "today" : `last ${range} days`;

  let regionName = (c: string) => c;
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    regionName = (c) => names.of(c) ?? c;
  } catch {
    /* keep codes */
  }

  const visitors = sum("visitors");
  const mobile = sum("mobile");
  const desktop = visitors - mobile;
  const E = total("event");
  const P = total("people");
  const PM = total("people_mobile");
  /** Different people per value of an event's detail, e.g. people("project_click", "project"). */
  const people = (event: string, field: string) => total(`p:${event}.${field}`);
  /** Totals per value of an event's detail. */
  const counts = (event: string, field: string) => total(`d:${event}.${field}`);

  // ---- key numbers
  const sessions = counts("session_end", "secs");
  const allSessions = Object.values(sessions).reduce((a, b) => a + b, 0);
  const longSessions = SESSION_BUCKETS.slice(2).reduce((t, [, l]) => t + (sessions[l] ?? 0), 0);
  const keys: [string, string | number, string][] = [
    ["Visitors", visitors, ""],
    ["Page views", sum("views"), ""],
    ["On phones", `${pct(mobile, visitors)}%`, ""],
    ["Started the game", `${pct(P.start ?? 0, visitors)}%`, "of visitors"],
    ["Reached a section", `${pct(P.explored ?? 0, visitors)}%`, "of visitors"],
    ["Clicked a link out", `${pct(P.outbound ?? 0, visitors)}%`, "project, case study, social or job"],
    ["Stayed 1 min or more", `${pct(longSessions, allSessions)}%`, "of visits"],
    ["Text version", `${pct(P.fallback ?? 0, visitors)}%`, "no 3D (no WebGL or a crash)"],
  ];
  const keyCards = keys
    .map(([label, value, note]) => `<div class="card"><div class="mono">${label}</div><div class="big">${value}</div>${note ? `<div class="note">${note}</div>` : ""}</div>`)
    .join("");

  // ---- daily chart (always the whole span)
  const max = Math.max(1, ...days.map(([, b]) => plainOf(b, "visitors")));
  const W = 600;
  const H = 140;
  const bw = W / days.length;
  const gap = Math.min(2, bw * 0.18);
  const dayLabel = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const firstInRange = days.length - range;
  const bars = days
    .map(([d, b], i) => {
      const v = plainOf(b, "visitors");
      const h = Math.max(v ? 2 : 0, (v / max) * (H - 20));
      const x = i * bw;
      const tip = `${dayLabel(d)}|${plural(v, "visitor", "visitors")} · ${plural(plainOf(b, "views"), "view", "views")}`;
      return `<g class="day${i >= firstInRange ? " in" : ""}" data-tip="${esc(tip)}" data-x="${((x + bw / 2) / W).toFixed(4)}" tabindex="0"><rect class="hit" x="${x.toFixed(1)}" y="0" width="${bw.toFixed(1)}" height="${H}" fill="transparent"/><rect class="bar" x="${(x + gap).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${(bw - 2 * gap).toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(2, bw / 4).toFixed(1)}"/></g>`;
    })
    .join("");

  // ---- funnel, with phones and computers side by side
  const steps: [string, number, number][] = [
    ["Visited the site", visitors, mobile],
    ["Pressed Start", P.start ?? 0, PM.start ?? 0],
    ["Moved around", P.first_move ?? 0, PM.first_move ?? 0],
    ["Reached a section", P.explored ?? 0, PM.explored ?? 0],
    ["Clicked a link out", P.outbound ?? 0, PM.outbound ?? 0],
  ];
  const funnel = `<table class="funnel"><thead><tr><th>Step</th><th>People</th><th>% of visitors</th><th>Phones</th><th>Computers</th></tr></thead><tbody>${steps
    .map(([label, n, m], i) => {
      const w = visitors ? Math.min(100, (100 * n) / visitors) : 0;
      const cell = (x: number, d: number) => (i ? `${pct(x, d)}%` : x);
      return `<tr><td><span>${label}</span><span class="meter"><i style="width:${w}%"></i></span></td><td>${n}</td><td>${i ? `${pct(n, visitors)}%` : "100%"}</td><td>${cell(m, mobile)}</td><td>${cell(n - m, desktop)}</td></tr>`;
    })
    .join("")}</tbody></table>`;

  // ---- bar lists
  const barList = (rows: [string, number][], empty = "Nothing yet") => {
    const all = rows.reduce((t, [, n]) => t + n, 0);
    if (!all) return `<p class="muted">${empty}</p>`;
    const top = Math.max(...rows.map(([, n]) => n));
    return `<div class="bars">${rows
      .map(([label, n]) => `<div class="b"><span class="l">${esc(label)}</span><span class="t"><i style="width:${(100 * n) / top}%"></i></span><span class="n">${n}<small>${pct(n, all)}%</small></span></div>`)
      .join("")}</div>`;
  };
  const inBuckets = (obj: Record<string, number>, buckets: Buckets) => buckets.map(([, l]) => [l, obj[l] ?? 0] as [string, number]);
  const labelled = (obj: Record<string, number>, names: Record<string, string>) => Object.entries(names).map(([k, l]) => [l, obj[k] ?? 0] as [string, number]);
  /** A table of rows with a "reached" and a "clicked" count, and the share who clicked. */
  const pairTable = (head: [string, string, string], rows: [string, number, number][]) =>
    `<table><thead><tr><th>${head[0]}</th><th>${head[1]}</th><th>${head[2]}</th><th>%</th></tr></thead><tbody>${rows
      .map(([label, a, b]) => `<tr><td>${esc(label)}</td><td>${a}</td><td>${b}</td><td>${a ? `${pct(b, a)}%` : "–"}</td></tr>`)
      .join("")}</tbody></table>`;

  // ---- sections
  const opened = people("section_open", "section");
  const sectionRows: [string, number][] = [
    ["About Me", opened.about ?? 0],
    ["Case Studies", opened.case_studies ?? 0],
    ["Built Projects (gallery)", P.gallery_enter ?? 0],
    ["Socials (found a pickup)", P.pickup_near ?? 0],
    ["Socials (page, from the menu)", opened.socials ?? 0],
  ];
  const via = counts("section_open", "via");
  const galleryVia = counts("gallery_enter", "via");
  const viaRows = Object.entries(VIA).map(([k, l]) => [l, (via[k] ?? 0) + (galleryVia[k] ?? 0)] as [string, number]);

  // ---- gallery
  const near = people("painting_near", "project");
  const clicked = people("project_click", "project");
  const projectRows = PROJECTS.map((p) => [p.title, near[p.title] ?? 0, clicked[p.title] ?? 0] as [string, number, number]);
  const socialFrom = people("social_click", "from");
  const galleryExtras: [string, number][] = [
    ["Looked at the In progress frame", P.soon_near ?? 0],
    ["Walked up to the guestbook", P.guestbook_near ?? 0],
    ["Signed it (opened LinkedIn)", socialFrom.guestbook ?? 0],
    ["Talked to the guard", P.guard_talk ?? 0],
  ];

  // ---- socials
  const found = people("pickup_near", "network");
  const openedSocial = people("social_click", "network");
  const socialRows = SOCIALS.map((s) => [s.name, found[s.name] ?? 0, openedSocial[s.name] ?? 0] as [string, number, number]);

  // ---- case studies and jobs
  const studies = people("case_study_click", "study");
  const jobs = people("job_click", "company");

  // ---- hours (Romania time)
  const hours = total("hour");
  const hMax = Math.max(1, ...Object.values(hours));
  const hourBars = Array.from({ length: 24 }, (_, h) => {
    const k = String(h).padStart(2, "0");
    const n = hours[k] ?? 0;
    const bh = Math.max(n ? 2 : 0, (n / hMax) * 70);
    return `<g class="day" data-tip="${k}:00–${k}:59|${plural(n, "visitor", "visitors")}" data-x="${((h + 0.5) / 24).toFixed(4)}" tabindex="0"><rect class="hit" x="${h * 25}" y="0" width="25" height="80" fill="transparent"/><rect class="bar" x="${h * 25 + 3}" y="${80 - bh}" width="19" height="${bh}" rx="2"/></g>`;
  }).join("");

  // ---- places and sources
  const list = (rows: [string, number][], empty: string) =>
    rows.length ? `<ul>${rows.map(([k, v]) => `<li><span>${esc(k)}</span><b>${v}</b></li>`).join("")}</ul>` : `<p class="muted">${empty}</p>`;
  const referrers = sorted(total("ref")).slice(0, 8);
  const countries = sorted(total("country"))
    .slice(0, 10)
    .map(([c, n]) => [regionName(c), n] as [string, number]);
  const cities = sorted(total("city"))
    .slice(0, 12)
    .map(([k, n]) => {
      const [city, cc] = k.split("|");
      return [cc ? `${city}, ${regionName(cc)}` : city, n] as [string, number];
    });
  const ignored = sorted(total("ignored"));

  const totals = [
    plural(E.section_open ?? 0, "section opened", "sections opened"),
    plural(E.gallery_enter ?? 0, "gallery visit", "gallery visits"),
    plural(E.project_click ?? 0, "project click", "project clicks"),
    plural(E.social_click ?? 0, "social click", "social clicks"),
    plural(E.case_study_click ?? 0, "case study opened", "case studies opened"),
  ].join(" · ");

  const tabs = RANGES.map(([r, label]) => `<button type="button" data-range="${r}" class="${r === range ? "on" : ""}">${label}</button>`).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portfolio stats</title><meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
:root{--bg:#EDEAE4;--card:#F6F4F0;--ink:#1B1A18;--muted:#8A857C;--line:#DDD8CF}
@media (prefers-color-scheme:dark){:root{--bg:#161513;--card:#201F1C;--ink:#F1EEE8;--muted:#8F8A80;--line:#2E2C28}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 Inter,system-ui,sans-serif}
main{max-width:860px;margin:0 auto;padding:40px 16px 64px}
h1{font:400 44px/1 'Instrument Serif',serif;margin:0}
.mono{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.top{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
.tabs{display:flex;gap:4px;padding:4px;background:var(--card);border-radius:999px}
.tabs button{font:400 12px 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:transparent;border:0;border-radius:999px;padding:8px 12px;cursor:pointer}
.tabs button.on{background:var(--ink);color:var(--card)}
.banner{background:var(--card);border-radius:16px;padding:12px 16px;margin-top:20px;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:24px 0 12px}
.card{background:var(--card);border-radius:20px;padding:18px 20px;min-width:0}
.big{font:400 38px/1.1 'Instrument Serif',serif;margin-top:6px}
.note{font-size:12.5px;color:var(--muted);margin:2px 0 0}
.chart{position:relative}
svg{width:100%;height:auto;display:block;margin-top:14px}
.day .bar{fill:var(--ink);opacity:.35;transition:opacity .12s}.day.in .bar{opacity:.85}
.hours .day .bar{opacity:.8}
.day:hover .bar,.day:focus .bar,.day.on .bar{opacity:1}.day:focus{outline:none}
.day:hover .hit,.day.on .hit{fill:var(--line);fill-opacity:.5}
.tip{position:absolute;top:0;transform:translate(-50%,calc(-100% - 6px));background:var(--ink);color:var(--card);padding:7px 11px;border-radius:10px;font-size:13px;line-height:1.3;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s;z-index:1}
.tip.on{opacity:1}.tip small{display:block;font-size:11px;opacity:.7}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px}.wide{grid-column:1/-1}
.row{display:flex;justify-content:space-between;gap:12px}
.meter{display:block;height:6px;border-radius:3px;background:var(--line);margin-top:6px;overflow:hidden}.meter i{display:block;height:100%;background:var(--ink);border-radius:3px}
table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}
th{font:400 11px 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:right;padding:0 0 6px 10px;white-space:nowrap}
th:first-child,td:first-child{text-align:left;padding-left:0}
td{text-align:right;padding:8px 0 8px 10px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums;white-space:nowrap}
td:first-child{white-space:normal}
.funnel td:first-child{width:46%}.funnel td:first-child .meter{margin-top:5px}
.bars{margin-top:10px;display:grid;gap:8px}
.b{display:grid;grid-template-columns:minmax(90px,38%) 1fr auto;align-items:center;gap:10px;font-size:14px}
.b .t{height:8px;border-radius:4px;background:var(--line);overflow:hidden}.b .t i{display:block;height:100%;background:var(--ink);border-radius:4px}
.b .n{font-variant-numeric:tabular-nums;min-width:58px;text-align:right}.b .n small{color:var(--muted);margin-left:6px;font-size:12px}
h3{font:400 11px 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:18px 0 0}
ul{list-style:none;margin:10px 0 0;padding:0}li{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid var(--line)}
.muted{color:var(--muted)}
</style></head><body><main>
<div class="top"><div><div class="mono">Portfolio · ${periodLabel}</div><h1>How people explore it</h1></div><div class="tabs" role="tablist" aria-label="Period">${tabs}</div></div>
${note ? `<div class="banner">${esc(note)}</div>` : ""}

<div class="grid">${keyCards}</div>

<div class="card"><div class="row"><div class="mono">Daily visitors · last ${span} days</div><div class="mono">darker = selected period</div></div><div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily visitors, last ${span} days">${bars}</svg><div class="tip" role="status"></div></div>
<div class="mono" style="display:flex;justify-content:space-between;margin-top:8px"><span>${days[0][0].slice(5)}</span><span>${todayStr.slice(5)}</span></div></div>

<div class="two">
<div class="card wide"><div class="mono">How far people get · different people, each counted once a day</div>${funnel}<p class="mono" style="margin:14px 0 0">${totals}</p></div>

<div class="card"><div class="mono">Sections people reach · different people</div>${barList(sectionRows)}<h3>How they got there</h3>${barList(viaRows)}<h3>Sections reached in one visit</h3>${barList(["0", "1", "2", "3", "4"].map((k) => [`${k} of 4`, counts("session_end", "sections")[k] ?? 0]))}</div>
<div class="card"><div class="mono">Time on the site · visits</div>${barList(inBuckets(sessions, SESSION_BUCKETS))}<h3>Time in the gallery</h3>${barList(inBuckets(counts("gallery_exit", "secs"), STAY_BUCKETS))}<h3>Opened the pause menu</h3><p class="note">${plural(P.menu_open ?? 0, "person", "people")} (${pct(P.menu_open ?? 0, P.start ?? 0)}% of those who started)</p></div>

<div class="card wide"><div class="mono">Built Projects gallery · different people</div>${pairTable(["Project", "Walked up", "Opened"], projectRows)}<h3>Around the gallery</h3>${barList(galleryExtras)}<h3>Projects opened from</h3>${barList(labelled(counts("project_click", "from"), LINK_FROM))}</div>

<div class="card"><div class="mono">Socials · different people</div>${pairTable(["Network", "Found pickup", "Opened"], socialRows)}<h3>Opened from</h3>${barList(labelled(counts("social_click", "from"), LINK_FROM))}</div>
<div class="card"><div class="mono">Case studies and jobs · different people</div><h3>Case studies opened</h3>${barList(CASE_STUDIES.map((c) => [c.company, studies[c.company] ?? 0]))}<h3>Company links (About Me)</h3>${barList(JOBS.map((j) => [j.company, jobs[j.company] ?? 0]))}</div>

<div class="card"><div class="mono">How the game runs</div><h3>Loading time</h3>${barList(inBuckets(counts("ready", "ms"), LOAD_BUCKETS))}<h3>Text version instead of the game</h3>${barList(labelled(counts("fallback", "reason"), FALLBACK_REASONS), "None")}<h3>How people move</h3>${barList(labelled(counts("first_move", "input"), INPUTS))}</div>
<div class="card"><div class="mono">When people come · Romania time</div><div class="chart hours"><svg viewBox="0 0 600 80" role="img" aria-label="Visitors by hour">${hourBars}</svg><div class="tip" role="status"></div></div><div class="mono" style="display:flex;justify-content:space-between;margin-top:8px"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div></div>

<div class="card"><div class="mono">Sources</div>${list(referrers, "Nothing yet")}</div>
<div class="card"><div class="mono">Countries</div>${list(countries, "Nothing yet")}</div>
<div class="card"><div class="mono">Cities (approximate)</div>${list(cities, "Nothing yet")}</div>
<div class="card"><div class="mono">Left out (page loads)</div>${list(ignored, "Nothing yet")}</div>
</div>
<p class="mono" style="margin-top:28px">No cookies · visitors counted once per day, after 3 s on the page · bots and our own devices (?notrack) left out</p>
</main>
<script>
// Period tabs: same page, another range (the key stays in the address).
document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
  const u = new URL(location.href); u.searchParams.set('range', b.dataset.range); location.href = u.toString();
}));
// Charts: hover (or tap) a bar to see its exact numbers.
document.querySelectorAll('.chart').forEach((chart) => {
  const tip = chart.querySelector('.tip'); let on = null;
  const show = (g) => {
    if (on) on.classList.remove('on'); on = g; g.classList.add('on');
    const [label, text] = g.dataset.tip.split('|');
    tip.innerHTML = ''; const b = document.createElement('b'); b.textContent = text; const s = document.createElement('small'); s.textContent = label; tip.append(b, s);
    const x = Math.min(Math.max(+g.dataset.x * chart.clientWidth, tip.offsetWidth / 2), chart.clientWidth - tip.offsetWidth / 2);
    tip.style.left = x + 'px'; tip.classList.add('on');
  };
  const hide = () => { if (on) on.classList.remove('on'); on = null; tip.classList.remove('on'); };
  chart.querySelectorAll('.day').forEach((g) => { g.addEventListener('pointerenter', () => show(g)); g.addEventListener('pointerdown', () => show(g)); g.addEventListener('focus', () => show(g)); g.addEventListener('blur', hide); });
  chart.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
});
</script>
</body></html>`;
}
