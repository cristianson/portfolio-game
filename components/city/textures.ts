/**
 * Procedural Textures
 *
 * Every texture in the city is painted on a <canvas> at runtime, so the scene
 * ships with zero image assets. Small sizes + bilinear filtering give the
 * slightly soft, early-2000s console look.
 */

import * as THREE from "three";
import type { BuildingStyle } from "./world";

const cache = new Map<string, THREE.Texture>();

function cached(key: string, make: () => THREE.Texture) {
  let tex = cache.get(key);
  if (!tex) {
    tex = make();
    cache.set(key, tex);
  }
  return tex;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement, repeat = true) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Deterministic pseudo random so textures look the same on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed: number) {
  const r = rng(seed);
  for (let i = 0; i < (w * h) / 6; i++) {
    const v = r() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${r() * amount})`;
    ctx.fillRect(r() * w, r() * h, 2, 2);
  }
}

interface StylePalette {
  wall: string;
  trim: string;
  glass: string;
  brick?: boolean;
}

// Grimy, slightly desaturated tones of an early-2000s east coast city
const PALETTES: Record<BuildingStyle, StylePalette> = {
  brick: { wall: "#7d4a3c", trim: "#b8ad9b", glass: "#26303a", brick: true },
  brownstone: { wall: "#6e5040", trim: "#b09878", glass: "#222a33", brick: true },
  concrete: { wall: "#8f8a81", trim: "#b4afa5", glass: "#2b3540" },
  glass: { wall: "#6c7b86", trim: "#b3bcc2", glass: "#7f97a8" },
  beige: { wall: "#a89a82", trim: "#cfc6b4", glass: "#29323b" },
  teal: { wall: "#647d77", trim: "#bcc6c0", glass: "#202c33" },
  garage: { wall: "#77705f", trim: "#a39b88", glass: "#262f37" },
};

/** Dirt: rain streaks running down from the sills and darker blotches. */
function grime(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, strength = 1) {
  const r = rng(seed);
  for (let i = 0; i < 10; i++) {
    const x = r() * w;
    const y = r() * h * 0.6;
    const len = h * (0.2 + r() * 0.5);
    const g = ctx.createLinearGradient(0, y, 0, y + len);
    g.addColorStop(0, `rgba(30,24,18,${0.18 * strength})`);
    g.addColorStop(1, "rgba(30,24,18,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, 1 + r() * 3, len);
  }
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(40,32,24,${0.06 * strength})`;
    ctx.beginPath();
    ctx.ellipse(r() * w, r() * h, 4 + r() * 10, 3 + r() * 8, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paletteFor(style: BuildingStyle) {
  return PALETTES[style];
}

function bricks(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  const bh = 6;
  for (let y = 0; y < h; y += bh) {
    ctx.fillRect(0, y, w, 1);
    const off = (y / bh) % 2 ? 6 : 0;
    for (let x = off; x < w; x += 12) ctx.fillRect(x, y, 1, bh);
  }
}

/** One window cell (one floor high, ~3m wide). Repeated across the facade. */
export function facadeTexture(style: BuildingStyle) {
  return cached(`facade-${style}`, () => {
    const p = PALETTES[style];
    const [c, ctx] = canvas(64, 64);
    if (p.brick) bricks(ctx, 64, 64, p.wall);
    else {
      ctx.fillStyle = p.wall;
      ctx.fillRect(0, 0, 64, 64);
    }
    noise(ctx, 64, 64, 0.08, style.length * 31);

    if (style === "glass") {
      // Curtain wall: big panes with thin mullions
      const g = ctx.createLinearGradient(0, 0, 64, 64);
      g.addColorStop(0, "#9ec3de");
      g.addColorStop(0.5, p.glass);
      g.addColorStop(1, "#4d6f8a");
      ctx.fillStyle = g;
      ctx.fillRect(2, 6, 60, 54);
      ctx.fillStyle = p.trim;
      ctx.fillRect(31, 6, 2, 54);
      ctx.fillRect(0, 0, 64, 6);
    } else {
      // Sill + lintel
      ctx.fillStyle = p.trim;
      ctx.fillRect(14, 12, 36, 4);
      ctx.fillRect(13, 50, 38, 4);
      // Glass with a faint sky reflection
      const g = ctx.createLinearGradient(0, 16, 0, 50);
      g.addColorStop(0, "#6f8ca3");
      g.addColorStop(0.4, p.glass);
      g.addColorStop(1, "#1a232c");
      ctx.fillStyle = g;
      ctx.fillRect(17, 16, 30, 34);
      // Window frame cross
      ctx.fillStyle = p.trim;
      ctx.fillRect(31, 16, 2, 34);
      ctx.fillRect(17, 31, 30, 2);
      // Streaks under the sill
      const s = ctx.createLinearGradient(0, 54, 0, 64);
      s.addColorStop(0, "rgba(25,20,15,0.22)");
      s.addColorStop(1, "rgba(25,20,15,0)");
      ctx.fillStyle = s;
      ctx.fillRect(15, 54, 34, 10);
    }
    grime(ctx, 64, 64, style.length * 13 + 5, style === "glass" ? 0.4 : 1);
    return toTexture(c);
  });
}

/** Ground floor shop front: big display window + door frame. */
export function storefrontTexture(style: BuildingStyle) {
  return cached(`store-${style}`, () => {
    const p = PALETTES[style];
    const [c, ctx] = canvas(128, 64);
    if (p.brick) bricks(ctx, 128, 64, p.wall);
    else {
      ctx.fillStyle = p.wall;
      ctx.fillRect(0, 0, 128, 64);
    }
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 58, 128, 6);
    ctx.fillStyle = p.trim;
    ctx.fillRect(8, 14, 112, 44);
    const g = ctx.createLinearGradient(0, 16, 0, 56);
    g.addColorStop(0, "#8fa9bd");
    g.addColorStop(0.35, "#3c5266");
    g.addColorStop(1, "#141b22");
    ctx.fillStyle = g;
    ctx.fillRect(11, 17, 106, 38);
    ctx.fillStyle = p.trim;
    for (let x = 40; x < 117; x += 32) ctx.fillRect(x, 17, 2, 38);
    // Shelves / goods silhouettes behind the glass
    const r = rng(style.length * 7);
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `hsla(${Math.floor(r() * 360)},45%,55%,0.55)`;
      ctx.fillRect(13 + r() * 98, 40 + r() * 8, 4 + r() * 6, 6);
    }
    noise(ctx, 128, 64, 0.06, 99);
    grime(ctx, 128, 64, style.length * 3 + 1, 0.8);
    // Dirt kicked up along the pavement
    const dirt = ctx.createLinearGradient(0, 44, 0, 64);
    dirt.addColorStop(0, "rgba(40,32,24,0)");
    dirt.addColorStop(1, "rgba(40,32,24,0.35)");
    ctx.fillStyle = dirt;
    ctx.fillRect(0, 44, 128, 20);
    return toTexture(c);
  });
}

