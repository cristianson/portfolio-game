/**
 * Gallery Layout
 *
 * The Built Projects building has an inside: a classic museum hall where each
 * project hangs as a painting. Walking into the marker outside fades you in
 * here (see index.tsx). Like world.ts this is plain data; museum.tsx renders
 * it, player.tsx collides with it and the radar draws it.
 *
 * The hall has its own coordinates: entrance wall at z = -HALL.d / 2,
 * the centrepiece on the back wall at z = +HALL.d / 2. Only one place
 * (street or gallery) is shown at a time.
 */

import { PROJECTS } from "./content";
import type { Box2 } from "./world";

export const HALL = { w: 16, d: 22, h: 6.5 };
const HX = HALL.w / 2;
const HZ = HALL.d / 2;

export interface PaintingDef {
  id: string;
  x: number;
  /** Centre height. */
  y: number;
  z: number;
  w: number;
  h: number;
  /** Direction the painting faces (into the room). */
  nx: number;
  nz: number;
  /** Index into PROJECTS; undefined for the "coming soon" frame. */
  project?: number;
}

/** Wall slots in the order projects fill them (newest gets the centrepiece). */
const SLOTS: Omit<PaintingDef, "id" | "project">[] = [
  { x: 0, y: 2.9, z: HZ - 0.05, w: 4.4, h: 2.75, nx: 0, nz: -1 },
  { x: -HX + 0.05, y: 2.7, z: 3.5, w: 3.4, h: 2.125, nx: 1, nz: 0 },
  { x: HX - 0.05, y: 2.7, z: 3.5, w: 3.4, h: 2.125, nx: -1, nz: 0 },
  { x: HX - 0.05, y: 2.7, z: -4, w: 2.6, h: 1.9, nx: -1, nz: 0 },
];

export const PAINTINGS: PaintingDef[] = [
  ...PROJECTS.slice(0, SLOTS.length - 1).map((_, i) => ({ ...SLOTS[i], id: `project-${i}`, project: i })),
  // The next free slot waits for the next project
  { ...SLOTS[Math.min(PROJECTS.length, SLOTS.length - 1)], id: "soon" },
];

/** Portrait of the artist (my avatar) opposite the empty frame. */
export const PORTRAIT = { x: -HX + 0.05, y: 2.8, z: -4, w: 1.7, h: 2.1, nx: 1, nz: 0 };

/** Velvet ropes keep you this far from the wall. */
export const ROPE_DISTANCE = 1.2;

export type SpotKind = "painting" | "soon" | "guestbook" | "guard" | "exit";

export interface SpotDef {
  id: string;
  kind: SpotKind;
  x: number;
  z: number;
  radius: number;
  painting?: PaintingDef;
}

export const GUESTBOOK = { x: -5.4, z: -8.6 };
export const GUARD = { x: 5.6, z: -9, heading: -1.36 };
// A step in front of the door, not touching it
export const EXIT = { x: 0, z: -HZ + 1.7, radius: 0.9 };
/** Where you appear when you walk in. */
export const GALLERY_SPAWN = { x: 0, z: -HZ + 4, heading: 0 };

export const SPOTS: SpotDef[] = [
  ...PAINTINGS.map((p) => ({
    id: p.id,
    kind: (p.project === undefined ? "soon" : "painting") as SpotKind,
    x: p.x + p.nx * 2.3,
    z: p.z + p.nz * 2.3,
    radius: 1.3,
    painting: p,
  })),
  { id: "guestbook", kind: "guestbook", x: GUESTBOOK.x + 0.6, z: GUESTBOOK.z + 0.8, radius: 1.3 },
  { id: "guard", kind: "guard", x: GUARD.x - 0.8, z: GUARD.z + 0.8, radius: 1.4 },
  { id: "exit", kind: "exit", x: EXIT.x, z: EXIT.z, radius: EXIT.radius },
];

export const BENCHES = [
  { x: -3.2, z: 3.5 },
  { x: 3.2, z: 3.5 },
];

/** Pilasters along the walls, placed between the paintings. */
export const PILASTERS: { x: number; z: number; alongX: boolean }[] = [
  ...[-8, -0.6, 7.6].flatMap((z) => [
    { x: -HX, z, alongX: false },
    { x: HX, z, alongX: false },
  ]),
  ...[-4.2, 4.2].map((x) => ({ x, z: HZ, alongX: true })),
];

/** Visitors stroll between these points and stop at the ones with `look` (a heading). */
export interface Waypoint {
  x: number;
  z: number;
  look?: number;
}

const side = (s: 1 | -1): Waypoint[] => [
  { x: s * 5.6, z: 3.5, look: s * (Math.PI / 2) },
  { x: s * 5.4, z: -4, look: s * (Math.PI / 2) },
  { x: s * 5.2, z: 6.8 },
  { x: s * 2.4, z: 8.2, look: 0 },
  { x: s * 5.2, z: 6.8 },
];

export const VISITOR_ROUTES: Waypoint[][] = [side(-1), side(1)];

const ropeBox = (p: { x: number; z: number; w: number; nx: number; nz: number }): Box2 => {
  const cx = p.x + p.nx * ROPE_DISTANCE;
  const cz = p.z + p.nz * ROPE_DISTANCE;
  const half = p.w / 2 + 0.45;
  return p.nx !== 0
    ? { x0: cx - 0.1, x1: cx + 0.1, z0: cz - half, z1: cz + half }
    : { x0: cx - half, x1: cx + half, z0: cz - 0.1, z1: cz + 0.1 };
};

const T = 0.4;

export const GALLERY_COLLIDERS: Box2[] = [
  // Walls (solid, so the camera stays inside)
  { x0: -HX - T, x1: -HX, z0: -HZ - T, z1: HZ + T, solid: true },
  { x0: HX, x1: HX + T, z0: -HZ - T, z1: HZ + T, solid: true },
  { x0: -HX - T, x1: HX + T, z0: HZ, z1: HZ + T, solid: true },
  { x0: -HX - T, x1: HX + T, z0: -HZ - T, z1: -HZ, solid: true },
  ...PAINTINGS.map(ropeBox),
  ropeBox(PORTRAIT),
  ...BENCHES.map((b) => ({ x0: b.x - 0.45, x1: b.x + 0.45, z0: b.z - 1.25, z1: b.z + 1.25 })),
  ...PILASTERS.map((p) => (p.alongX ? { x0: p.x - 0.35, x1: p.x + 0.35, z0: p.z - 0.3, z1: p.z } : { x0: p.x - 0.3, x1: p.x + 0.3, z0: p.z - 0.35, z1: p.z + 0.35 })),
  { x0: GUESTBOOK.x - 0.35, x1: GUESTBOOK.x + 0.35, z0: GUESTBOOK.z - 0.35, z1: GUESTBOOK.z + 0.35 },
  { x0: GUARD.x - 0.35, x1: GUARD.x + 0.35, z0: GUARD.z - 0.35, z1: GUARD.z + 0.35 },
  // Urns by the door
  ...[-1, 1].map((s) => ({ x0: s * 2.6 - 0.4, x1: s * 2.6 + 0.4, z0: -HZ + 0.2, z1: -HZ + 1.0 })),
];
