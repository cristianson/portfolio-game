/**
 * Projects Gallery
 *
 * The inside of the Built Projects building: a classic museum hall with
 * marble floors, bordeaux damask walls, gold frames and velvet ropes. Every
 * project hangs as a painting (its cover image, or a title card until it has
 * one), the newest as the centrepiece. A guard greets you at the door, two
 * visitors wander between the paintings and the guestbook sits by the exit.
 * Layout lives in museum.ts.
 */

"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Character, PEDESTRIAN_LOOKS, type Look, type Motion } from "./character";
import { PROJECTS } from "./content";
import {
  BENCHES,
  EXIT,
  GUARD,
  GUESTBOOK,
  HALL,
  PAINTINGS,
  PILASTERS,
  PORTRAIT,
  ROPE_DISTANCE,
  VISITOR_ROUTES,
  type PaintingDef,
  type Waypoint,
} from "./museum";
import {
  carpetTexture,
  damaskTexture,
  engravingTexture,
  lightPoolTexture,
  marbleTexture,
  markerTexture,
  signTexture,
  sketchTexture,
  titleCardTexture,
} from "./textures";
import { angleDiff, type GameStore } from "./store";

const HX = HALL.w / 2;
const HZ = HALL.d / 2;

const mat = (color: string) => new THREE.MeshLambertMaterial({ color });

const M = {
  gold: mat("#c9a03a"),
  goldDark: mat("#7a5a1e"),
  brass: mat("#b8913f"),
  wainscot: mat("#3b2216"),
  cornice: mat("#e8dcc4"),
  ceiling: mat("#d8cdb6"),
  wood: mat("#5a3520"),
  velvet: mat("#8e1b2a"),
  stone: mat("#cfc6b4"),
  plant: new THREE.MeshLambertMaterial({ color: "#3f6b34", flatShading: true }),
  paper: mat("#f4efe2"),
  ink: mat("#151515"),
  backing: mat("#1a1412"),
  bulb: new THREE.MeshBasicMaterial({ color: "#ffe7b0", toneMapped: false }),
  wash: new THREE.MeshBasicMaterial({
    map: lightPoolTexture(),
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }),
};

const GUARD_LOOK: Look = {
  skin: "#c58c62",
  hair: "#1a1a1a",
  hairStyle: "cap",
  cap: "#1d2a44",
  shirt: "#e8e4da",
  jacket: "#1d2a44",
  pants: "#1d2a44",
  shoes: "#111111",
  mustache: true,
};

/** Texture repeated `rx` × `ry` times (clones the shared canvas texture). */
function tiled(tex: THREE.Texture, rx: number, ry: number) {
  const t = tex.clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}

/** Y rotation that turns local +Z towards (nx, nz). */
const facing = (nx: number, nz: number) => Math.atan2(nx, nz);

// ── The room ────────────────────────────────────────────────────

function Wall({ length, x, z, rot }: { length: number; x: number; z: number; rot: number }) {
  const paper = useMemo(() => new THREE.MeshLambertMaterial({ map: tiled(damaskTexture(), length, HALL.h - 1.6) }), [length]);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, (HALL.h + 1.1) / 2, 0]} material={paper}>
        <planeGeometry args={[length, HALL.h - 1.1]} />
      </mesh>
      {/* Wood panelling, chair rail and cornice */}
      <mesh position={[0, 0.55, 0.04]} material={M.wainscot}>
        <boxGeometry args={[length, 1.1, 0.08]} />
      </mesh>
      <mesh position={[0, 1.12, 0.07]} material={M.brass}>
        <boxGeometry args={[length, 0.07, 0.07]} />
      </mesh>
      <mesh position={[0, HALL.h - 0.25, 0.12]} material={M.cornice}>
        <boxGeometry args={[length, 0.5, 0.24]} />
      </mesh>
    </group>
  );
}

