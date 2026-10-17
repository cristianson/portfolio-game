/**
 * Buildings
 *
 * Each building is a stack of boxes: a shop-front ground floor, the upper
 * floors with a repeating window texture, a cornice and roof clutter.
 * Signs, doors, awnings and the brownstone stoop are placed on the street
 * facing facade using `facadeFrame`.
 */

"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import {
  BUILDINGS,
  FLOOR_HEIGHT,
  GROUND_FLOOR_HEIGHT,
  SIDEWALK_HEIGHT,
  type BuildingDef,
} from "./world";
import { FACE_INDEX, facadeFrame, worldBox } from "./geometry";
import {
  bladeSignTexture,
  facadeTexture,
  garageDoorTexture,
  paletteFor,
  signTexture,
  storefrontTexture,
} from "./textures";

const ROOF = new THREE.MeshLambertMaterial({ color: "#4b4a47" });
const DOOR = new THREE.MeshLambertMaterial({ color: "#2a1d16" });
const DARK_METAL = new THREE.MeshLambertMaterial({ color: "#2f3236" });
const WOOD = new THREE.MeshLambertMaterial({ color: "#7a5534" });
const WOOD_DARK = new THREE.MeshLambertMaterial({ color: "#5a3b22" });
const FIRE_ESCAPE = new THREE.MeshLambertMaterial({ color: "#26282a" });
const AC_UNIT = new THREE.MeshLambertMaterial({ color: "#a6a399" });

function Sign({ text, bg, fg, width, y, x = 0 }: { text: string; bg: string; fg: string; width?: number; y: number; x?: number }) {
  const { texture, aspect } = signTexture(text, bg, fg);
  const h = width ? width / aspect : 0.8;
  const w = width ?? 0.8 * aspect;
  return (
    <group position={[x, y, 0.35]}>
      {/* Backing box sits well behind the face so the two never z-fight on mobile GPUs */}
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[w + 0.15, h + 0.15, 0.12]} />
        <meshLambertMaterial color="#1b1b1b" />
      </mesh>
      <mesh renderOrder={1}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
    </group>
  );
}

