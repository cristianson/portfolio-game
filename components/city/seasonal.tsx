/**
 * Seasonal Dressing
 *
 * Everything that only shows up at certain times of year (see season.ts):
 * flowers and drifting blossom in spring, café parasols and an ice-cream cart
 * in summer, fallen and falling leaves in autumn, snow on the roofs, kerbs and
 * in the air in winter, and the Christmas tree, gifts, wreaths and fairy
 * lights from 1 December to 6 January. Small repeated things are instanced so
 * each kind costs one draw call.
 */

"use client";

import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  addColliders,
  BUILDINGS,
  CROSSWALKS,
  FLOOR_HEIGHT,
  GROUND_FLOOR_HEIGHT,
  groundHeight,
  PARK,
  PARK_TREES,
  PROPS,
  ROAD_HALF,
  SIDEWALK_HEIGHT,
  SIDEWALK_OUTER,
  STREET_HALF,
  STREET_LENGTH,
  type Box2,
} from "./world";
import { facadeFrame } from "./geometry";
import { flakeTexture, leafTexture, signTexture, stripesTexture } from "./textures";
import { registerNightGlow, unregisterNightGlow } from "./daylight";
import { parkTreeScale, starGeometry } from "./props";
import type { Season } from "./season";

const SH = SIDEWALK_HEIGHT;

/** Deterministic pseudo random sequence so the decorations sit in the same place every visit. */
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

/** Canopy centre and radius of every tree on the street and in the park. */
const TREES = [
  ...PROPS.filter((p) => p.kind === "tree").map((p) => ({ x: p.x, z: p.z, y: SH + 3.3, r: 1.35 })),
  ...PARK_TREES.map(([x, z], i) => {
    const s = parkTreeScale(i);
    return { x, z, y: SH + 3.3 * s, r: 1.35 * s };
  }),
];

const CHRISTMAS_TREE = { x: -16, z: 15 };

interface Item {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
  /** Uniform scale, or [x, y, z]. */
  s?: number | [number, number, number];
  color?: string;
}

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

function setInstance(mesh: THREE.InstancedMesh, i: number, it: Item) {
  dummy.position.set(it.x, it.y, it.z);
  dummy.rotation.set(it.rx ?? 0, it.ry ?? 0, it.rz ?? 0, "YXZ");
  if (Array.isArray(it.s)) dummy.scale.set(...it.s);
  else dummy.scale.setScalar(it.s ?? 1);
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}