function Pilaster({ x, z, alongX }: { x: number; z: number; alongX: boolean }) {
  return (
    <group position={[x, 0, z]} rotation={[0, alongX ? 0 : Math.PI / 2, 0]}>
      <mesh position={[0, HALL.h / 2, 0]} material={M.cornice}>
        <boxGeometry args={[0.6, HALL.h, 0.5]} />
      </mesh>
      <mesh position={[0, 0.15, 0]} material={M.stone}>
        <boxGeometry args={[0.8, 0.3, 0.62]} />
      </mesh>
      <mesh position={[0, HALL.h - 0.7, 0]} material={M.stone}>
        <boxGeometry args={[0.8, 0.25, 0.62]} />
      </mesh>
    </group>
  );
}

function Chandelier({ z }: { z: number }) {
  return (
    <group position={[0, HALL.h - 1.6, z]}>
      <mesh position={[0, 0.8, 0]} material={M.brass}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={M.gold}>
        <torusGeometry args={[0.8, 0.05, 6, 16]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.8, 0.14, Math.sin(a) * 0.8]} material={M.bulb}>
            <sphereGeometry args={[0.09, 8, 6]} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.25, 0]} material={M.gold}>
        <sphereGeometry args={[0.18, 8, 6]} />
      </mesh>
    </group>
  );
}