function BladeSign({ text, bg, fg, x, y }: { text: string; bg: string; fg: string; x: number; y: number }) {
  const { texture, aspect } = bladeSignTexture(text, bg, fg);
  const w = 1.0;
  const h = w / aspect;
  return (
    <group position={[x, y, 0.95]} rotation={[0, Math.PI / 2, 0]}>
      <mesh material={DARK_METAL}>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.06]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.08]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} toneMapped={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
      ))}
      {[h / 2 - 0.2, -h / 2 + 0.2].map((by) => (
        <mesh key={by} position={[0.6, by, 0]} material={DARK_METAL}>
          <boxGeometry args={[0.4, 0.06, 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

/** Zig-zag iron fire escape: a balcony per floor linked by diagonal stairs. */
function FireEscape({ x, floors, base }: { x: number; floors: number; base: number }) {
  const w = 3.4;
  const levels = Array.from({ length: floors - 1 }, (_, i) => base + GROUND_FLOOR_HEIGHT + i * FLOOR_HEIGHT + 0.6);
  const stair = Math.hypot(w - 1, FLOOR_HEIGHT);
  const angle = Math.atan2(FLOOR_HEIGHT, w - 1);
  return (
    <group position={[x, 0, 0]}>
      {levels.map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh position={[0, 0, 0.55]} material={FIRE_ESCAPE}>
            <boxGeometry args={[w, 0.06, 1.1]} />
          </mesh>
          <mesh position={[0, 0.95, 1.1]} material={FIRE_ESCAPE}>
            <boxGeometry args={[w, 0.05, 0.05]} />
          </mesh>
          {[-w / 2, -w / 4, 0, w / 4, w / 2].map((px) => (
            <mesh key={px} position={[px, 0.48, 1.1]} material={FIRE_ESCAPE}>
              <boxGeometry args={[0.04, 0.95, 0.04]} />
            </mesh>
          ))}
          {[-w / 2, w / 2].map((px) => (
            <mesh key={px} position={[px, 0.95, 0.55]} material={FIRE_ESCAPE}>
              <boxGeometry args={[0.05, 0.05, 1.1]} />
            </mesh>
          ))}
          {i < levels.length - 1 && (
            <mesh position={[0, FLOOR_HEIGHT / 2, 0.55]} rotation={[0, 0, i % 2 ? angle : -angle]} material={FIRE_ESCAPE}>
              <boxGeometry args={[stair, 0.08, 0.7]} />
            </mesh>
          )}
        </group>
      ))}
      {/* Drop ladder down from the first balcony */}
      <mesh position={[w / 2 - 0.4, levels[0] - 1.1, 0.9]} material={FIRE_ESCAPE}>
        <boxGeometry args={[0.5, 2.2, 0.05]} />
      </mesh>
    </group>
  );
}

function WaterTower({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      {[-0.9, 0.9].flatMap((lx) =>
        [-0.9, 0.9].map((lz) => (
          <mesh key={`${lx}${lz}`} position={[lx, 1, lz]} material={DARK_METAL}>
            <boxGeometry args={[0.12, 2, 0.12]} />
          </mesh>
        ))
      )}
      <mesh position={[0, 3.1, 0]} material={WOOD}>
        <cylinderGeometry args={[1.4, 1.4, 2.4, 10]} />
      </mesh>
      <mesh position={[0, 4.75, 0]} material={WOOD_DARK}>
        <coneGeometry args={[1.55, 0.9, 10]} />
      </mesh>
      {[2.4, 3.8].map((ry) => (
        <mesh key={ry} position={[0, ry, 0]} material={DARK_METAL}>
          <cylinderGeometry args={[1.43, 1.43, 0.08, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Building({ b }: { b: BuildingDef }) {
  const w = b.x1 - b.x0;
  const d = b.z1 - b.z0;
  const cx = (b.x0 + b.x1) / 2;
  const cz = (b.z0 + b.z1) / 2;
  const pal = paletteFor(b.style);
  const upperH = (b.floors - 1) * FLOOR_HEIGHT;
  const totalH = GROUND_FLOOR_HEIGHT + upperH;
  const frame = facadeFrame(b);
  const facade = FACE_INDEX[b.facing];
  const base = SIDEWALK_HEIGHT;

  const { groundGeo, groundMats, upperGeo, upperMats } = useMemo(() => {
    const cellW = b.style === "glass" ? 3.6 : 3;
    const wall = new THREE.MeshLambertMaterial({ map: facadeTexture(b.style) });
    const store = new THREE.MeshLambertMaterial({ map: storefrontTexture(b.style) });
    const plainWall = new THREE.MeshLambertMaterial({ color: pal.wall });
    const groundMats = [plainWall, plainWall, ROOF, ROOF, plainWall, plainWall];
    if (b.style !== "garage") groundMats[facade] = store;
    else groundMats[facade] = wall;
    return {
      groundGeo: worldBox(w, GROUND_FLOOR_HEIGHT, d, 7.6, GROUND_FLOOR_HEIGHT),
      groundMats,
      upperGeo: worldBox(w, upperH, d, cellW, FLOOR_HEIGHT),
      upperMats: [wall, wall, ROOF, ROOF, wall, wall],
    };
  }, [b, w, d, upperH, facade, pal.wall]);

  const trim = useMemo(() => new THREE.MeshLambertMaterial({ color: pal.trim }), [pal.trim]);

  const doorLocal = b.door !== undefined ? frame.toLocal(b.door) : 0;
  const roofY = base + totalH;

  return (
    <group>
      <mesh geometry={groundGeo} material={groundMats} position={[cx, base + GROUND_FLOOR_HEIGHT / 2, cz]} />
      {upperH > 0 && (
        <mesh geometry={upperGeo} material={upperMats} position={[cx, base + GROUND_FLOOR_HEIGHT + upperH / 2, cz]} />
      )}
      {/* Ledge between shop and upper floors + cornice */}
      <mesh position={[cx, base + GROUND_FLOOR_HEIGHT, cz]} material={trim}>
        <boxGeometry args={[w + 0.3, 0.25, d + 0.3]} />
      </mesh>
      <mesh position={[cx, roofY + 0.2, cz]} material={trim}>
        <boxGeometry args={[w + 0.5, 0.4, d + 0.5]} />
      </mesh>
      {/* Parapet */}
      <mesh position={[cx, roofY + 0.4, cz]} material={ROOF}>
        <boxGeometry args={[w - 0.4, 0.2, d - 0.4]} />
      </mesh>
      {b.waterTower && <WaterTower x={cx + w * 0.2} z={cz - d * 0.15} y={roofY + 0.4} />}
      {/* Rooftop AC units */}
      <mesh position={[cx - w * 0.2, roofY + 0.9, cz + d * 0.2]} material={DARK_METAL}>
        <boxGeometry args={[1.6, 1, 1.2]} />
      </mesh>

      {/* Street facing details */}
      <group position={[frame.x, base, frame.z]} rotation={[0, frame.rot, 0]}>
        {b.door !== undefined && b.style !== "garage" && !b.stoop && (
          <mesh position={[doorLocal, 1.2, 0.03]} material={DOOR}>
            <boxGeometry args={[1.5, 2.4, 0.1]} />
          </mesh>
        )}
        {b.style === "garage" && b.door !== undefined && (
          <>
            <mesh position={[doorLocal, 1.7, 0.04]}>
              <planeGeometry args={[5, 3.4]} />
              <meshLambertMaterial map={garageDoorTexture()} />
            </mesh>
            <mesh position={[doorLocal, 3.45, 0.1]} material={DARK_METAL}>
              <boxGeometry args={[5.4, 0.25, 0.25]} />
            </mesh>
          </>
        )}
        {b.stoop && b.door !== undefined && (
          <group position={[doorLocal, 0, 0]}>
            <mesh position={[0, 2.05, 0.03]} material={DOOR}>
              <boxGeometry args={[1.4, 2.5, 0.1]} />
            </mesh>
            <mesh position={[0, 3.45, 0.08]} material={trim}>
              <boxGeometry args={[1.9, 0.3, 0.2]} />
            </mesh>
            <mesh position={[0, 0.4, 0.25]} material={trim}>
              <boxGeometry args={[1.8, 0.8, 0.5]} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[0, 0.3 - i * 0.1, 0.635 + i * 0.27]} material={trim}>
                <boxGeometry args={[1.8, 0.6 - i * 0.2, 0.27]} />
              </mesh>
            ))}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.95, 1.4, 0.65]} rotation={[0.55, 0, 0]} material={DARK_METAL}>
                <boxGeometry args={[0.06, 0.06, 1.55]} />
              </mesh>
            ))}
          </group>
        )}
        {b.awning && (
          <mesh position={[0, 3.0, 0.6]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[frame.length - 2, 0.08, 1.3]} />
            <meshLambertMaterial color={b.awning} />
          </mesh>
        )}
        {b.sign && (
          <Sign
            {...b.sign}
            x={b.zone ? doorLocal : 0}
            y={b.zone ? (b.style === "glass" ? 4.5 : b.stoop ? 4.2 : 4.4) : b.awning ? 3.75 : 3.4}
          />
        )}
        {b.fireEscape && <FireEscape x={-frame.length * 0.22} floors={b.floors} base={0} />}
        {b.blade && (
          <BladeSign {...b.blade} x={frame.toLocal(b.blade.at)} y={GROUND_FLOOR_HEIGHT + 2.6} />
        )}
        {b.style === "glass" && (
          <group position={[doorLocal, 0, 0]}>
            {/* Entrance canopy */}
            <mesh position={[0, 3.1, 1]} material={DARK_METAL}>
              <boxGeometry args={[5, 0.2, 2]} />
            </mesh>
            <mesh position={[0, 1.3, 0.04]}>
              <planeGeometry args={[3, 2.6]} />
              <meshLambertMaterial color="#1c2c38" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

/** Window AC units scattered over the street-facing facades (one draw call). */
function AirConditioners() {
  const mesh = useMemo(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    const spots: THREE.Matrix4[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (const b of BUILDINGS) {
      if (b.style === "glass" || b.floors < 2) continue;
      const f = facadeFrame(b);
      const cols = Math.floor(f.length / 3);
      // Start one floor up: the first upper floor carries the shop & section signs
      for (let floor = 1; floor < b.floors - 1; floor++) {
        for (let k = 0; k < cols; k++) {
          if (rand() > 0.16) continue;
          const lx = -f.length / 2 + (k + 0.5) * 3;
          const y = SIDEWALK_HEIGHT + GROUND_FLOOR_HEIGHT + floor * FLOOR_HEIGHT + 0.95;
          // Local facade frame → world
          const ox = Math.sin(f.rot) * 0.22;
          const oz = Math.cos(f.rot) * 0.22;
          const wx = f.x + Math.cos(f.rot) * lx + ox;
          const wz = f.z - Math.sin(f.rot) * lx + oz;
          q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), f.rot);
          spots.push(m.clone().compose(new THREE.Vector3(wx, y, wz), q, one));
        }
      }
    }
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.75, 0.45, 0.5), AC_UNIT, spots.length);
    spots.forEach((mat, i) => inst.setMatrixAt(i, mat));
    inst.instanceMatrix.needsUpdate = true;
    return inst;
  }, []);
  return <primitive object={mesh} />;
}

export function Buildings() {
  return (
    <group>
      {BUILDINGS.map((b) => (
        <Building key={b.id} b={b} />
      ))}
      <AirConditioners />
    </group>
  );
}
