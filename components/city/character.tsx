/**
 * Blocky Character
 *
 * A PS2-era low-poly person made of boxes, used for the player and for
 * pedestrians. Limbs pivot at hips & shoulders and swing based on the
 * `motion.speed` the controller writes every frame.
 */

"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BlobShadow } from "./props";

export interface Look {
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "bald" | "cap";
  shirt: string;
  jacket?: string;
  pants: string;
  shoes: string;
  mustache?: boolean;
  glasses?: boolean;
  cap?: string;
  /** Cargo pants with thigh pockets. */
  cargo?: boolean;
}

export interface Motion {
  /** Current ground speed in m/s. */
  speed: number;
}

/** Cristian: brunet, mustache, glasses. Tweak freely. */
export const PLAYER_LOOK: Look = {
  skin: "#d9a582",
  hair: "#2e1f15",
  hairStyle: "short",
  shirt: "#3b3b3d",
  jacket: "#1d1d20",
  pants: "#5d6243",
  shoes: "#2a2520",
  mustache: true,
  glasses: true,
  cargo: true,
};

export const PEDESTRIAN_LOOKS: Look[] = [
  { skin: "#8d5a3b", hair: "#111111", hairStyle: "short", shirt: "#8e3a33", jacket: "#2b2b2b", pants: "#2b2b2b", shoes: "#222222" },
  { skin: "#f1c7a5", hair: "#c9a76a", hairStyle: "long", shirt: "#6c5a80", jacket: "#5a3a2e", pants: "#3e3e4e", shoes: "#3a2a1c" },
  { skin: "#c58c62", hair: "#2a1a10", hairStyle: "cap", cap: "#8a8a86", shirt: "#7f7f7a", jacket: "#6e6e6a", pants: "#6e6e6a", shoes: "#c9c2b0" },
  { skin: "#e8b896", hair: "#7a7a7a", hairStyle: "bald", shirt: "#4a5d70", jacket: "#5b4636", pants: "#2e2e2e", shoes: "#151515", glasses: true },
  { skin: "#6b4429", hair: "#0d0d0d", hairStyle: "cap", cap: "#7a2a7a", shirt: "#7a2a7a", jacket: "#7a2a7a", pants: "#7a2a7a", shoes: "#1a1a1a" },
];

const taperCache = new Map<string, THREE.BufferGeometry>();

/** Box that is wider at the top than at the bottom (shoulders, thighs, forearms). */
function taper(wTop: number, wBottom: number, h: number, dTop: number, dBottom: number) {
  const key = [wTop, wBottom, h, dTop, dBottom].join();
  let geo = taperCache.get(key);
  if (!geo) {
    geo = new THREE.BoxGeometry(wTop, h, dTop);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 0) {
        pos.setX(i, pos.getX(i) * (wBottom / wTop));
        pos.setZ(i, pos.getZ(i) * (dBottom / dTop));
      }
    }
    geo.computeVertexNormals();
    taperCache.set(key, geo);
  }
  return geo;
}

function useMats(look: Look) {
  return useMemo(() => {
    const m = (c: string) => new THREE.MeshLambertMaterial({ color: c });
    return {
      skin: m(look.skin),
      hair: m(look.hair),
      shirt: m(look.shirt),
      jacket: m(look.jacket ?? look.shirt),
      pants: m(look.pants),
      shoes: m(look.shoes),
      cap: m(look.cap ?? look.hair),
      dark: m("#141414"),
      eye: m("#1a1a1a"),
    };
  }, [look]);
}

