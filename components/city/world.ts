/**
 * World Layout
 *
 * Static description of the street: buildings, interaction zones, props,
 * parked cars and pedestrian paths. Rendering, collisions and the radar all
 * read from this file, so moving something here moves it everywhere.
 *
 * Coordinates: Y is up, the street runs along Z (north = +Z).
 * The road spans x ∈ [-5, 5], sidewalks x ∈ [5, 9] on both sides.
 */

import type { InteractionType } from "@/components/game/types";

export type ZoneId = Exclude<InteractionType, null>;

export const ROAD_HALF = 5;
export const SIDEWALK_OUTER = 9;
export const SIDEWALK_HEIGHT = 0.15;
export const STREET_MIN_Z = -50;
export const STREET_MAX_Z = 50;
export const FLOOR_HEIGHT = 3.2;
export const GROUND_FLOOR_HEIGHT = 3.8;

export type BuildingStyle =
  | "brick"
  | "brownstone"
  | "concrete"
  | "glass"
  | "beige"
  | "teal"
  | "garage";

/** Which side of the box faces the street (gets the storefront & sign). */
export type Facing = "+x" | "-x" | "+z" | "-z";

export interface SignDef {
  text: string;
  bg: string;
  fg: string;
  /** Width in meters; height is derived from the texture aspect. */
  width?: number;
}

export interface BuildingDef {
  id: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  floors: number;
  style: BuildingStyle;
  facing: Facing;
  sign?: SignDef;
  awning?: string;
  /** Position of the door along the facade (world z or x). */
  door?: number;
  waterTower?: boolean;
  stoop?: boolean;
  fireEscape?: boolean;
  /** Vertical sign sticking out of the facade, at a world position along it. */
  blade?: SignDef & { at: number };
  zone?: ZoneId;
}

export interface ZoneDef {
  id: ZoneId;
  label: string;
  /** Letter shown in the radar blip. */
  blip: string;
  color: string;
  x: number;
  z: number;
  radius: number;
}

export const ZONES: ZoneDef[] = [
  { id: "ABOUT", label: "About Me", blip: "A", color: "#ff4fa3", x: 7.3, z: -26, radius: 1.2 },
  { id: "PROJECTS", label: "Built Projects", blip: "P", color: "#b36bff", x: -7.3, z: -12, radius: 1.2 },
  { id: "CASE_STUDIES", label: "Case Studies", blip: "C", color: "#ffb020", x: 7.3, z: 5, radius: 1.2 },
  { id: "SOCIALS", label: "Socials", blip: "S", color: "#3ddc84", x: -6.9, z: 22, radius: 1.2 },
];

const E = SIDEWALK_OUTER;

