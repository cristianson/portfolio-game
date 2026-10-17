/**
 * Street Props & Parked Cars
 *
 * Low-poly street furniture (lamps, hydrants, trees, benches, the phone booth
 * for Socials, road-closed barriers) and parked cars, all built from a handful
 * of primitives with shared materials.
 */

"use client";

import React from "react";
import * as THREE from "three";
import { PARK_TREES, PARKED_CARS, PROPS, SIDEWALK_HEIGHT, type CarDef, type PropDef } from "./world";
import { blobShadowTexture, signTexture } from "./textures";

const mat = (color: string) => new THREE.MeshLambertMaterial({ color });

const M = {
  pole: mat("#2f3a35"),
  lampGlass: new THREE.MeshBasicMaterial({ color: "#fff3c4" }),
  hydrant: mat("#c0392b"),
  hydrantCap: mat("#e0e0e0"),
  trunk: mat("#5b3d24"),
  leaves: new THREE.MeshLambertMaterial({ color: "#4f7f34", flatShading: true }),
  leavesLight: new THREE.MeshLambertMaterial({ color: "#6a9a3e", flatShading: true }),
  dirt: mat("#4a3b2b"),
  bin: mat("#2c4a3a"),
  binLid: mat("#22382c"),
  newsbox: mat("#2463a8"),
  mailbox: mat("#2c4f9e"),
  wood: mat("#8b5a2b"),
  iron: mat("#2a2a2a"),
  boothFrame: mat("#2a8a52"),
  boothGlass: new THREE.MeshLambertMaterial({ color: "#bfe3f0", transparent: true, opacity: 0.35, depthWrite: false }),
  white: mat("#f2f2f2"),
  red: mat("#d63a2f"),
  tire: mat("#1a1a1a"),
  rim: mat("#9a9a9a"),
  glass: mat("#1d2731"),
  chrome: mat("#5a5d61"),
  headlight: new THREE.MeshBasicMaterial({ color: "#fffbe6" }),
  taillight: new THREE.MeshBasicMaterial({ color: "#c0221a" }),
  signalPole: mat("#4a4c4a"),
  signalBox: mat("#c9a227"),
  lightRed: new THREE.MeshBasicMaterial({ color: "#ff3b2e" }),
  lightOff: mat("#3a3a30"),
  shadow: new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }),
};

function shadowMaterial() {
  if (!M.shadow.map) {
    M.shadow.map = blobShadowTexture();
    M.shadow.needsUpdate = true;
  }
  return M.shadow;
}

export function BlobShadow({ w, d, y = 0.02 }: { w: number; d: number; y?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={shadowMaterial()} renderOrder={1}>
      <planeGeometry args={[w, d]} />
    </mesh>
  );
}

function Lamp({ x }: { x: number }) {
  // Arm reaches over the road
  const dir = x > 0 ? -1 : 1;
  return (
    <group>
      <mesh position={[0, 0.15, 0]} material={M.pole}>
        <cylinderGeometry args={[0.18, 0.22, 0.3, 8]} />
      </mesh>
      <mesh position={[0, 3, 0]} material={M.pole}>
        <cylinderGeometry args={[0.07, 0.1, 6, 8]} />
      </mesh>
      <mesh position={[dir * 0.8, 5.95, 0]} material={M.pole}>
        <boxGeometry args={[1.7, 0.08, 0.08]} />
      </mesh>
      <mesh position={[dir * 1.55, 5.85, 0]} material={M.pole}>
        <boxGeometry args={[0.7, 0.18, 0.35]} />
      </mesh>
      <mesh position={[dir * 1.55, 5.75, 0]} material={M.lampGlass}>
        <boxGeometry args={[0.55, 0.04, 0.25]} />
      </mesh>
    </group>
  );
}