function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, items: Item[]) {
  const mesh = new THREE.InstancedMesh(geometry, material, items.length);
  items.forEach((it, i) => {
    setInstance(mesh, i, it);
    if (it.color) mesh.setColorAt(i, tmpColor.set(it.color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

/** Builds a three object once and frees its GPU buffers when the season changes. */
function useObject<T extends THREE.Mesh | THREE.Points>(make: () => T) {
  const [obj] = useState(make);
  useEffect(
    () => () => {
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    },
    [obj]
  );
  return obj;
}

function Instances({ make }: { make: () => THREE.InstancedMesh }) {
  return <primitive object={useObject(make)} />;
}

function useColliders(boxes: Box2[]) {
  useEffect(() => addColliders(boxes), [boxes]);
}

const pick = <T,>(list: T[], r: number) => list[Math.floor(r * list.length) % list.length];

// ── Winter ──────────────────────────────────────────────────────

const SNOW_COUNT = 1600;
const SNOW_SPAN = 44;
const SNOW_HEIGHT = 18;

/** Snowflakes in a box that travels with the camera (flakes wrap around its edges). */
function Snowfall({ night }: { night: number }) {
  const [speeds] = useState(() => {
    const rand = seededRandom(5);
    return Float32Array.from({ length: SNOW_COUNT }, () => 0.9 + rand() * 0.8);
  });
  const points = useObject(() => {
    const rand = seededRandom(3);
    const pos = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (rand() - 0.5) * SNOW_SPAN;
      pos[i * 3 + 1] = rand() * SNOW_HEIGHT;
      pos[i * 3 + 2] = (rand() - 0.5) * SNOW_SPAN;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: 0.17, map: flakeTexture(), transparent: true, depthWrite: false })
    );
    p.frustumCulled = false;
    return p;
  });

  // Flakes are unlit, so dim them by hand after dark
  useEffect(() => {
    (points.material as THREE.PointsMaterial).color.set("#ffffff").lerp(tmpColor.set("#8e9bb4"), night);
  }, [points, night]);

  useFrame(({ camera, clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const a = attr.array as Float32Array;
    const half = SNOW_SPAN / 2;
    for (let i = 0; i < SNOW_COUNT; i++) {
      const k = i * 3;
      let x = a[k] + Math.sin(t * 0.7 + i) * 0.35 * dt;
      let y = a[k + 1] - speeds[i] * dt;
      let z = a[k + 2] + Math.cos(t * 0.5 + i * 0.7) * 0.2 * dt;
      if (y < 0) y += SNOW_HEIGHT;
      if (x - camera.position.x > half) x -= SNOW_SPAN;
      else if (x - camera.position.x < -half) x += SNOW_SPAN;
      if (z - camera.position.z > half) z -= SNOW_SPAN;
      else if (z - camera.position.z < -half) z += SNOW_SPAN;
      a[k] = x;
      a[k + 1] = y;
      a[k + 2] = z;
    }
    attr.needsUpdate = true;
  });

  return <primitive object={points} />;
}

/** Snow on roofs, cornices and shop ledges, plus banks along the kerbs. */
function winterSnow() {
  const items: Item[] = [];
  for (const b of BUILDINGS) {
    const w = b.x1 - b.x0;
    const d = b.z1 - b.z0;
    const cx = (b.x0 + b.x1) / 2;
    const cz = (b.z0 + b.z1) / 2;
    const roofY = SH + GROUND_FLOOR_HEIGHT + (b.floors - 1) * FLOOR_HEIGHT;
    items.push({ x: cx, y: roofY + 0.57, z: cz, s: [w - 0.5, 0.14, d - 0.5] });
    items.push({ x: cx, y: roofY + 0.425, z: cz, s: [w + 0.5, 0.05, d + 0.5] });
    items.push({ x: cx, y: SH + GROUND_FLOOR_HEIGHT + 0.145, z: cz, s: [w + 0.3, 0.04, d + 0.3] });
  }
  // Shovelled banks on the sidewalk edge, open at the crosswalks
  const end = STREET_LENGTH / 2;
  const cuts = [-end, ...CROSSWALKS.flatMap((z) => [z - 1.7, z + 1.7]), end];
  for (const side of [1, -1]) {
    for (let i = 0; i < cuts.length; i += 2) {
      const [z0, z1] = [cuts[i], cuts[i + 1]];
      items.push({ x: side * (ROAD_HALF + 0.3), y: SH + 0.08, z: (z0 + z1) / 2, s: [0.5, 0.16, z1 - z0] });
      items.push({ x: side * (ROAD_HALF + 0.22), y: SH + 0.19, z: (z0 + z1) / 2, s: [0.28, 0.08, z1 - z0 - 0.4] });
    }
  }
  return instanced(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: "#f2f5f8" }), items);
}

// ── Leaves, petals, flowers ─────────────────────────────────────

const AUTUMN_LEAVES = ["#d2691e", "#e8a33d", "#c0392b", "#f1c232", "#8b5a2b", "#e07b39"];
const PETALS = ["#f7c6d6", "#f2a7c1", "#fbe3ea", "#ffffff"];
const FLOWERS = ["#ff6fa8", "#ffd23f", "#ffffff", "#b07cff", "#ff5a4a", "#ff9f40"];

function leafMaterial() {
  return new THREE.MeshLambertMaterial({ map: leafTexture(), alphaTest: 0.5, side: THREE.DoubleSide });
}

/** Leaves (autumn) or petals (spring) lying on the ground, mostly under the trees. */
function groundScatter(season: "autumn" | "spring") {
  const rand = seededRandom(season === "autumn" ? 11 : 13);
  const colors = season === "autumn" ? AUTUMN_LEAVES : PETALS;
  const size = season === "autumn" ? 0.24 : 0.11;
  const items: Item[] = [];
  const add = (x: number, z: number) =>
    items.push({
      x,
      y: groundHeight(x, z) + 0.012 + items.length * 0.00002,
      z,
      rx: -Math.PI / 2,
      ry: rand() * Math.PI * 2,
      s: size * (0.8 + rand() * 0.5),
      color: pick(colors, rand()),
    });
  for (const t of TREES) {
    const n = season === "autumn" ? 60 : 30;
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * t.r * 1.9;
      add(t.x + Math.cos(a) * r, t.z + Math.sin(a) * r);
    }
  }
  if (season === "autumn") {
    // Blown along the sidewalks, the gutters and across the park
    for (let i = 0; i < 420; i++) {
      const side = rand() > 0.5 ? 1 : -1;
      add(side * (ROAD_HALF + rand() * (SIDEWALK_OUTER - ROAD_HALF)), (rand() - 0.5) * 2 * STREET_HALF);
    }
    for (let i = 0; i < 180; i++) {
      const side = rand() > 0.5 ? 1 : -1;
      add(side * (ROAD_HALF - rand() * 1.4), (rand() - 0.5) * 2 * STREET_HALF);
    }
    for (let i = 0; i < 300; i++) {
      add(PARK.x0 + 0.5 + rand() * (PARK.x1 - PARK.x0 - 1), PARK.z0 + 0.5 + rand() * (PARK.z1 - PARK.z0 - 1));
    }
  }
  return instanced(new THREE.PlaneGeometry(1, 1), leafMaterial(), items);
}

