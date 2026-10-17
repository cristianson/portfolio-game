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
  nearZone: ZoneId | null;
  pedestrians: { x: number; z: number }[];
}

export function createStore(): GameStore {
  return {
    phase: "title",
    input: { kx: 0, ky: 0, jx: 0, jy: 0, sprint: false },
    player: { x: SPAWN.x, z: SPAWN.z, heading: SPAWN.heading, speed: 0 },
    camYaw: SPAWN.heading,
    manualCamUntil: 0,
    nearZone: null,
    pedestrians: [],
  };
}

/** Shortest signed difference between two angles. */
export function angleDiff(target: number, current: number) {
  let d = (target - current) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