/** Traffic light on a mast arm reaching over the road, GTA 3 street-corner style. */
function Signal({ x, z }: { x: number; z: number }) {
  const dir = x > 0 ? -1 : 1;
  // Face the traffic approaching this side of the crosswalk
  const face = z < -5 || (z > 20 && z < 27) ? Math.PI : 0;
  const head = (
    <group>
      <mesh material={M.signalBox}>
        <boxGeometry args={[0.36, 1.0, 0.3]} />
      </mesh>
      {[0.3, 0, -0.3].map((y, i) => (
        <mesh key={y} position={[0, y, 0.16]} material={i === 0 ? M.lightRed : M.lightOff}>
          <circleGeometry args={[0.11, 10]} />
        </mesh>
      ))}
    </group>
  );
  return (
    <group>
      <mesh position={[0, 2.9, 0]} material={M.signalPole}>
        <cylinderGeometry args={[0.09, 0.12, 5.8, 8]} />
      </mesh>
      <mesh position={[dir * 2.6, 5.5, 0]} rotation={[0, 0, Math.PI / 2]} material={M.signalPole}>
        <cylinderGeometry args={[0.06, 0.08, 5.2, 6]} />
      </mesh>
      <group rotation={[0, face, 0]}>
        <group position={[dir * (face ? -1 : 1) * 2.4, 4.95, 0]}>{head}</group>
        <group position={[dir * (face ? -1 : 1) * 4.6, 4.95, 0]}>{head}</group>
        <group position={[0, 3.0, 0.2]} scale={0.7}>{head}</group>
      </group>
      {/* Pedestrian signal */}
      <mesh position={[dir * -0.25, 2.6, 0]} material={M.signalBox}>
        <boxGeometry args={[0.3, 0.35, 0.3]} />
      </mesh>
    </group>
  );
}

function Hydrant() {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} material={M.hydrant}>
        <cylinderGeometry args={[0.15, 0.17, 0.6, 8]} />
      </mesh>
      <mesh position={[0, 0.65, 0]} material={M.hydrant}>
        <sphereGeometry args={[0.15, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={M.hydrantCap}>
        <cylinderGeometry args={[0.06, 0.06, 0.46, 6]} />
      </mesh>
    </group>
  );
}

export function Tree({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.dirt}>
        <planeGeometry args={[1.1, 1.1]} />
      </mesh>
      <mesh position={[0, 1.4, 0]} material={M.trunk}>
        <cylinderGeometry args={[0.1, 0.16, 2.8, 6]} />
      </mesh>
      <mesh position={[0, 3.3, 0]} material={M.leaves}>
        <icosahedronGeometry args={[1.35, 0]} />
      </mesh>
      <mesh position={[0.5, 3.9, 0.3]} material={M.leavesLight}>
        <icosahedronGeometry args={[0.95, 0]} />
      </mesh>
      <mesh position={[-0.5, 2.9, -0.4]} material={M.leavesLight}>
        <icosahedronGeometry args={[0.8, 0]} />
      </mesh>
    </group>
  );
}

function Bench() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} material={M.wood}>
        <boxGeometry args={[1.8, 0.08, 0.5]} />
      </mesh>
      <mesh position={[0, 0.8, -0.22]} material={M.wood}>
        <boxGeometry args={[1.8, 0.4, 0.06]} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]} material={M.iron}>
          <boxGeometry args={[0.08, 0.45, 0.5]} />
        </mesh>
      ))}
    </group>
  );
}

function TrashCan() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} material={M.bin}>
        <cylinderGeometry args={[0.3, 0.26, 0.9, 10]} />
      </mesh>
      <mesh position={[0, 0.93, 0]} material={M.binLid}>
        <cylinderGeometry args={[0.33, 0.33, 0.08, 10]} />
      </mesh>
    </group>
  );
}

function NewsBox({ material }: { material: THREE.Material }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} material={material}>
        <boxGeometry args={[0.55, 1.1, 0.5]} />
      </mesh>
      <mesh position={[0, 0.85, 0.26]} material={M.glass}>
        <planeGeometry args={[0.4, 0.3]} />
      </mesh>
    </group>
  );
}