const FALLING_PER_TREE = 6;

/** A few leaves or petals at a time drifting down from each canopy. */
function Falling({ season }: { season: "autumn" | "spring" }) {
  const count = TREES.length * FALLING_PER_TREE;
  const [state] = useState(() => {
    const rand = seededRandom(17);
    return Array.from({ length: count }, (_, i) => {
      const tree = TREES[Math.floor(i / FALLING_PER_TREE)];
      return { tree, x: 0, y: -1, z: 0, phase: rand() * 10, fall: 0.5 + rand() * 0.4, rand, delay: rand() * 6 };
    });
  });
  const mesh = useObject(() => {
    const rand = seededRandom(19);
    const colors = season === "autumn" ? AUTUMN_LEAVES : PETALS;
    const m = instanced(
      new THREE.PlaneGeometry(1, 1),
      leafMaterial(),
      state.map(() => ({ x: 0, y: -10, z: 0, color: pick(colors, rand()) }))
    );
    m.frustumCulled = false;
    return m;
  });
  const size = season === "autumn" ? 0.24 : 0.12;

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    state.forEach((p, i) => {
      if (p.delay > 0) {
        p.delay -= dt;
        return;
      }
      const ground = groundHeight(p.x, p.z) + 0.02;
      if (p.y <= ground) {
        // Back up into the canopy
        const a = p.rand() * Math.PI * 2;
        const r = p.rand() * p.tree.r * 0.9;
        p.x = p.tree.x + Math.cos(a) * r;
        p.z = p.tree.z + Math.sin(a) * r;
        p.y = p.tree.y - p.tree.r * 0.4 + p.rand() * p.tree.r * 0.3;
      }
      p.y -= p.fall * dt;
      p.x += Math.sin(t * 1.3 + p.phase) * 0.5 * dt + 0.15 * dt;
      p.z += Math.cos(t * 0.9 + p.phase) * 0.35 * dt;
      setInstance(mesh, i, {
        x: p.x,
        y: Math.max(p.y, ground),
        z: p.z,
        rx: t * 2.1 + p.phase,
        ry: p.phase,
        rz: Math.sin(t * 1.7 + p.phase) * 1.2,
        s: size,
      });
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <primitive object={mesh} />;
}

/** Spring flowers: a meadow in the park and a ring around every street tree. */
function flowerItems() {
  const rand = seededRandom(23);
  const spots: [number, number][] = [];
  while (spots.length < 280) {
    const x = PARK.x0 + 0.6 + rand() * (PARK.x1 - PARK.x0 - 1.2);
    const z = PARK.z0 + 0.6 + rand() * (PARK.z1 - PARK.z0 - 1.2);
    // Keep the gravel path and tree trunks clear
    if (Math.abs(z - (PARK.z0 + PARK.z1) / 2) < 1.5 && x > -21.2) continue;
    if (PARK_TREES.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 0.5)) continue;
    spots.push([x, z]);
  }
  for (const p of PROPS) {
    if (p.kind !== "tree") continue;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rand();
      const r = 0.28 + rand() * 0.22;
      spots.push([p.x + Math.cos(a) * r, p.z + Math.sin(a) * r]);
    }
  }
  return spots.map(([x, z]) => ({ x, z, h: 0.16 + rand() * 0.14, color: pick(FLOWERS, rand()) }));
}

