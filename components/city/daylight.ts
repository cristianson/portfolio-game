/**
 * Daylight
 *
 * The street follows the visitor's own clock: the HUD shows their local time
 * and the sky, lights and windows go from day to dusk to night with it.
 * Local time comes from the device (already in the visitor's time zone), so no
 * location permission is needed. Sunrise and sunset follow the time of year
 * (northern hemisphere, roughly a European city): dark by ~17:30 in December,
 * light until ~21:30 in June.
 *
 * Add `?time=22:30` and/or `?date=2026-12-24` to the URL to preview any moment.
 */

import * as THREE from "three";

let offsetMs: number | null = null;

/** The visitor's local time, shifted by `?time=HH:MM` / `?date=YYYY-MM-DD` when present. */
export function localNow() {
  if (offsetMs === null) {
    offsetMs = 0;
    const params = new URLSearchParams(window.location.search);
    const time = /^(\d{1,2}):(\d{2})$/.exec(params.get("time") ?? "");
    const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.get("date") ?? "");
    if (time || day) {
      const now = new Date();
      const forced = new Date(now);
      if (day) forced.setFullYear(+day[1], +day[2] - 1, +day[3]);
      if (time) forced.setHours(Math.min(23, +time[1]), Math.min(59, +time[2]), 0, 0);
      offsetMs = forced.getTime() - now.getTime();
    }
  }
  return new Date(Date.now() + offsetMs);
}

/** Day of the year, 0 = 1 January. */
export function dayOfYear(date: Date) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 1)) / 864e5);
}

/** Approximate sunrise and sunset in local hours (longest day ~21 June). */
export function sunTimes(date: Date) {
  const summer = Math.cos((2 * Math.PI * (dayOfYear(date) - 171)) / 365);
  return { sunrise: 6.6 - 1.25 * summer, sunset: 19 + 2.1 * summer };
}

/** 0 = full night, 1 = full day, in between at dawn and dusk. */
export function daylightAt(date: Date) {
  const h = date.getHours() + date.getMinutes() / 60;
  const { sunrise, sunset } = sunTimes(date);
  // Twilight runs from a little before sunrise and lasts about an hour after sunset
  const dawnStart = sunrise - 0.75;
  const dawnEnd = sunrise + 0.75;
  const duskStart = sunset - 0.75;
  const duskEnd = sunset + 1;
  if (h >= dawnEnd && h <= duskStart) return 1;
  if (h <= dawnStart || h >= duskEnd) return 0;
  const t = h < 12 ? (h - dawnStart) / (dawnEnd - dawnStart) : 1 - (h - duskStart) / (duskEnd - duskStart);
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

// Snowy winter days: a paler, overcast sky
const WINTER_DAY: Look = {
  ...DAY,
  skyTop: "#8d9db2",
  skyMid: "#bcc6d2",
  horizon: "#dde1e6",
  hemiSky: "#eef2f6",
  hemiGround: "#b9bec4",
  sun: "#f4f6fa",
  sunIntensity: 0.9,
};

const ca = new THREE.Color();
const cb = new THREE.Color();
const mix = (a: string, b: string, t: number) => "#" + ca.set(a).lerp(cb.set(b), t).getHexString();
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sky, fog and light settings for a daylight value. */
export function environmentFor(daylight: number, winter = false): Look {
  const day = winter ? WINTER_DAY : DAY;
  const [a, b, t] = daylight < 0.5 ? [NIGHT, TWILIGHT, daylight * 2] : [TWILIGHT, day, (daylight - 0.5) * 2];
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

export function unregisterNightGlow(material: THREE.Material) {
  nightGlow.delete(material);
}

export function setNight(night: number) {
  currentNight = night;
  nightGlow.forEach((max, material) => applyGlow(material, max, night));
}
