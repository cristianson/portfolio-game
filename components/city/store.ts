/**
 * Game Store
 *
 * A plain mutable object shared by the 3D loop and the DOM HUD. Per-frame
 * values (positions, camera yaw, input) live here instead of React state so
 * nothing re-renders 60 times a second; React state is only used for rare
 * changes like "which zone am I standing in".
 */

import { SPAWN, type ZoneId } from "./world";

export type Phase = "title" | "play" | "panel" | "menu";

/** Out on the street, or inside the Built Projects gallery (museum.ts). */
export type Location = "street" | "gallery";

export interface GameStore {
  phase: Phase;
  input: {
    /** Keyboard axes, -1..1 (y = forward). */
    kx: number;
    ky: number;
    /** Joystick axes, -1..1 (y = forward). */
    jx: number;
    jy: number;
    sprint: boolean;
  };
  player: { x: number; z: number; heading: number; speed: number };
  camYaw: number;
  /** Timestamp (ms) until which the camera won't auto-swing behind the player. */
  manualCamUntil: number;
  location: Location;
  /** True during the fade between the street and an interior: input is ignored. */
  travelling: boolean;
  /** Set after a teleport so the camera jumps instead of gliding across the map. */
  snapCamera: boolean;
  /** A zone you just came out of; it only triggers again once you've stepped off it. */
  blockedZone: ZoneId | null;
  nearZone: ZoneId | null;
  /** Gallery spot (painting, guestbook, guard, exit) you're standing at. */
  nearSpot: string | null;
  /** Name of the social pickup the player is standing on. */
  nearPickup: string | null;
  pedestrians: { x: number; z: number }[];
  /** Gallery visitors, for bumping into. */
  visitors: { x: number; z: number }[];
}

export function createStore(): GameStore {
  return {
    phase: "title",
    input: { kx: 0, ky: 0, jx: 0, jy: 0, sprint: false },
    player: { x: SPAWN.x, z: SPAWN.z, heading: SPAWN.heading, speed: 0 },
    camYaw: SPAWN.heading,
    manualCamUntil: 0,
    location: "street",
    travelling: false,
    snapCamera: false,
    blockedZone: null,
    nearZone: null,
    nearSpot: null,
    nearPickup: null,
    pedestrians: [],
    visitors: [],
  };
}

/** Shortest signed difference between two angles. */
export function angleDiff(target: number, current: number) {
  let d = (target - current) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