function Flowers() {
  const [flowers] = useState(flowerItems);
  return (
    <>
      <Instances
        make={() =>
          instanced(
            new THREE.BoxGeometry(0.025, 1, 0.025),
            new THREE.MeshLambertMaterial({ color: "#3f7a2c" }),
            flowers.map((f) => ({ x: f.x, y: SH + f.h / 2, z: f.z, s: [1, f.h, 1] }))
          )
        }
      />
      <Instances
        make={() =>
          instanced(
            new THREE.IcosahedronGeometry(0.09, 0),
            new THREE.MeshLambertMaterial({ flatShading: true }),
            flowers.map((f) => ({ x: f.x, y: SH + f.h, z: f.z, ry: f.h * 40, color: f.color }))
          )
        }
      />
    </>
  );
}

// ── Summer ──────────────────────────────────────────────────────

const CAFE_TABLES = [
  { x: -8.05, z: -11.5, colors: ["#d63a2f", "#f4efe6"] },
  { x: -8.05, z: 20.9, colors: ["#2a7f62", "#f4efe6"] },
];
const ICE_CREAM = { x: -10.8, z: 13 };

function Parasol({ colors, radius, y }: { colors: string[]; radius: number; y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <coneGeometry args={[radius, 0.45, 8, 1, true]} />
        <meshLambertMaterial map={stripesTexture(colors[0], colors[1])} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshLambertMaterial color="#f4efe6" />
      </mesh>
    </group>
  );
}

function CafeTable({ colors }: { colors: string[] }) {
  return (
    <group>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.3, 6]} />
        <meshLambertMaterial color="#d8d4cc" />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.05, 12]} />
        <meshLambertMaterial color="#f4efe6" />
      </mesh>
      <Parasol colors={colors} radius={1.35} y={2.35} />
      {[-0.62, 0.62].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.4]} />
            <meshLambertMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0, 0.72, z > 0 ? 0.18 : -0.18]}>
            <boxGeometry args={[0.4, 0.5, 0.04]} />
            <meshLambertMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.05, 0.45, 0.05]} />
            <meshLambertMaterial color="#3a3a3a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function IceCreamCart() {
  const { texture, aspect } = signTexture("GELATO", "#ff8fb8", "#ffffff");
  return (
    <group>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.85, 0.8, 1.5]} />
        <meshLambertMaterial color="#f7e6ec" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.87, 0.12, 1.52]} />
        <meshLambertMaterial color="#ff8fb8" />
      </mesh>
      <mesh position={[0, 1.24, 0]}>
        <boxGeometry args={[0.9, 0.08, 1.55]} />
        <meshLambertMaterial color="#cfe9ef" />
      </mesh>
      <mesh position={[0.44, 0.88, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.32 * aspect, 0.32]} />
        <meshBasicMaterial map={texture} toneMapped={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} position={[0, 0.24, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.95, 10]} />
          <meshLambertMaterial color="#2a2a2a" />
        </mesh>
      ))}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
        <meshLambertMaterial color="#d8d4cc" />
      </mesh>
      <Parasol colors={["#ff8fb8", "#ffffff"]} radius={1.05} y={2.4} />
    </group>
  );
}