export function Character({ look, motion }: { look: Look; motion: React.RefObject<Motion> }) {
  const mats = useMats(look);
  const body = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const phase = useRef(0);

  // Start everyone at a different point of their stride
  useEffect(() => {
    phase.current = Math.random() * 10;
  }, []);

  useFrame((state, dt) => {
    const speed = motion.current?.speed ?? 0;
    const amt = Math.min(speed / 6, 1);
    phase.current += dt * (4 + speed * 1.25);
    const swing = Math.sin(phase.current) * (0.25 + 0.6 * amt) * Math.min(speed * 2, 1);
    legL.current.rotation.x = swing;
    legR.current.rotation.x = -swing;
    armL.current.rotation.x = -swing * 0.9;
    armR.current.rotation.x = swing * 0.9;
    const idle = speed < 0.05 ? Math.sin(state.clock.elapsedTime * 2) * 0.03 : 0;
    armL.current.rotation.z = 0.08 + idle;
    armR.current.rotation.z = -0.08 - idle;
    body.current.position.y = Math.abs(Math.cos(phase.current)) * 0.06 * Math.min(speed, 1);
    body.current.rotation.x = amt * 0.15;
  });

  const torso = look.jacket ? mats.jacket : mats.shirt;

  return (
    <group>
      <BlobShadow w={0.9} d={0.9} />
      <group ref={body}>
        {/* Legs (pivot at hip) */}
        {[
          [legL, -0.12],
          [legR, 0.12],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.9, 0]}>
            <mesh position={[0, -0.42, 0]} material={mats.pants} geometry={taper(0.23, 0.18, 0.84, 0.26, 0.21)} />
            {look.cargo && (
              <mesh position={[x as number > 0 ? 0.115 : -0.115, -0.38, 0.01]} material={mats.pants}>
                <boxGeometry args={[0.05, 0.2, 0.16]} />
              </mesh>
            )}
            <mesh position={[0, -0.84, 0.05]} material={mats.shoes}>
              <boxGeometry args={[0.22, 0.12, 0.34]} />
            </mesh>
          </group>
        ))}

        {/* Torso */}
        <mesh position={[0, 1.2, 0]} material={torso} geometry={taper(0.58, 0.44, 0.62, 0.31, 0.26)} />
        {look.jacket && (
          <>
            <mesh position={[0, 1.27, 0.15]} material={mats.shirt} geometry={taper(0.16, 0.1, 0.42, 0.01, 0.01)} />
            {/* Collar + hem */}
            <mesh position={[0, 1.52, -0.02]} material={mats.jacket}>
              <boxGeometry args={[0.36, 0.08, 0.3]} />
            </mesh>
            <mesh position={[0, 0.93, 0]} material={mats.jacket}>
              <boxGeometry args={[0.47, 0.08, 0.29]} />
            </mesh>
          </>
        )}
        {/* Belt / hips */}
        <mesh position={[0, 0.88, 0]} material={look.jacket ? mats.pants : mats.dark}>
          <boxGeometry args={[0.44, 0.1, 0.25]} />
        </mesh>

        {/* Arms (pivot at shoulder) */}
        {[
          [armL, -0.33],
          [armR, 0.33],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[(x as number) * 1.04, 1.46, 0]}>
            <mesh position={[0, -0.28, 0]} material={torso} geometry={taper(0.18, 0.13, 0.58, 0.19, 0.15)} />
            <mesh position={[0, -0.63, 0.01]} material={mats.skin}>
              <boxGeometry args={[0.11, 0.14, 0.13]} />
            </mesh>
          </group>
        ))}

        {/* Neck + head */}
        <mesh position={[0, 1.55, 0]} material={mats.skin}>
          <boxGeometry args={[0.13, 0.08, 0.13]} />
        </mesh>
        <group position={[0, 1.73, 0]}>
          <mesh material={mats.skin}>
            <boxGeometry args={[0.3, 0.32, 0.3]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.02, 0.165]} material={mats.skin}>
            <boxGeometry args={[0.05, 0.08, 0.05]} />
          </mesh>
          {/* Eyes + brows */}
          {[-0.07, 0.07].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.03, 0.151]} material={mats.eye}>
                <boxGeometry args={[0.035, 0.035, 0.005]} />
              </mesh>
              <mesh position={[x, 0.085, 0.152]} material={mats.hair}>
                <boxGeometry args={[0.08, 0.02, 0.01]} />
              </mesh>
            </group>
          ))}
          {look.mustache && (
            <mesh position={[0, -0.075, 0.158]} material={mats.hair}>
              <boxGeometry args={[0.15, 0.04, 0.025]} />
            </mesh>
          )}
          {look.glasses && (
            <group position={[0, 0.03, 0.163]}>
              {[-0.07, 0.07].map((x) => (
                <group key={x} position={[x, 0, 0]}>
                  {/* Frame: four bars around each lens */}
                  <mesh position={[0, 0.034, 0]} material={mats.dark}>
                    <boxGeometry args={[0.1, 0.014, 0.012]} />
                  </mesh>
                  <mesh position={[0, -0.034, 0]} material={mats.dark}>
                    <boxGeometry args={[0.1, 0.014, 0.012]} />
                  </mesh>
                  {[-0.045, 0.045].map((sx) => (
                    <mesh key={sx} position={[sx, 0, 0]} material={mats.dark}>
                      <boxGeometry args={[0.014, 0.08, 0.012]} />
                    </mesh>
                  ))}
                </group>
              ))}
              <mesh position={[0, 0.01, 0]} material={mats.dark}>
                <boxGeometry args={[0.04, 0.012, 0.012]} />
              </mesh>
              {/* Temples */}
              {[-0.155, 0.155].map((x) => (
                <mesh key={x} position={[x, 0.02, -0.08]} material={mats.dark}>
                  <boxGeometry args={[0.012, 0.012, 0.17]} />
                </mesh>
              ))}
            </group>
          )}
          {look.hairStyle === "short" && (
            <>
              <mesh position={[0, 0.175, -0.01]} material={mats.hair}>
                <boxGeometry args={[0.32, 0.09, 0.33]} />
              </mesh>
              <mesh position={[0, 0.06, -0.14]} material={mats.hair}>
                <boxGeometry args={[0.32, 0.24, 0.05]} />
              </mesh>
              {[-0.155, 0.155].map((x) => (
                <mesh key={x} position={[x, 0.1, -0.04]} material={mats.hair}>
                  <boxGeometry args={[0.02, 0.15, 0.22]} />
                </mesh>
              ))}
              {/* Quiff */}
              <mesh position={[0.03, 0.22, 0.08]} rotation={[0.3, 0, 0]} material={mats.hair}>
                <boxGeometry args={[0.24, 0.06, 0.14]} />
              </mesh>
            </>
          )}
          {look.hairStyle === "long" && (
            <>
              <mesh position={[0, 0.17, -0.01]} material={mats.hair}>
                <boxGeometry args={[0.33, 0.08, 0.33]} />
              </mesh>
              <mesh position={[0, -0.05, -0.15]} material={mats.hair}>
                <boxGeometry args={[0.34, 0.46, 0.06]} />
              </mesh>
              {[-0.16, 0.16].map((x) => (
                <mesh key={x} position={[x, 0, -0.03]} material={mats.hair}>
                  <boxGeometry args={[0.03, 0.34, 0.26]} />
                </mesh>
              ))}
            </>
          )}
          {look.hairStyle === "cap" && (
            <>
              <mesh position={[0, 0.17, 0]} material={mats.cap}>
                <boxGeometry args={[0.33, 0.1, 0.33]} />
              </mesh>
              <mesh position={[0, 0.13, 0.22]} material={mats.cap}>
                <boxGeometry args={[0.28, 0.025, 0.16]} />
              </mesh>
            </>
          )}
        </group>
      </group>
    </group>
  );
}