export const BUILDINGS: BuildingDef[] = [
  // ── East side (facade faces -x) ─────────────────────────────
  { id: "e1", x0: E, x1: E + 12, z0: -50, z1: -34, floors: 2, style: "beige", facing: "-x", sign: { text: "24/7 DELI", bg: "#1d6b3a", fg: "#fff6d5" }, awning: "#1d6b3a", door: -42 },
  { id: "about", x0: E, x1: E + 12, z0: -34, z1: -18, floors: 3, style: "brownstone", facing: "-x", sign: { text: "ABOUT ME", bg: "#2a1a12", fg: "#ff8fc6", width: 5 }, door: -26, stoop: true, zone: "ABOUT" },
  { id: "e3", x0: E, x1: E + 12, z0: -18, z1: -6, floors: 5, style: "brick", facing: "-x", sign: { text: "LAUNDROMAT", bg: "#1f4e8c", fg: "#ffffff" }, awning: "#c0392b", door: -12, waterTower: true, fireEscape: true, blade: { text: "24HR", bg: "#c0221a", fg: "#ffe14d", at: -17.2 } },
  { id: "case", x0: E, x1: E + 14, z0: -6, z1: 16, floors: 9, style: "glass", facing: "-x", sign: { text: "CASE STUDIES", bg: "#101418", fg: "#ffb020", width: 8 }, door: 5, zone: "CASE_STUDIES" },
  { id: "e5", x0: E, x1: E + 12, z0: 16, z1: 30, floors: 4, style: "teal", facing: "-x", sign: { text: "PIXEL PHARMACY", bg: "#ffffff", fg: "#0a8a5f" }, awning: "#0a8a5f", door: 23 },
  { id: "e6", x0: E, x1: E + 12, z0: 30, z1: 50, floors: 6, style: "brick", facing: "-x", sign: { text: "HOTEL GRID", bg: "#5a0e0e", fg: "#ffd34d" }, door: 40, waterTower: true, fireEscape: true, blade: { text: "HOTEL", bg: "#1d2f4f", fg: "#ff5a5a", at: 33 } },

  // ── West side (facade faces +x) ─────────────────────────────
  { id: "w1", x0: -E - 12, x1: -E, z0: -50, z1: -34, floors: 4, style: "concrete", facing: "+x", sign: { text: "BOOKS & VINYL", bg: "#3b2a6b", fg: "#ffe9a8" }, awning: "#3b2a6b", door: -42, waterTower: true, fireEscape: true },
  { id: "w2", x0: -E - 12, x1: -E, z0: -34, z1: -20, floors: 2, style: "beige", facing: "+x", sign: { text: "JOE'S DINER", bg: "#c0392b", fg: "#ffffff" }, awning: "#e74c3c", door: -27 },
  { id: "projects", x0: -E - 12, x1: -E, z0: -20, z1: -4, floors: 2, style: "garage", facing: "+x", sign: { text: "BUILT PROJECTS", bg: "#1b1b1b", fg: "#c58bff", width: 7 }, door: -12, zone: "PROJECTS" },
  { id: "w4", x0: -E - 12, x1: -E, z0: -4, z1: 14, floors: 7, style: "brick", facing: "+x", sign: { text: "PAPER CO.", bg: "#2c3e50", fg: "#f1c40f" }, door: 5, fireEscape: true, blade: { text: "BAR", bg: "#16302a", fg: "#4dffb8", at: 12 } },
  // z 14..30 on the west side is a small park (see PARK)
  { id: "w6", x0: -E - 12, x1: -E, z0: 30, z1: 50, floors: 5, style: "beige", facing: "+x", sign: { text: "CORNER CAFE", bg: "#6b3e1f", fg: "#fff0d0" }, awning: "#8e5a2e", door: 40, blade: { text: "CAFE", bg: "#e8d9b0", fg: "#7a1f1f", at: 47 } },

  // ── Backdrops closing the street at both ends ───────────────
  { id: "n1", x0: -30, x1: 30, z0: 56, z1: 66, floors: 8, style: "concrete", facing: "-z", waterTower: true },
  { id: "s1", x0: -30, x1: 30, z0: -66, z1: -56, floors: 7, style: "brick", facing: "+z", waterTower: true },
  // Behind the park
  { id: "pb", x0: -36, x1: -24, z0: 12, z1: 32, floors: 6, style: "teal", facing: "+x" },
];

export const PARK = { x0: -24, x1: -E, z0: 14, z1: 30 };

export interface CarDef {
  x: number;
  z: number;
  /** Rotation around Y. 0 = nose towards +Z. */
  rot: number;
  color: string;
  taxi?: boolean;
  van?: boolean;
}

export const PARKED_CARS: CarDef[] = [
  { x: 3.9, z: -40, rot: Math.PI, color: "#8e3a33" },
  { x: 3.9, z: -18, rot: Math.PI, color: "#d9b13a", taxi: true },
  { x: 3.9, z: -11, rot: Math.PI, color: "#4f6a94", van: true },
  { x: 3.9, z: 20, rot: Math.PI, color: "#cfcbc2", van: true },
  { x: 3.9, z: 33, rot: Math.PI, color: "#3a3a3a" },
  { x: -3.9, z: -44, rot: 0, color: "#3f6b5c" },
  { x: -3.9, z: -24, rot: 0, color: "#b8a9a6" },
  { x: -3.9, z: 0, rot: 0, color: "#d9b13a", taxi: true },
  { x: -3.9, z: 9, rot: 0, color: "#5a7d86" },
  { x: -3.9, z: 38, rot: 0, color: "#7d5a6e" },
];

export type PropKind = "signal" | "lamp" | "hydrant" | "tree" | "bench" | "trash" | "booth" | "newsbox" | "barrier" | "mailbox";

export interface PropDef {
  kind: PropKind;
  x: number;
  z: number;
  rot?: number;
}

const lampZs = [-42, -30, -16, -2, 12, 28, 44];