const SUMMER_COLLIDERS: Box2[] = [
  ...CAFE_TABLES.map((t) => ({ x0: t.x - 0.45, x1: t.x + 0.45, z0: t.z - 0.85, z1: t.z + 0.85 })),
  { x0: ICE_CREAM.x - 0.5, x1: ICE_CREAM.x + 0.5, z0: ICE_CREAM.z - 0.8, z1: ICE_CREAM.z + 0.8 },
];

function Summer() {
  useColliders(SUMMER_COLLIDERS);
  return (
    <group>
      {CAFE_TABLES.map((t) => (
        <group key={t.z} position={[t.x, SH, t.z]}>
          <CafeTable colors={t.colors} />
        </group>
      ))}
      <group position={[ICE_CREAM.x, SH, ICE_CREAM.z]}>
        <IceCreamCart />
      </group>
    </group>
  );
}

// ── Christmas ───────────────────────────────────────────────────

const BULB_COLORS = ["#ff4a4a", "#4dff7a", "#ffd23f", "#4aa8ff", "#ff7ad9"];
const WARM_WHITE = "#fff0c2";

/** Every fairy light on the street: roof lines, shop ledges, street trees, the Christmas tree. */
function bulbItems() {
  const rand = seededRandom(29);
  const items: Item[] = [];
  const bulb = (x: number, y: number, z: number, color: string) => items.push({ x, y, z, color });

  // Scalloped strings along the street facades
  for (const b of BUILDINGS) {
    if (b.facing !== "+x" && b.facing !== "-x") continue;
    const f = facadeFrame(b);
    const roofY = SH + GROUND_FLOOR_HEIGHT + (b.floors - 1) * FLOOR_HEIGHT;
    const strings = [
      { y: roofY - 0.08, lz: 0.32, sag: 0.3, span: 1.6, warm: true },
      { y: SH + GROUND_FLOOR_HEIGHT - 0.18, lz: 0.22, sag: 0.22, span: 1.4, warm: false },
    ];
    for (const s of strings) {
      const usable = f.length - 0.8;
      const n = Math.floor(usable / 0.28);
      for (let k = 0; k <= n; k++) {
        const lx = -usable / 2 + (k / n) * usable;
        const along = (lx + usable / 2) / s.span;
        const y = s.y - Math.sin((along - Math.floor(along)) * Math.PI) * s.sag;
        bulb(
          f.x + Math.cos(f.rot) * lx + Math.sin(f.rot) * s.lz,
          y,
          f.z - Math.sin(f.rot) * lx + Math.cos(f.rot) * s.lz,
          s.warm ? WARM_WHITE : BULB_COLORS[k % BULB_COLORS.length]
        );
      }
    }
  }

  // Wrapped around every canopy
  for (const t of TREES) {
    const n = 34;
    for (let i = 0; i < n; i++) {
      // Fibonacci sphere, skipping the underside
      const v = 1 - (i / (n - 1)) * 1.5;
      const ring = Math.sqrt(Math.max(0, 1 - v * v));
      const a = i * 2.39996;
      bulb(t.x + Math.cos(a) * ring * t.r * 1.02, t.y + v * t.r, t.z + Math.sin(a) * ring * t.r * 1.02, pick(BULB_COLORS, rand()));
    }
  }

  // Spiral down the big tree in the park
  for (let i = 0; i < 90; i++) {
    const h = i / 90;
    const a = i * 0.55;
    const r = 0.25 + (1 - h) * 1.75;
    bulb(CHRISTMAS_TREE.x + Math.cos(a) * r, SH + 0.8 + h * 4.6, CHRISTMAS_TREE.z + Math.sin(a) * r, pick(BULB_COLORS, rand()));
  }
  return items;
}