function PhoneBooth() {
  const { texture, aspect } = signTexture("SOCIALS", "#1b5e3a", "#ffffff");
  return (
    <group>
      <mesh position={[0, 0.05, 0]} material={M.boothFrame}>
        <boxGeometry args={[1.05, 0.1, 1.05]} />
      </mesh>
      {[-0.48, 0.48].flatMap((x) =>
        [-0.48, 0.48].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 1.2, z]} material={M.boothFrame}>
            <boxGeometry args={[0.09, 2.3, 0.09]} />
          </mesh>
        ))
      )}
      {/* Glass on three sides, front open towards the street */}
      <mesh position={[0, 1.2, -0.48]} material={M.boothGlass}>
        <planeGeometry args={[0.9, 2.1]} />
      </mesh>
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]} rotation={[0, Math.PI / 2, 0]} material={M.boothGlass}>
          <planeGeometry args={[0.9, 2.1]} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0]} material={M.boothFrame}>
        <boxGeometry args={[1.15, 0.3, 1.15]} />
      </mesh>
      <mesh position={[0, 2.45, 0.58]}>
        <planeGeometry args={[0.3 * aspect * 0.8, 0.24]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* The phone itself */}
      <mesh position={[0, 1.35, -0.4]} material={M.iron}>
        <boxGeometry args={[0.3, 0.45, 0.12]} />
      </mesh>
      <mesh position={[0.08, 1.45, -0.32]} material={M.chrome}>
        <boxGeometry args={[0.07, 0.25, 0.06]} />
      </mesh>
    </group>
  );
}

function Barrier({ sign }: { sign: boolean }) {
  const closed = sign ? signTexture("ROAD CLOSED", "#f2f2f2", "#c0221a") : null;
  return (
    <group>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} material={M.white}>
          <boxGeometry args={[0.1, 1.1, 0.4]} />
        </mesh>
      ))}
      {[0.75, 0.35].map((y) =>
        [-1, -0.5, 0, 0.5, 1].map((x, i) => (
          <mesh key={`${y}${x}`} position={[x * 1.0, y, 0]} material={(i + (y > 0.5 ? 1 : 0)) % 2 ? M.white : M.red}>
            <boxGeometry args={[0.5, 0.22, 0.06]} />
          </mesh>
        ))
      )}
      {closed && (
        <mesh position={[0, 1.45, 0.04]}>
          <planeGeometry args={[0.55 * closed.aspect, 0.55]} />
          <meshBasicMaterial map={closed.texture} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Prop({ p }: { p: PropDef }) {
  let node: React.ReactNode = null;
  switch (p.kind) {
    case "lamp":
      node = <Lamp x={p.x} />;
      break;
    case "signal":
      node = <Signal x={p.x} z={p.z} />;
      break;
    case "hydrant":
      node = <Hydrant />;
      break;
    case "tree":
      node = <Tree />;
      break;
    case "bench":
      node = <Bench />;
      break;
    case "trash":
      node = <TrashCan />;
      break;
    case "newsbox":
      node = <NewsBox material={M.newsbox} />;
      break;
    case "mailbox":
      node = <NewsBox material={M.mailbox} />;
      break;
    case "booth":
      node = <PhoneBooth />;
      break;
    case "barrier":
      node = <Barrier sign={p.x === 0} />;
      break;
  }
  const y = Math.abs(p.x) > 5 ? SIDEWALK_HEIGHT : 0;
  const rot = p.kind === "barrier" ? (p.z > 0 ? Math.PI : 0) : p.kind === "lamp" || p.kind === "signal" ? 0 : p.rot ?? 0;
  return (
    <group position={[p.x, y, p.z]} rotation={[0, rot, 0]}>
      {node}
    </group>
  );
}

const carBodyCache = new Map<string, THREE.MeshLambertMaterial>();
function bodyMat(color: string) {
  let m = carBodyCache.get(color);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color });
    carBodyCache.set(color, m);
  }
  return m;
}