/** Skylight over the hall: bright by day, deep blue at night. */
function Skylight({ daylight }: { daylight: number }) {
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  glass.color.set("#1b2238").lerp(new THREE.Color("#eaf2ff"), daylight);
  return (
    <group position={[0, HALL.h - 0.02, 1]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={glass}>
        <planeGeometry args={[5, 12]} />
      </mesh>
      {[-1.25, 0, 1.25].map((x) => (
        <mesh key={x} position={[x, -0.05, 0]} material={M.goldDark}>
          <boxGeometry args={[0.08, 0.1, 12]} />
        </mesh>
      ))}
      {[-4, -2, 0, 2, 4].map((z) => (
        <mesh key={z} position={[0, -0.05, z]} material={M.goldDark}>
          <boxGeometry args={[5, 0.1, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

function Hall({ daylight }: { daylight: number }) {
  const floor = useMemo(() => new THREE.MeshLambertMaterial({ map: tiled(marbleTexture(), HALL.w / 2, HALL.d / 2) }), []);
  const carpet = useMemo(() => new THREE.MeshLambertMaterial({ map: tiled(carpetTexture(), 1, 9) }), []);
  const title = engravingTexture("BUILT PROJECTS");
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floor}>
        <planeGeometry args={[HALL.w, HALL.d]} />
      </mesh>
      {/* Red runner from the door to the centrepiece */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -1]} material={carpet}>
        <planeGeometry args={[2.6, HALL.d - 2]} />
      </mesh>
      <Wall length={HALL.w} x={0} z={HZ} rot={Math.PI} />
      <Wall length={HALL.w} x={0} z={-HZ} rot={0} />
      <Wall length={HALL.d} x={-HX} z={0} rot={Math.PI / 2} />
      <Wall length={HALL.d} x={HX} z={0} rot={-Math.PI / 2} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HALL.h, 0]} material={M.ceiling}>
        <planeGeometry args={[HALL.w, HALL.d]} />
      </mesh>
      <Skylight daylight={daylight} />
      {[-4, 5].map((z) => (
        <Chandelier key={z} z={z} />
      ))}
      {PILASTERS.map((p, i) => (
        <Pilaster key={i} {...p} />
      ))}
      <mesh position={[0, 5.2, HZ - 0.08]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.75 * title.aspect, 0.75]} />
        <meshBasicMaterial map={title.texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Paintings ───────────────────────────────────────────────────

const HUES = [205, 340, 150, 30, 270];

function coverTexture(index: number) {
  const project = PROJECTS[index];
  if (!project.cover) return titleCardTexture(project.title, project.kind, HUES[index % HUES.length]);
  const tex = new THREE.TextureLoader().load(project.cover);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Gilded frame with a picture light, a brass plaque and a velvet rope in front. */
function Framed({ def, map, rope = true, plaque = true }: { def: Omit<PaintingDef, "id">; map: THREE.Texture; rope?: boolean; plaque?: boolean }) {
  const { w, h } = def;
  const b = 0.18;
  const ropeGeo = useMemo(() => {
    const half = w / 2 + 0.45;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-half, 0.85, 0),
      new THREE.Vector3(-half / 2, 0.66, 0),
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(half / 2, 0.66, 0),
      new THREE.Vector3(half, 0.85, 0),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.035, 5, false);
  }, [w]);

  return (
    <group position={[def.x, 0, def.z]} rotation={[0, facing(def.nx, def.nz), 0]}>
      {/* Warm wash from the picture light */}
      <mesh position={[0, def.y + 0.25, 0.02]} material={M.wash}>
        <planeGeometry args={[w * 1.7, h * 1.9]} />
      </mesh>
      <group position={[0, def.y, 0]}>
        <mesh position={[0, 0, 0.03]} material={M.backing}>
          <boxGeometry args={[w + 0.05, h + 0.05, 0.05]} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
        {[
          [0, h / 2 + b / 2, w + b * 2, b],
          [0, -h / 2 - b / 2, w + b * 2, b],
          [-w / 2 - b / 2, 0, b, h],
          [w / 2 + b / 2, 0, b, h],
        ].map(([x, y, fw, fh], i) => (
          <group key={i}>
            <mesh position={[x, y, 0.09]} material={M.gold}>
              <boxGeometry args={[fw, fh, 0.14]} />
            </mesh>
            <mesh position={[x * 0.985, y * 0.985, 0.165]} material={M.goldDark}>
              <boxGeometry args={[fw * (i < 2 ? 0.98 : 0.4), fh * (i < 2 ? 0.4 : 0.98), 0.02]} />
            </mesh>
          </group>
        ))}
        {/* Picture light */}
        <mesh position={[0, h / 2 + b + 0.12, 0.12]} material={M.brass}>
          <boxGeometry args={[0.06, 0.24, 0.06]} />
        </mesh>
        <mesh position={[0, h / 2 + b + 0.22, 0.3]} rotation={[0.5, 0, 0]} material={M.brass}>
          <boxGeometry args={[Math.min(w * 0.5, 1.6), 0.08, 0.16]} />
        </mesh>
        <mesh position={[0, h / 2 + b + 0.17, 0.33]} rotation={[0.5, 0, 0]} material={M.bulb}>
          <boxGeometry args={[Math.min(w * 0.5, 1.6) - 0.08, 0.02, 0.1]} />
        </mesh>
      </group>
      {plaque && (
        <mesh position={[w / 2 + 0.55, 1.45, 0.03]} material={M.brass}>
          <boxGeometry args={[0.34, 0.22, 0.03]} />
        </mesh>
      )}
      {rope && (
        <group position={[0, 0, ROPE_DISTANCE]}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * (w / 2 + 0.45), 0, 0]}>
              <mesh position={[0, 0.03, 0]} material={M.brass}>
                <cylinderGeometry args={[0.16, 0.18, 0.06, 10]} />
              </mesh>
              <mesh position={[0, 0.45, 0]} material={M.brass}>
                <cylinderGeometry args={[0.035, 0.035, 0.9, 6]} />
              </mesh>
              <mesh position={[0, 0.93, 0]} material={M.brass}>
                <sphereGeometry args={[0.06, 8, 6]} />
              </mesh>
            </group>
          ))}
          <mesh geometry={ropeGeo} material={M.velvet} />
        </group>
      )}
    </group>
  );
}

function Painting({ def }: { def: PaintingDef }) {
  const map = useMemo(() => (def.project === undefined ? sketchTexture() : coverTexture(def.project)), [def.project]);
  return <Framed def={def} map={map} />;
}