function FairyLights() {
  const [base] = useState(bulbItems);
  const mesh = useObject(() =>
    instanced(new THREE.OctahedronGeometry(0.075, 0), new THREE.MeshBasicMaterial({ toneMapped: false }), base)
  );
  // After dark every bulb gets a soft coloured halo
  const halos = useObject(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(base.flatMap((b) => [b.x, b.y, b.z]), 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(base.flatMap((b) => tmpColor.set(b.color!).toArray()), 3));
    const p = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.6,
        map: flakeTexture(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );
    p.frustumCulled = false;
    return p;
  });
  useEffect(() => {
    const m = halos.material as THREE.Material;
    registerNightGlow(m, 0.85);
    return () => unregisterNightGlow(m);
  }, [halos]);

  // Twinkle: every so often a handful of bulbs dim for a moment
  useFrame(({ clock }) => {
    const tick = Math.floor(clock.elapsedTime * 3);
    if (mesh.userData.tick === tick) return;
    mesh.userData.tick = tick;
    for (let i = 0; i < base.length; i++) {
      const on = ((i * 7919 + tick * 104729) % 23) > 2;
      mesh.setColorAt(i, tmpColor.set(base[i].color!).multiplyScalar(on ? 1 : 0.3));
    }
    mesh.instanceColor!.needsUpdate = true;
  });

  return (
    <>
      <primitive object={mesh} />
      <primitive object={halos} />
    </>
  );
}

function ChristmasTree() {
  const baubles = () => {
    const rand = seededRandom(31);
    const items: Item[] = [];
    for (let i = 0; i < 34; i++) {
      const h = rand() * 0.9;
      const a = rand() * Math.PI * 2;
      const r = 0.2 + (1 - h) * 1.8;
      items.push({
        x: CHRISTMAS_TREE.x + Math.cos(a) * r,
        y: SH + 0.75 + h * 4.6,
        z: CHRISTMAS_TREE.z + Math.sin(a) * r,
        color: pick(["#c8202a", "#e8b53a", "#d9dde3", "#2f6fd6"], rand()),
      });
    }
    return instanced(new THREE.IcosahedronGeometry(0.13, 1), new THREE.MeshLambertMaterial(), items);
  };
  return (
    <group>
      <group position={[CHRISTMAS_TREE.x, SH, CHRISTMAS_TREE.z]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.7, 6]} />
          <meshLambertMaterial color="#5b3d24" />
        </mesh>
        {[
          [2.05, 2.4, 1.75],
          [1.6, 2.1, 3.15],
          [1.1, 1.7, 4.35],
          [0.6, 1.2, 5.3],
        ].map(([r, h, y]) => (
          <mesh key={y} position={[0, y, 0]}>
            <coneGeometry args={[r, h, 9]} />
            <meshLambertMaterial color="#1f5a35" flatShading />
          </mesh>
        ))}
        <mesh position={[0, 6.1, 0]} geometry={starGeometry()}>
          <meshBasicMaterial color="#ffd84a" toneMapped={false} />
        </mesh>
        <mesh position={[0, 6.1, 0]} rotation={[0, Math.PI / 2, 0]} geometry={starGeometry()}>
          <meshBasicMaterial color="#ffd84a" toneMapped={false} />
        </mesh>
      </group>
      <Instances make={baubles} />
    </group>
  );
}

function Gift({ size, color, ribbon, rot = 0 }: { size: [number, number, number]; color: string; ribbon: string; rot?: number }) {
  const [w, h, d] = size;
  return (
    <group rotation={[0, rot, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={size} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w + 0.02, h + 0.02, 0.07]} />
        <meshLambertMaterial color={ribbon} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.07, h + 0.02, d + 0.02]} />
        <meshLambertMaterial color={ribbon} />
      </mesh>
      {[0.6, -0.6].map((a) => (
        <mesh key={a} position={[0, h + 0.05, 0]} rotation={[0, 0, a]}>
          <boxGeometry args={[0.16, 0.08, 0.06]} />
          <meshLambertMaterial color={ribbon} />
        </mesh>
      ))}
    </group>
  );
}

