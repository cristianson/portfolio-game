/**
 * Daylight
 *
 * The street follows the visitor's own clock: the HUD shows their local time
 * and the sky, lights and windows go from day to dusk to night with it.
 * Local time comes from the device (already in the visitor's time zone), so no
 * location permission is needed; sunrise and sunset are approximated as
 * ~5:30–7:00 and ~18:30–20:30.
 *
 * Add `?time=22:30` to the URL to preview any time of day.
 */

import * as THREE from "three";

let offsetMs: number | null = null;

/** The visitor's local time, shifted by `?time=HH:MM` when present. */
export function localNow() {
  if (offsetMs === null) {
    offsetMs = 0;
    const match = /^(\d{1,2}):(\d{2})$/.exec(new URLSearchParams(window.location.search).get("time") ?? "");
    if (match) {
      const now = new Date();
      const forced = new Date(now);
      forced.setHours(Math.min(23, +match[1]), Math.min(59, +match[2]), 0, 0);
      offsetMs = forced.getTime() - now.getTime();
    }
  }
  return new Date(Date.now() + offsetMs);
}

const DAWN_START = 5.5;
const DAWN_END = 7;
const DUSK_START = 18.5;
const DUSK_END = 20.5;

/** 0 = full night, 1 = full day, in between at dawn and dusk. */
export function daylightAt(date: Date) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= DAWN_END && h <= DUSK_START) return 1;
  if (h <= DAWN_START || h >= DUSK_END) return 0;
  const t = h < 12 ? (h - DAWN_START) / (DAWN_END - DAWN_START) : 1 - (h - DUSK_START) / (DUSK_END - DUSK_START);
  // Ease so the sky lingers a little in its warm twilight colours
  return t * t * (3 - 2 * t);
}

interface Look {
  skyTop: string;
  skyMid: string;
  horizon: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  sun: string;
  sunIntensity: number;
  sunPos: [number, number, number];
}

const NIGHT: Look = {
  skyTop: "#070b1a",
  skyMid: "#18213d",
  horizon: "#2b3350",
  hemiSky: "#6f80b8",
  hemiGround: "#1c1a22",
  hemi: 0.95,
  sun: "#a9bff0",
  sunIntensity: 0.35,
  sunPos: [20, 50, 30],
};

const TWILIGHT: Look = {
  skyTop: "#3d4f86",
  skyMid: "#c77d78",
  horizon: "#f0b081",
  hemiSky: "#ffd0b0",
  hemiGround: "#5a4636",
  hemi: 1.6,
  sun: "#ffb070",
  sunIntensity: 0.9,
  sunPos: [-50, 18, -25],
};

const DAY: Look = {
  skyTop: "#7c9cc2",
  skyMid: "#aebfd3",
  horizon: "#d4cbc6",
  hemiSky: "#f2eee8",
  hemiGround: "#9a8f80",
  hemi: 2.3,
  sun: "#fff0e0",
  sunIntensity: 1.15,
  sunPos: [-30, 60, -25],
};

const ca = new THREE.Color();
const cb = new THREE.Color();
const mix = (a: string, b: string, t: number) => "#" + ca.set(a).lerp(cb.set(b), t).getHexString();
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sky, fog and light settings for a daylight value. */
export function environmentFor(daylight: number): Look {
  const [a, b, t] = daylight < 0.5 ? [NIGHT, TWILIGHT, daylight * 2] : [TWILIGHT, DAY, (daylight - 0.5) * 2];
  return {
    skyTop: mix(a.skyTop, b.skyTop, t),
    skyMid: mix(a.skyMid, b.skyMid, t),
    horizon: mix(a.horizon, b.horizon, t),
    hemiSky: mix(a.hemiSky, b.hemiSky, t),
    hemiGround: mix(a.hemiGround, b.hemiGround, t),
    hemi: lerp(a.hemi, b.hemi, t),
    sun: mix(a.sun, b.sun, t),
    sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t),
    sunPos: [0, 1, 2].map((i) => lerp(a.sunPos[i], b.sunPos[i], t)) as [number, number, number],
  };
}

/**
 * Materials that glow after dark (lit windows, shop fronts, lamp pools).
 * Each registers how strong it gets at full night; Environment scales them.
 */
export const nightGlow = new Map<THREE.Material, number>();
let currentNight = 0;

export function registerNightGlow(material: THREE.Material, max: number) {
  nightGlow.set(material, max);
  applyGlow(material, max, currentNight);
}

function applyGlow(material: THREE.Material, max: number, night: number) {
  if (material instanceof THREE.MeshLambertMaterial) {
    // Walls and shop fronts keep rendering by day; only their glow fades
    material.emissiveIntensity = max * night;
  } else {
    // Overlays (light pools) disappear entirely by day
    material.opacity = max * night;
    material.visible = night > 0.01;
  }
}

export function setNight(night: number) {
  currentNight = night;
  nightGlow.forEach((max, material) => applyGlow(material, max, night));
}