export function garageDoorTexture() {
  return cached("garage-door", () => {
    const [c, ctx] = canvas(64, 64);
    ctx.fillStyle = "#b9b9b1";
    ctx.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 6) {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, y, 64, 1);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(0, y + 1, 64, 1);
    }
    // Hazard stripe along the bottom
    for (let x = -64; x < 64; x += 10) {
      ctx.fillStyle = "#f4c20d";
      ctx.beginPath();
      ctx.moveTo(x, 64);
      ctx.lineTo(x + 5, 64);
      ctx.lineTo(x + 13, 56);
      ctx.lineTo(x + 8, 56);
      ctx.fill();
    }
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0, 56, 64, 1);
    noise(ctx, 64, 64, 0.1, 5);
    return toTexture(c, false);
  });
}

/** 10m × 10m tile of road: asphalt, centre double yellow, parking lines. */
export function roadTexture() {
  return cached("road", () => {
    const [c, ctx] = canvas(256, 256);
    ctx.fillStyle = "#6c6b66";
    ctx.fillRect(0, 0, 256, 256);
    noise(ctx, 256, 256, 0.1, 3);
    const r = rng(17);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "rgba(30,28,24,0.14)";
      ctx.beginPath();
      ctx.ellipse(r() * 256, r() * 256, 10 + r() * 30, 6 + r() * 14, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Centre double yellow (x = 128 ± 3)
    ctx.fillStyle = "#d6b24a";
    ctx.fillRect(122, 0, 4, 256);
    ctx.fillRect(130, 0, 4, 256);
    // Parking lane edges at ±3m from centre → 128 ± 77
    ctx.fillStyle = "#d9d9d2";
    ctx.fillRect(48, 0, 3, 256);
    ctx.fillRect(205, 0, 3, 256);
    // Parking bay ticks
    ctx.fillRect(0, 0, 51, 3);
    ctx.fillRect(205, 0, 51, 3);
    return toTexture(c);
  });
}

export function sidewalkTexture() {
  return cached("sidewalk", () => {
    const [c, ctx] = canvas(64, 64);
    ctx.fillStyle = "#c4c1ba";
    ctx.fillRect(0, 0, 64, 64);
    noise(ctx, 64, 64, 0.1, 8);
    grime(ctx, 64, 64, 21, 0.5);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, 64, 1);
    ctx.fillRect(0, 0, 1, 64);
    ctx.fillRect(0, 32, 64, 1);
    ctx.fillRect(32, 0, 1, 64);
    return toTexture(c);
  });
}