const GIFT_STYLES: [string, string][] = [
  ["#c8202a", "#ffd84a"],
  ["#2f6fd6", "#ffffff"],
  ["#2a7f4a", "#c8202a"],
  ["#f4efe6", "#c8202a"],
  ["#7a3fb0", "#ffd84a"],
];

/** Under the tree (keeping the path side open) and on a few doorsteps. */
const GIFTS = (() => {
  const rand = seededRandom(37);
  const list: { x: number; y: number; z: number; size: [number, number, number]; style: [string, string]; rot: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const a = 0.8 + (i / 8) * (Math.PI * 2 - 1.6);
    const r = 2.1 + rand() * 0.4;
    const s = 0.35 + rand() * 0.3;
    list.push({
      x: CHRISTMAS_TREE.x + Math.cos(a) * r,
      y: SH,
      z: CHRISTMAS_TREE.z + Math.sin(a) * r,
      size: [s, s * (0.7 + rand() * 0.6), s],
      style: GIFT_STYLES[i % GIFT_STYLES.length],
      rot: rand() * Math.PI,
    });
  }
  for (const [x, z] of [
    [8.5, -20.9],
    [-8.5, -12.3],
    [8.5, 20.3],
  ]) {
    list.push({ x, y: SH, z, size: [0.5, 0.4, 0.5], style: GIFT_STYLES[list.length % 5], rot: 0.3 });
    list.push({ x: x * 0.99, y: SH + 0.4, z: z + 0.04, size: [0.32, 0.3, 0.32], style: GIFT_STYLES[(list.length + 2) % 5], rot: -0.4 });
  }
  return list;
})();

const CHRISTMAS_COLLIDERS: Box2[] = [
  { x0: CHRISTMAS_TREE.x - 1.5, x1: CHRISTMAS_TREE.x + 1.5, z0: CHRISTMAS_TREE.z - 1.5, z1: CHRISTMAS_TREE.z + 1.5 },
  ...GIFTS.map((g) => ({ x0: g.x - 0.3, x1: g.x + 0.3, z0: g.z - 0.3, z1: g.z + 0.3 })),
];

/** A wreath on every front door. */
function Wreaths() {
  return (
    <>
      {BUILDINGS.filter((b) => b.door !== undefined && b.style !== "garage").map((b) => {
        const f = facadeFrame(b);
        const y = b.stoop ? 2.6 : b.style === "glass" ? 2.15 : 1.95;
        return (
          <group key={b.id} position={[f.x, SH, f.z]} rotation={[0, f.rot, 0]}>
            <group position={[f.toLocal(b.door!), y, 0.13]}>
              <mesh>
                <torusGeometry args={[0.24, 0.075, 6, 12]} />
                <meshLambertMaterial color="#1f5a35" flatShading />
              </mesh>
              {[0.5, -0.5].map((a) => (
                <mesh key={a} position={[0, -0.24, 0.06]} rotation={[0, 0, a]}>
                  <boxGeometry args={[0.16, 0.08, 0.04]} />
                  <meshLambertMaterial color="#c8202a" />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}
    </>
  );
}

function Christmas() {
  useColliders(CHRISTMAS_COLLIDERS);
  return (
    <group>
      <ChristmasTree />
      {GIFTS.map((g, i) => (
        <group key={i} position={[g.x, g.y, g.z]}>
          <Gift size={g.size} color={g.style[0]} ribbon={g.style[1]} rot={g.rot} />
        </group>
      ))}
      <Wreaths />
      <FairyLights />
    </group>
  );
}

export function Seasonal({ season, christmas, night }: { season: Season; christmas: boolean; night: number }) {
  return (
    <group>
      {season === "winter" && (
        <>
          <Instances make={winterSnow} />
          <Snowfall night={night} />
        </>
      )}
      {season === "autumn" && (
        <>
          <Instances make={() => groundScatter("autumn")} />
          <Falling season="autumn" />
        </>
      )}
      {season === "spring" && (
        <>
          <Flowers />
          <Instances make={() => groundScatter("spring")} />
          <Falling season="spring" />
        </>
      )}
      {season === "summer" && <Summer />}
      {christmas && <Christmas />}
    </group>
  );
}