function Portrait() {
  const map = useMemo(() => {
    const tex = new THREE.TextureLoader().load("/avatar-560.webp");
    tex.colorSpace = THREE.SRGBColorSpace;
    // Square photo on a portrait canvas: crop the sides
    tex.repeat.set(PORTRAIT.w / PORTRAIT.h, 1);
    tex.offset.set((1 - PORTRAIT.w / PORTRAIT.h) / 2, 0);
    return tex;
  }, []);
  return <Framed def={PORTRAIT} map={map} />;
}

// ── Furniture ───────────────────────────────────────────────────

function Bench({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.2, 0]} material={M.wood}>
        <boxGeometry args={[0.8, 0.4, 2.3]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={M.velvet}>
        <boxGeometry args={[0.9, 0.22, 2.4]} />
      </mesh>
      {/* Tufting buttons */}
      {[-0.8, -0.27, 0.27, 0.8].map((bz) => (
        <mesh key={bz} position={[0, 0.615, bz]} material={M.goldDark}>
          <boxGeometry args={[0.06, 0.02, 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

function Guestbook() {
  return (
    <group position={[GUESTBOOK.x, 0, GUESTBOOK.z]} rotation={[0, Math.PI * 0.75, 0]}>
      <mesh position={[0, 0.05, 0]} material={M.wood}>
        <boxGeometry args={[0.6, 0.1, 0.5]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={M.wood}>
        <boxGeometry args={[0.16, 1, 0.16]} />
      </mesh>
      <group position={[0, 1.1, 0]} rotation={[-0.35, 0, 0]}>
        <mesh material={M.wood}>
          <boxGeometry args={[0.75, 0.06, 0.55]} />
        </mesh>
        {/* Open book */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.17, 0.05, 0]} rotation={[0, 0, s * -0.08]} material={M.paper}>
            <boxGeometry args={[0.32, 0.03, 0.42]} />
          </mesh>
        ))}
        <mesh position={[0.2, 0.08, 0.02]} rotation={[0, 0.6, 0]} material={M.ink}>
          <boxGeometry args={[0.012, 0.012, 0.3]} />
        </mesh>
        <mesh position={[-0.28, 0.07, 0.15]} material={M.ink}>
          <cylinderGeometry args={[0.035, 0.04, 0.07, 8]} />
        </mesh>
      </group>
    </group>
  );
}

function Urn({ x }: { x: number }) {
  return (
    <group position={[x, 0, -HZ + 0.6]}>
      <mesh position={[0, 0.35, 0]} material={M.stone}>
        <cylinderGeometry args={[0.32, 0.22, 0.7, 10]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} material={M.plant}>
        <icosahedronGeometry args={[0.5, 0]} />
      </mesh>
    </group>
  );
}

function Door() {
  const exit = signTexture("EXIT", "#1d6b3a", "#ffffff");
  return (
    <group position={[0, 0, -HZ + 0.02]}>
      {/* Frame stands proud of the panelling and chair rail so their faces never share a plane (they flickered) */}
      <mesh position={[0, 1.8, 0.1]} material={M.goldDark}>
        <boxGeometry args={[2.9, 3.6, 0.16]} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.7, 0.2]} material={M.wood}>
            <boxGeometry args={[1.15, 3.3, 0.06]} />
          </mesh>
          <mesh position={[x * 0.25, 1.6, 0.25]} material={M.brass}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.95, 0.05]}>
        <planeGeometry args={[0.3 * exit.aspect, 0.3]} />
        <meshBasicMaterial map={exit.texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Glowing exit marker inside the door, same style as the street markers. */
function ExitMarker({ store }: { store: GameStore }) {
  const cyl = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.04;
    cyl.current.scale.set(pulse, store.nearSpot === "exit" ? 1.25 : 1, pulse);
  });
  return (
    <group position={[EXIT.x, 0.01, EXIT.z]}>
      <mesh ref={cyl} position={[0, 0.6, 0]} renderOrder={2}>
        <cylinderGeometry args={[EXIT.radius, EXIT.radius, 1.2, 24, 1, true]} />
        <meshBasicMaterial color="#f0b53b" map={markerTexture()} transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── People ──────────────────────────────────────────────────────

const STILL: React.RefObject<Motion> = { current: { speed: 0 } };

/** The guard by the door turns to greet you. */
function Guard({ store }: { store: GameStore }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    const p = store.player;
    const near = store.location === "gallery" && Math.hypot(p.x - GUARD.x, p.z - GUARD.z) < 5;
    const target = near ? Math.atan2(p.x - GUARD.x, p.z - GUARD.z) : GUARD.heading;
    group.current.rotation.y += angleDiff(target, group.current.rotation.y) * Math.min(1, dt * 4);
  });
  return (
    <group ref={group} position={[GUARD.x, 0, GUARD.z]} rotation={[0, GUARD.heading, 0]}>
      <Character look={GUARD_LOOK} motion={STILL} />
    </group>
  );
}

