/**
 * Collision Helpers
 *
 * Everything collides on the ground plane: the player is a circle, the world
 * is a list of axis-aligned boxes (see COLLIDERS in world.ts).
 */

import type { Box2 } from "./world";

/** Push a circle out of every box it overlaps. Mutates `p`. */
export function resolveCircle(p: { x: number; z: number }, r: number, boxes: Box2[]) {
  for (let iter = 0; iter < 2; iter++) {
    for (const b of boxes) {
      if (p.x < b.x0 - r || p.x > b.x1 + r || p.z < b.z0 - r || p.z > b.z1 + r) continue;
      const cx = Math.max(b.x0, Math.min(p.x, b.x1));
      const cz = Math.max(b.z0, Math.min(p.z, b.z1));
      const dx = p.x - cx;
      const dz = p.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        const push = (r - d) / d;
        p.x += dx * push;
        p.z += dz * push;
      } else {
        // Centre inside the box: leave by the nearest side
        const left = p.x - b.x0;
        const right = b.x1 - p.x;
        const down = p.z - b.z0;
        const up = b.z1 - p.z;
        const m = Math.min(left, right, down, up);
        if (m === left) p.x = b.x0 - r;
        else if (m === right) p.x = b.x1 + r;
        else if (m === down) p.z = b.z0 - r;
        else p.z = b.z1 + r;
      }
    }
  }
}

/** Push a circle away from other circles (pedestrians). Mutates `p`. */
export function resolveCircles(p: { x: number; z: number }, r: number, others: { x: number; z: number }[], otherR: number) {
  const min = r + otherR;
  for (const o of others) {
    const dx = p.x - o.x;
    const dz = p.z - o.z;
    const d2 = dx * dx + dz * dz;
    if (d2 >= min * min || d2 < 1e-8) continue;
    const d = Math.sqrt(d2);
    const push = (min - d) / d;
    p.x += dx * push;
    p.z += dz * push;
  }
}

/**
 * First hit (0..1) of the segment a→b against solid boxes, or 1 if clear.
 * Used to keep the camera from clipping into buildings.
 */
export function segmentHit(ax: number, az: number, bx: number, bz: number, boxes: Box2[], pad = 0.3) {
  let tMin = 1;
  const dx = bx - ax;
  const dz = bz - az;
  for (const b of boxes) {
    if (!b.solid) continue;
    let t0 = 0;
    let t1 = 1;
    const slabs: [number, number, number, number][] = [
      [ax, dx, b.x0 - pad, b.x1 + pad],
      [az, dz, b.z0 - pad, b.z1 + pad],
    ];
    let hit = true;
    for (const [o, dir, lo, hi] of slabs) {
      if (Math.abs(dir) < 1e-9) {
        if (o < lo || o > hi) {
          hit = false;
          break;
        }
        continue;
      }
      let ta = (lo - o) / dir;
      let tb = (hi - o) / dir;
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta);
      t1 = Math.min(t1, tb);
      if (t0 > t1) {
        hit = false;
        break;
      }
    }
    if (hit && t0 < tMin) tMin = t0;
  }
  return tMin;
}