export const PROPS: PropDef[] = [
  ...lampZs.map((z) => ({ kind: "lamp" as const, x: 5.45, z, rot: Math.PI })),
  ...lampZs.filter((z) => z < 40).map((z) => ({ kind: "lamp" as const, x: -5.45, z: z + 6, rot: 0 })),
  { kind: "signal", x: 5.45, z: -6.9 },
  { kind: "signal", x: -5.45, z: -3.1 },
  { kind: "signal", x: 5.45, z: 25.1 },
  { kind: "signal", x: -5.45, z: 28.9 },
  { kind: "tree", x: 5.9, z: -36 },
  { kind: "tree", x: 5.9, z: -6 },
  { kind: "tree", x: 5.9, z: 25 },
  { kind: "tree", x: -5.9, z: -40 },
  { kind: "tree", x: -5.9, z: -2 },
  { kind: "tree", x: -5.9, z: 42 },
  { kind: "hydrant", x: 5.5, z: -22 },
  { kind: "hydrant", x: -5.5, z: -30 },
  { kind: "hydrant", x: 5.5, z: 37 },
  { kind: "trash", x: 8.4, z: -38 },
  { kind: "trash", x: -8.4, z: -8 },
  { kind: "trash", x: 8.4, z: 30.5 },
  { kind: "newsbox", x: 8.4, z: 10.5 },
  { kind: "newsbox", x: -8.4, z: -32 },
  { kind: "mailbox", x: 5.6, z: 9 },
  { kind: "bench", x: -8.3, z: 26, rot: Math.PI / 2 },
  { kind: "booth", x: -8.4, z: 22, rot: Math.PI / 2 },
  // Road closed at both ends
  ...[-4, 0, 4].map((x) => ({ kind: "barrier" as const, x, z: 49 })),
  ...[-4, 0, 4].map((x) => ({ kind: "barrier" as const, x, z: -49 })),
  ...[-7, 7].map((x) => ({ kind: "barrier" as const, x, z: 49.5 })),
  ...[-7, 7].map((x) => ({ kind: "barrier" as const, x, z: -49.5 })),
];

export const PARK_TREES: [number, number][] = [
  [-12, 17], [-18, 19], [-14, 27.5], [-21, 25], [-11, 23],
];

/** Pedestrians walk back and forth along a sidewalk line. */
export interface PedestrianDef {
  x: number;
  zMin: number;
  zMax: number;
  speed: number;
  start: number;
  look: number;
}

export const PEDESTRIANS: PedestrianDef[] = [
  { x: 7.0, zMin: -46, zMax: -8, speed: 1.3, start: 0.2, look: 0 },
  { x: 6.6, zMin: 0, zMax: 46, speed: 1.1, start: 0.7, look: 1 },
  { x: -6.8, zMin: -46, zMax: -16, speed: 1.4, start: 0.5, look: 2 },
  { x: -7.1, zMin: -6, zMax: 46, speed: 1.2, start: 0.1, look: 3 },
  { x: 7.6, zMin: 12, zMax: 46, speed: 1.0, start: 0.9, look: 4 },
];

export const SPAWN = { x: 6.6, z: -44, heading: 0 };

/** Axis-aligned box on the ground plane, used for collisions and the radar. */
export interface Box2 {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  /** Buildings block the camera too; small props don't. */
  solid?: boolean;
}

const PROP_RADIUS: Partial<Record<PropKind, number>> = {
  lamp: 0.18,
  signal: 0.18,
  hydrant: 0.25,
  tree: 0.3,
  trash: 0.35,
  newsbox: 0.35,
  mailbox: 0.35,
};

function propBox(p: PropDef): Box2 | null {
  if (p.kind === "bench") return { x0: p.x - 0.35, x1: p.x + 0.35, z0: p.z - 0.9, z1: p.z + 0.9 };
  if (p.kind === "booth") return { x0: p.x - 0.55, x1: p.x + 0.55, z0: p.z - 0.55, z1: p.z + 0.55 };
  if (p.kind === "barrier") return { x0: p.x - 1.3, x1: p.x + 1.3, z0: p.z - 0.25, z1: p.z + 0.25 };
  const r = PROP_RADIUS[p.kind];
  return r ? { x0: p.x - r, x1: p.x + r, z0: p.z - r, z1: p.z + r } : null;
}

function carBox(c: CarDef): Box2 {
  const alongZ = Math.abs(Math.sin(c.rot)) < 0.5;
  const hl = 2.15;
  const hw = 0.95;
  return alongZ
    ? { x0: c.x - hw, x1: c.x + hw, z0: c.z - hl, z1: c.z + hl }
    : { x0: c.x - hl, x1: c.x + hl, z0: c.z - hw, z1: c.z + hw };
}

export const COLLIDERS: Box2[] = [
  ...BUILDINGS.map((b) => ({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, solid: true })),
  ...PARKED_CARS.map(carBox),
  ...PROPS.map(propBox).filter((b): b is Box2 => b !== null),
  ...PARK_TREES.map(([x, z]) => ({ x0: x - 0.3, x1: x + 0.3, z0: z - 0.3, z1: z + 0.3 })),
  // Brownstone stoop in front of the About Me door
  { x0: 7.7, x1: SIDEWALK_OUTER, z0: -26.95, z1: -25.05 },
  // Invisible limits: street ends and the back of the park
  { x0: -30, x1: 30, z0: 50, z1: 56 },
  { x0: -30, x1: 30, z0: -56, z1: -50 },
  { x0: -24.5, x1: -24, z0: 12, z1: 32, solid: true },
];

export function groundHeight(x: number, z: number): number {
  const inPark = x < -SIDEWALK_OUTER && z > PARK.z0 && z < PARK.z1;
  return Math.abs(x) > ROAD_HALF || inPark ? SIDEWALK_HEIGHT : 0;
}