const WALK = 0.9;

function Visitor({ route, index, store, look }: { route: Waypoint[]; index: number; store: GameStore; look: Look }) {
  const group = useRef<THREE.Group>(null!);
  const motion = useRef<Motion>({ speed: 0 });
  const state = useRef({ i: index, x: route[index].x, z: route[index].z, heading: route[index].look ?? 0, pause: 2 + index * 3 });

  useLayoutEffect(() => {
    store.visitors[index] = { x: state.current.x, z: state.current.z };
  }, [store, index]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    let speed = 0;
    let want = s.heading;
    if (s.pause > 0) {
      s.pause -= dt;
      want = route[s.i].look ?? s.heading;
    } else {
      const next = route[(s.i + 1) % route.length];
      const dx = next.x - s.x;
      const dz = next.z - s.z;
      const dist = Math.hypot(dx, dz);
      want = Math.atan2(dx, dz);
      // Wait politely if you're standing in the way
      const p = store.player;
      const ahead = (p.x - s.x) * Math.sin(want) + (p.z - s.z) * Math.cos(want);
      const blocked = store.location === "gallery" && ahead > 0 && Math.hypot(p.x - s.x, p.z - s.z) < 1.1;
      if (dist < 0.05) {
        s.i = (s.i + 1) % route.length;
        if (next.look !== undefined) s.pause = 4 + ((s.i * 7 + index * 3) % 5);
      } else if (!blocked) {
        const step = Math.min(dist, WALK * dt);
        s.x += (dx / dist) * step;
        s.z += (dz / dist) * step;
        speed = WALK;
      }
    }
    s.heading += angleDiff(want, s.heading) * Math.min(1, dt * 5);
    motion.current.speed = speed;
    group.current.position.set(s.x, 0, s.z);
    group.current.rotation.y = s.heading;
    const me = store.visitors[index];
    if (me) {
      me.x = s.x;
      me.z = s.z;
    }
  });

  return (
    <group ref={group} position={[route[index].x, 0, route[index].z]}>
      <Character look={look} motion={motion} />
    </group>
  );
}

const VISITOR_LOOKS = [PEDESTRIAN_LOOKS[1], PEDESTRIAN_LOOKS[3]];

export function Gallery({ store, visible, daylight }: { store: GameStore; visible: boolean; daylight: number }) {
  return (
    <group visible={visible}>
      <Hall daylight={daylight} />
      {PAINTINGS.map((p) => (
        <Painting key={p.id} def={p} />
      ))}
      <Portrait />
      {BENCHES.map((b) => (
        <Bench key={b.x} {...b} />
      ))}
      <Guestbook />
      <Urn x={-2.6} />
      <Urn x={2.6} />
      <Door />
      <ExitMarker store={store} />
      <Guard store={store} />
      {VISITOR_ROUTES.map((route, i) => (
        <Visitor key={i} route={route} index={i} store={store} look={VISITOR_LOOKS[i % VISITOR_LOOKS.length]} />
      ))}
    </group>
  );
}
