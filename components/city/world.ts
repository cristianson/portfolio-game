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

export type ZoneId = "ABOUT" | "PROJECTS" | "CASE_STUDIES" | "SOCIALS";

export const ROAD_HALF = 5;
export const SIDEWALK_OUTER = 9;
export const SIDEWALK_HEIGHT = 0.15;
/** The street runs from -STREET_HALF to +STREET_HALF along Z (50 m end to end). */
export const STREET_HALF = 25;
/** Road / sidewalk length, reaching under the backdrop buildings at both ends. */
export const STREET_LENGTH = (STREET_HALF + 6) * 2;
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

/** Every section; Socials has no marker (see PICKUPS) but still shows in the menu and radar legend. */
export const ZONES: ZoneDef[] = [
  { id: "ABOUT", label: "About Me", blip: "A", color: "#ff4fa3", x: 7.3, z: -13.5, radius: 1.2 },
  { id: "PROJECTS", label: "Built Projects", blip: "P", color: "#b36bff", x: -7.3, z: -4, radius: 1.2 },
  { id: "CASE_STUDIES", label: "Case Studies", blip: "C", color: "#ffb020", x: 7.3, z: 5, radius: 1.2 },
  { id: "SOCIALS", label: "Socials", blip: "S", color: "#3ddc84", x: -6.9, z: 13.5, radius: 1.2 },
];

/** Sections you walk into a glowing marker for. */
export const MARKER_ZONES = ZONES.filter((z) => z.id !== "SOCIALS");

/**
 * Socials live on the street as spinning pickups, like the health and cash
 * pickups lying around in GTA 3. `name` matches SOCIALS in content.ts.
 */
export interface PickupDef {
  name: string;
  x: number;
  z: number;
}

export const PICKUPS: PickupDef[] = [
  { name: "LinkedIn", x: -7.1, z: 13.5 },
  { name: "X", x: 7.1, z: 10.5 },
  // On the light sidewalk so the black pickup stands out
  { name: "GitHub", x: -7.1, z: 23 },
];

export const PICKUP_RADIUS = 1.0;

const E = SIDEWALK_OUTER;

const H = STREET_HALF;

export const BUILDINGS: BuildingDef[] = [
  // ── East side (facade faces -x) ─────────────────────────────
  { id: "e1", x0: E, x1: E + 12, z0: -H, z1: -19, floors: 2, style: "beige", facing: "-x", sign: { text: "24/7 DELI", bg: "#1d6b3a", fg: "#fff6d5" }, awning: "#1d6b3a", door: -22 },
  { id: "about", x0: E, x1: E + 12, z0: -19, z1: -8, floors: 3, style: "brownstone", facing: "-x", sign: { text: "ABOUT ME", bg: "#2a1a12", fg: "#ff8fc6", width: 5 }, door: -13.5, stoop: true, zone: "ABOUT" },
  { id: "e3", x0: E, x1: E + 12, z0: -8, z1: -2, floors: 5, style: "brick", facing: "-x", sign: { text: "LAUNDROMAT", bg: "#1f4e8c", fg: "#ffffff" }, awning: "#c0392b", door: -5, waterTower: true, blade: { text: "24HR", bg: "#c0221a", fg: "#ffe14d", at: -7.3 } },
  { id: "case", x0: E, x1: E + 14, z0: -2, z1: 12, floors: 9, style: "glass", facing: "-x", sign: { text: "CASE STUDIES", bg: "#101418", fg: "#ffb020", width: 8 }, door: 5, zone: "CASE_STUDIES" },
  { id: "e6", x0: E, x1: E + 12, z0: 12, z1: H, floors: 6, style: "brick", facing: "-x", sign: { text: "HOTEL GRID", bg: "#5a0e0e", fg: "#ffd34d" }, door: 19, waterTower: true, fireEscape: true, blade: { text: "HOTEL", bg: "#1d2f4f", fg: "#ff5a5a", at: 12.7 } },

  // ── West side (facade faces +x) ─────────────────────────────
  { id: "w1", x0: -E - 12, x1: -E, z0: -H, z1: -17, floors: 4, style: "concrete", facing: "+x", sign: { text: "BOOKS & VINYL", bg: "#3b2a6b", fg: "#ffe9a8" }, awning: "#3b2a6b", door: -21, waterTower: true, fireEscape: true },
  { id: "w2", x0: -E - 12, x1: -E, z0: -17, z1: -10, floors: 2, style: "beige", facing: "+x", sign: { text: "JOE'S DINER", bg: "#c0392b", fg: "#ffffff" }, awning: "#e74c3c", door: -13.5 },
  { id: "projects", x0: -E - 12, x1: -E, z0: -10, z1: 2, floors: 2, style: "garage", facing: "+x", sign: { text: "BUILT PROJECTS", bg: "#1b1b1b", fg: "#c58bff", width: 7 }, door: -4, zone: "PROJECTS" },
  { id: "w4", x0: -E - 12, x1: -E, z0: 2, z1: 10, floors: 7, style: "brick", facing: "+x", sign: { text: "PAPER CO.", bg: "#2c3e50", fg: "#f1c40f" }, door: 6, blade: { text: "BAR", bg: "#16302a", fg: "#4dffb8", at: 9.3 } },
  // z 10..20 on the west side is a small park (see PARK)
  { id: "w6", x0: -E - 12, x1: -E, z0: 20, z1: H, floors: 5, style: "beige", facing: "+x", sign: { text: "CORNER CAFE", bg: "#6b3e1f", fg: "#fff0d0" }, awning: "#8e5a2e", door: 22.5, blade: { text: "CAFE", bg: "#e8d9b0", fg: "#7a1f1f", at: 24.3 } },

  // ── Backdrops closing the street at both ends ───────────────
  { id: "n1", x0: -30, x1: 30, z0: H + 6, z1: H + 16, floors: 8, style: "concrete", facing: "-z", waterTower: true },
  { id: "s1", x0: -30, x1: 30, z0: -H - 16, z1: -H - 6, floors: 7, style: "brick", facing: "+z", waterTower: true },
  // Behind the park
  { id: "pb", x0: -36, x1: -24, z0: 8, z1: 22, floors: 6, style: "teal", facing: "+x" },
];

