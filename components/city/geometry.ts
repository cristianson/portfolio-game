/**
 * Geometry Helpers
 *
 * BoxGeometry maps every texture 0..1 per face, which stretches window grids.
 * `worldBox` rescales the UVs so a texture repeats once per (cellW × cellH)
 * meters on every face, letting one shared texture fit buildings of any size.
 */

import * as THREE from "three";
import type { Facing } from "./world";

export function worldBox(w: number, h: number, d: number, cellW: number, cellH: number) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  // Face order: +x, -x, +y, -y, +z, -z (4 vertices each)
  const spans: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let f = 0; f < 6; f++) {
    const [su, sv] = spans[f];
    for (let i = 0; i < 4; i++) {
      const idx = f * 4 + i;
      uv.setXY(idx, (uv.getX(idx) * su) / cellW, (uv.getY(idx) * sv) / cellH);
    }
  }
  uv.needsUpdate = true;
  return geo;
}

export const FACE_INDEX: Record<Facing, number> = { "+x": 0, "-x": 1, "+z": 4, "-z": 5 };

/**
 * Frame for decorating a facade: a point on the facade plane plus a Y rotation
 * so that local +Z points away from the building and local +X runs along it.
 */
export function facadeFrame(b: { x0: number; x1: number; z0: number; z1: number; facing: Facing }) {
  const cx = (b.x0 + b.x1) / 2;
  const cz = (b.z0 + b.z1) / 2;
  switch (b.facing) {
    case "-x":
      return { x: b.x0, z: cz, rot: -Math.PI / 2, length: b.z1 - b.z0, toLocal: (world: number) => world - cz };
    case "+x":
      return { x: b.x1, z: cz, rot: Math.PI / 2, length: b.z1 - b.z0, toLocal: (world: number) => cz - world };
    case "+z":
      return { x: cx, z: b.z1, rot: 0, length: b.x1 - b.x0, toLocal: (world: number) => world - cx };
    case "-z":
      return { x: cx, z: b.z0, rot: Math.PI, length: b.x1 - b.x0, toLocal: (world: number) => cx - world };
  }
}