export function grassTexture() {
  return cached("grass", () => {
    const [c, ctx] = canvas(64, 64);
    ctx.fillStyle = "#5d8a3a";
    ctx.fillRect(0, 0, 64, 64);
    const r = rng(42);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = r() > 0.5 ? "rgba(40,80,20,0.5)" : "rgba(140,180,80,0.35)";
      ctx.fillRect(r() * 64, r() * 64, 1, 2);
    }
    return toTexture(c);
  });
}

export function crosswalkTexture() {
  return cached("crosswalk", () => {
    const [c, ctx] = canvas(128, 32);
    ctx.clearRect(0, 0, 128, 32);
    ctx.fillStyle = "rgba(235,235,228,0.92)";
    for (let x = 4; x < 128; x += 16) ctx.fillRect(x, 0, 9, 32);
    return toTexture(c, false);
  });
}

/** Painted shop sign. Returns texture plus its aspect ratio. */
export function signTexture(text: string, bg: string, fg: string) {
  const key = `sign-${text}-${bg}-${fg}`;
  const tex = cached(key, () => {
    const h = 96;
    const [m] = canvas(1, 1);
    const mctx = m.getContext("2d")!;
    const font = `900 64px Impact, "Arial Black", "Helvetica Neue", sans-serif`;
    mctx.font = font;
    const w = Math.max(256, Math.ceil(mctx.measureText(text).width + 64));
    const [c, ctx] = canvas(w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillText(text, w / 2 + 3, h / 2 + 5);
    ctx.fillStyle = fg;
    ctx.fillText(text, w / 2, h / 2 + 2);
    const t = toTexture(c, false);
    t.userData.aspect = w / h;
    return t;
  });
  return { texture: tex, aspect: tex.userData.aspect as number };
}

/** Vertical "blade" sign hung perpendicular to a facade (letters stacked). */
export function bladeSignTexture(text: string, bg: string, fg: string) {
  const key = `blade-${text}-${bg}-${fg}`;
  const tex = cached(key, () => {
    const letters = [...text];
    const cell = 72;
    const w = 96;
    const h = letters.length * cell + 24;
    const [c, ctx] = canvas(w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = fg;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.globalAlpha = 1;
    ctx.font = `900 60px Impact, "Arial Black", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    letters.forEach((l, i) => {
      const y = 12 + cell * i + cell / 2;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillText(l, w / 2 + 3, y + 4);
      ctx.fillStyle = fg;
      ctx.fillText(l, w / 2, y);
    });
    const t = toTexture(c, false);
    t.userData.aspect = w / h;
    return t;
  });
  return { texture: tex, aspect: tex.userData.aspect as number };
}

/**
 * Emissive mask for the upper floors at night: a 4×4 block of window cells
 * (matching facadeTexture's layout) where some windows have their lights on.
 * Used with repeat 0.25 so the pattern spans 4 cells before repeating.
 */
export function windowGlowTexture(style: BuildingStyle) {
  return cached(`glow-${style}`, () => {
    const [c, ctx] = canvas(256, 256);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 256);
    const r = rng(style.length * 101 + 3);
    const share = style === "glass" ? 0.5 : 0.38;
    for (let cy = 0; cy < 4; cy++) {
      for (let cx = 0; cx < 4; cx++) {
        if (r() > share) continue;
        const warm = 200 + Math.floor(r() * 55);
        ctx.fillStyle = `rgb(255,${warm},${Math.floor(warm * 0.62)})`;
        const x = cx * 64;
        const y = cy * 64;
        if (style === "glass") ctx.fillRect(x + 2, y + 6, 60, 54);
        else ctx.fillRect(x + 17, y + 16, 30, 34);
      }
    }
    const tex = toTexture(c);
    tex.repeat.set(0.25, 0.25);
    return tex;
  });
}

/** Emissive mask for lit shop windows (matches storefrontTexture's glass area). */
export function storefrontGlowTexture() {
  return cached("glow-store", () => {
    const [c, ctx] = canvas(128, 64);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = "#ffe3b0";
    ctx.fillRect(11, 17, 106, 38);
    return toTexture(c);
  });
}

/** Warm pool of light on the pavement under a street lamp. */
export function lightPoolTexture() {
  return cached("light-pool", () => {
    const [c, ctx] = canvas(128, 128);
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,214,140,0.9)");
    g.addColorStop(0.5, "rgba(255,190,110,0.35)");
    g.addColorStop(1, "rgba(255,180,100,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return toTexture(c, false);
  });
}

/** Soft round blob used as a fake shadow under characters & cars. */
export function blobShadowTexture() {
  return cached("blob", () => {
    const [c, ctx] = canvas(64, 64);
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.6, "rgba(0,0,0,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return toTexture(c, false);
  });
}

/** Vertical fade for the glowing mission marker cylinders. */
export function markerTexture() {
  return cached("marker", () => {
    const [c, ctx] = canvas(4, 64);
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.7, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0.85)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 64);
    return toTexture(c, false);
  });
}

/**
 * Sky dome gradient, repainted as the day goes by (see daylight.ts). Stars
 * fade in after dark. Returns the texture plus a function to repaint it.
 */
export function createSky() {
  const [c, ctx] = canvas(256, 256);
  const tex = toTexture(c, false);
  const r = rng(77);
  const stars = Array.from({ length: 140 }, () => [r() * 256, r() * 110, r() * 0.8 + 0.4] as const);
  const paint = (top: string, mid: string, horizon: string, night: number) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top);
    g.addColorStop(0.35, mid);
    g.addColorStop(0.47, horizon);
    g.addColorStop(1, horizon);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    if (night > 0.05) {
      for (const [x, y, size] of stars) {
        ctx.fillStyle = `rgba(255,255,240,${night * (0.35 + size * 0.5)})`;
        ctx.fillRect(x, y, size, size);
      }
    }
    tex.needsUpdate = true;
  };
  return { texture: tex, paint };
}
