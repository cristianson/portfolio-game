/**
 * Blocky Character
 *
 * A PS2-era low-poly person made of boxes, used for the player and for
 * pedestrians. Limbs pivot at hips & shoulders and swing based on the
 * `motion.speed` the controller writes every frame.
 */

"use client";

import React, { useMemo, useRef } from "react";
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
}

export interface Motion {
  /** Current ground speed in m/s. */
  speed: number;
}

/** Cristian: brunet, mustache, glasses. Tweak freely. */
export const PLAYER_LOOK: Look = {
  skin: "#e0ac85",
  hair: "#3a2619",
  hairStyle: "short",
  shirt: "#f2f2ee",
  jacket: "#2d3640",
  pants: "#3c5a82",
  shoes: "#f5f5f5",
  mustache: true,
  glasses: true,
};

export const PEDESTRIAN_LOOKS: Look[] = [
  { skin: "#8d5a3b", hair: "#111111", hairStyle: "short", shirt: "#c0392b", pants: "#2b2b2b", shoes: "#222222" },
  { skin: "#f1c7a5", hair: "#d9b26a", hairStyle: "long", shirt: "#7d5ba6", jacket: "#e8e1d0", pants: "#4b4b6b", shoes: "#5a3b22" },
  { skin: "#c58c62", hair: "#2a1a10", hairStyle: "cap", cap: "#1f6f50", shirt: "#f4c20d", pants: "#56606b", shoes: "#ffffff" },
  { skin: "#e8b896", hair: "#7a7a7a", hairStyle: "bald", shirt: "#4a6d8c", jacket: "#5b4636", pants: "#2e2e2e", shoes: "#151515", glasses: true },
  { skin: "#6b4429", hair: "#0d0d0d", hairStyle: "long", shirt: "#e67e22", pants: "#1d3557", shoes: "#e5e5e5" },
];

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
  const phase = useRef(Math.random() * 10);

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
            <mesh position={[0, -0.42, 0]} material={mats.pants}>
              <boxGeometry args={[0.2, 0.84, 0.24]} />
            </mesh>
            <mesh position={[0, -0.84, 0.05]} material={mats.shoes}>
              <boxGeometry args={[0.22, 0.12, 0.34]} />
            </mesh>
          </group>
        ))}

        {/* Torso */}
        <mesh position={[0, 1.2, 0]} material={torso}>
          <boxGeometry args={[0.5, 0.62, 0.28]} />
        </mesh>
        {look.jacket && (
          <mesh position={[0, 1.22, 0.142]} material={mats.shirt}>
            <boxGeometry args={[0.16, 0.56, 0.01]} />
          </mesh>
        )}
        {/* Belt */}
        <mesh position={[0, 0.92, 0]} material={mats.dark}>
          <boxGeometry args={[0.46, 0.06, 0.26]} />
        </mesh>

        {/* Arms (pivot at shoulder) */}
        {[
          [armL, -0.33],
          [armR, 0.33],
        ].map(([ref, x]) => (
          <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 1.47, 0]}>
            <mesh position={[0, -0.28, 0]} material={torso}>
              <boxGeometry args={[0.15, 0.58, 0.17]} />
            </mesh>
            <mesh position={[0, -0.63, 0]} material={mats.skin}>
              <boxGeometry args={[0.12, 0.13, 0.13]} />
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