function Van({ c }: { c: CarDef }) {
  const body = bodyMat(c.color);
  return (
    <group position={[c.x, 0, c.z]} rotation={[0, c.rot, 0]}>
      <BlobShadow w={2.5} d={5.4} />
      <mesh position={[0, 1.25, -0.25]} material={body}>
        <boxGeometry args={[1.95, 1.75, 4.0]} />
      </mesh>
      {/* Sloped nose */}
      <mesh position={[0, 0.85, 1.95]} material={body}>
        <boxGeometry args={[1.9, 0.9, 0.9]} />
      </mesh>
      <mesh position={[0, 1.55, 1.72]} rotation={[-0.5, 0, 0]} material={M.glass}>
        <boxGeometry args={[1.75, 0.8, 0.06]} />
      </mesh>
      {/* Side windows strip */}
      {[-0.98, 0.98].map((x) => (
        <mesh key={x} position={[x, 1.6, 0.1]} material={M.glass}>
          <boxGeometry args={[0.02, 0.5, 2.6]} />
        </mesh>
      ))}
      {[2.42, -2.28].map((z) => (
        <mesh key={z} position={[0, 0.45, z]} material={M.chrome}>
          <boxGeometry args={[1.98, 0.2, 0.12]} />
        </mesh>
      ))}
      {[-0.65, 0.65].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.85, 2.41]} material={M.headlight}>
            <boxGeometry args={[0.32, 0.18, 0.04]} />
          </mesh>
          <mesh position={[x, 0.95, -2.27]} material={M.taillight}>
            <boxGeometry args={[0.2, 0.3, 0.04]} />
          </mesh>
        </group>
      ))}
      {[-0.88, 0.88].flatMap((x) =>
        [1.55, -1.45].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.38, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh material={M.tire}>
              <cylinderGeometry args={[0.38, 0.38, 0.26, 12]} />
            </mesh>
            <mesh position={[0, x > 0 ? 0.135 : -0.135, 0]} material={M.rim}>
              <cylinderGeometry args={[0.2, 0.2, 0.02, 8]} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function Car({ c }: { c: CarDef }) {
  if (c.van) return <Van c={c} />;
  const body = bodyMat(c.color);
  const taxi = c.taxi ? signTexture("TAXI", "#111111", "#f4c20d") : null;
  return (
    <group position={[c.x, 0, c.z]} rotation={[0, c.rot, 0]}>
      <BlobShadow w={2.4} d={5} />
      {/* Lower body */}
      <mesh position={[0, 0.62, 0]} material={body}>
        <boxGeometry args={[1.85, 0.62, 4.3]} />
      </mesh>
      {/* Hood slope + trunk */}
      <mesh position={[0, 0.98, 1.35]} rotation={[0.08, 0, 0]} material={body}>
        <boxGeometry args={[1.8, 0.12, 1.5]} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.22, -0.25]} material={M.glass}>
        <boxGeometry args={[1.6, 0.6, 2.1]} />
      </mesh>
      <mesh position={[0, 1.55, -0.3]} material={body}>
        <boxGeometry args={[1.66, 0.08, 1.8]} />
      </mesh>
      {/* Pillars */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.22, -0.25]} material={body}>
          <boxGeometry args={[0.06, 0.6, 0.18]} />
        </mesh>
      ))}
      {/* Bumpers */}
      {[2.18, -2.18].map((z) => (
        <mesh key={z} position={[0, 0.45, z]} material={M.chrome}>
          <boxGeometry args={[1.9, 0.18, 0.12]} />
        </mesh>
      ))}
      {[-0.65, 0.65].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.72, 2.16]} material={M.headlight}>
            <boxGeometry args={[0.36, 0.16, 0.04]} />
          </mesh>
          <mesh position={[x, 0.72, -2.16]} material={M.taillight}>
            <boxGeometry args={[0.36, 0.14, 0.04]} />
          </mesh>
        </group>
      ))}
      {/* Wheels */}
      {[-0.86, 0.86].flatMap((x) =>
        [1.35, -1.35].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.36, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh material={M.tire}>
              <cylinderGeometry args={[0.36, 0.36, 0.26, 12]} />
            </mesh>
            <mesh position={[0, x > 0 ? 0.135 : -0.135, 0]} material={M.rim}>
              <cylinderGeometry args={[0.2, 0.2, 0.02, 8]} />
            </mesh>
          </group>
        ))
      )}
      {taxi && (
        <group position={[0, 1.72, -0.3]}>
          <mesh material={M.iron}>
            <boxGeometry args={[0.7, 0.22, 0.3]} />
          </mesh>
          {[0.16, -0.16].map((z) => (
            <mesh key={z} position={[0, 0, z]} rotation={[0, z > 0 ? 0 : Math.PI, 0]}>
              <planeGeometry args={[0.66, 0.66 / taxi.aspect]} />
              <meshBasicMaterial map={taxi.texture} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export function Props() {
  return (
    <group>
      {PROPS.map((p, i) => (
        <Prop key={i} p={p} />
      ))}
      {PARK_TREES.map(([x, z], i) => (
        <group key={i} position={[x, SIDEWALK_HEIGHT, z]}>
          <Tree scale={1.15 + (i % 2) * 0.2} />
        </group>
      ))}
      {PARKED_CARS.map((c, i) => (
        <Car key={i} c={c} />
      ))}
    </group>
  );
}