export const PARK = { x0: -24, x1: -E, z0: 10, z1: 20 };

/** Mid-block crosswalks (z of their centre line). */
export const CROSSWALKS = [-7, 15];

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
  { x: 3.9, z: -13, rot: Math.PI, color: "#d9b13a", taxi: true },
  { x: 3.9, z: 9.5, rot: Math.PI, color: "#cfcbc2", van: true },
  { x: -3.9, z: -22, rot: 0, color: "#3f6b5c" },
  { x: -3.9, z: 1, rot: 0, color: "#d9b13a", taxi: true },
  { x: -3.9, z: 20, rot: 0, color: "#8e3a33" },
];

export type PropKind = "signal" | "lamp" | "hydrant" | "tree" | "bench" | "trash" | "booth" | "newsbox" | "barrier" | "mailbox";

export interface PropDef {
  kind: PropKind;
  x: number;
  z: number;
  rot?: number;
}

export const PROPS: PropDef[] = [
  ...[-22, -4, 9, 21].map((z) => ({ kind: "lamp" as const, x: 5.45, z, rot: Math.PI })),
  ...[-19, -10, 3, 11, 22].map((z) => ({ kind: "lamp" as const, x: -5.45, z, rot: 0 })),
  // Traffic lights: east one just south of each crosswalk, west one just north
  ...CROSSWALKS.flatMap((z) => [
    { kind: "signal" as const, x: 5.45, z: z - 1.9 },
    { kind: "signal" as const, x: -5.45, z: z + 1.9 },
  ]),
  { kind: "tree", x: 5.9, z: -16.5 },
  { kind: "tree", x: 5.9, z: 1 },
  { kind: "tree", x: 5.9, z: 17 },
  { kind: "tree", x: -5.9, z: -23 },
  { kind: "tree", x: -5.9, z: -1 },
  { kind: "tree", x: -5.9, z: 19 },
  { kind: "hydrant", x: 5.5, z: -11 },
  { kind: "hydrant", x: -5.5, z: -14 },
  { kind: "hydrant", x: 5.5, z: 23 },
  { kind: "trash", x: 8.4, z: -18 },
  { kind: "trash", x: -8.4, z: 1.5 },
  { kind: "trash", x: 8.4, z: 14.5 },
  { kind: "newsbox", x: 8.4, z: 8 },
  { kind: "newsbox", x: -8.4, z: -15 },
  { kind: "mailbox", x: 5.6, z: 2.5 },
  { kind: "bench", x: -8.3, z: 18.6, rot: Math.PI / 2 },
  { kind: "booth", x: -8.4, z: 11.2, rot: Math.PI / 2 },
  // Road closed at both ends
  ...[-4, 0, 4].map((x) => ({ kind: "barrier" as const, x, z: H - 1 })),
  ...[-4, 0, 4].map((x) => ({ kind: "barrier" as const, x, z: -H + 1 })),
  ...[-7, 7].map((x) => ({ kind: "barrier" as const, x, z: H - 0.5 })),
  ...[-7, 7].map((x) => ({ kind: "barrier" as const, x, z: -H + 0.5 })),
];

export const PARK_TREES: [number, number][] = [
  [-12, 11.3], [-18, 12], [-14, 18.7], [-21, 17.5], [-11.2, 18.4],
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
  { x: 7.0, zMin: -23, zMax: -4, speed: 1.3, start: 0.6, look: 0 },
  { x: 6.6, zMin: 2, zMax: 23, speed: 1.1, start: 0.7, look: 1 },
  { x: -6.8, zMin: -23, zMax: -7, speed: 1.4, start: 0.5, look: 2 },
  { x: -7.1, zMin: -1, zMax: 23, speed: 1.2, start: 0.1, look: 3 },
  { x: 7.6, zMin: 7, zMax: 23, speed: 1.0, start: 0.9, look: 4 },
];

export const SPAWN = { x: 6.6, z: -20.5, heading: 0 };

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
  { x0: 7.7, x1: SIDEWALK_OUTER, z0: -14.45, z1: -12.55 },
  // Invisible limits: street ends and the back of the park
  { x0: -30, x1: 30, z0: STREET_HALF, z1: STREET_HALF + 6 },
  { x0: -30, x1: 30, z0: -STREET_HALF - 6, z1: -STREET_HALF },
  { x0: -24.5, x1: -24, z0: 8, z1: 22, solid: true },
];

/** Seasonal props (Christmas tree, café tables...) collide only while they're out; returns a remover. */
export function addColliders(boxes: Box2[]) {
  COLLIDERS.push(...boxes);
  return () => {
    for (const b of boxes) {
      const i = COLLIDERS.indexOf(b);
      if (i >= 0) COLLIDERS.splice(i, 1);
    }
  };
}

export function groundHeight(x: number, z: number): number {
  const inPark = x < -SIDEWALK_OUTER && z > PARK.z0 && z < PARK.z1;
  return Math.abs(x) > ROAD_HALF || inPark ? SIDEWALK_HEIGHT : 0;
}
