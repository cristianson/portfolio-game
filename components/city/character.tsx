/**
 * Low-poly Character
 *
 * An early-2000s console style person: tapered 8-sided limbs with knees and
 * elbows, a rounded torso with the jacket painted on, and a head whose face
 * (eyes, brows, mustache, glasses, hairline) is drawn on a canvas texture.
 * Used for the player and for pedestrians; limbs swing based on the
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
  { skin: "#e8b896", hair: "#7a7a7a", hairStyle: "bald", shirt: "#4a5d70", jacket: "#5b4636", pants: "#2e2e2e", shoes: "#151515", glasses: true, mustache: true },
  { skin: "#6b4429", hair: "#0d0d0d", hairStyle: "cap", cap: "#7a2a7a", shirt: "#7a2a7a", jacket: "#7a2a7a", pants: "#7a2a7a", shoes: "#1a1a1a" },
];

// ── Shared geometry ─────────────────────────────────────────────────────────

const SEG = 8;
const geoCache = new Map<string, THREE.BufferGeometry>();

function cachedGeo(key: string, make: () => THREE.BufferGeometry) {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}

/** Tapered limb hanging down from its pivot (top at y = 0). */
function limb(rTop: number, rBottom: number, len: number, flatten = 1) {
  return cachedGeo(`limb${rTop},${rBottom},${len},${flatten}`, () => {
    const g = new THREE.CylinderGeometry(rTop, rBottom, len, SEG, 1);
    g.translate(0, -len / 2, 0);
    g.scale(1, 1, flatten);
    return g;
  });
}

function blob(r: number, sx: number, sy: number, sz: number, w = 8, h = 6) {
  return cachedGeo(`blob${r},${sx},${sy},${sz},${w},${h}`, () => {
    const g = new THREE.SphereGeometry(r, w, h);
    g.scale(sx, sy, sz);
    return g;
  });
}

const HEAD_R = 0.12;
const HEAD_SCALE: [number, number, number] = [0.9, 1.12, 1];

const headGeo = () =>
  cachedGeo("head", () => {
    const g = new THREE.SphereGeometry(HEAD_R, 14, 10);
    g.scale(...HEAD_SCALE);
    return g;
  });

/** Partial sphere hugging the skull: hair volume or the crown of a cap. */
const crownGeo = (thetaLength: number, grow: number) =>
  cachedGeo(`crown${thetaLength},${grow}`, () => {
    const g = new THREE.SphereGeometry(HEAD_R + grow, 14, 6, 0, Math.PI * 2, 0, thetaLength);
    g.scale(...HEAD_SCALE);
    return g;
  });

const torsoGeo = () =>
  cachedGeo("torso", () => {
    const g = new THREE.CylinderGeometry(0.2, 0.155, 0.52, 12, 1);
    g.translate(0, 0.26, 0);
    g.scale(1, 1, 0.62);
    return g;
  });

const pelvisGeo = () =>
  cachedGeo("pelvis", () => {
    const g = new THREE.CylinderGeometry(0.158, 0.15, 0.2, 10, 1);
    g.scale(1, 1, 0.68);
    return g;
  });

const shoeGeo = () =>
  cachedGeo("shoe", () => {
    const g = new THREE.CapsuleGeometry(0.055, 0.13, 3, 8);
    g.rotateX(Math.PI / 2);
    g.scale(1.05, 0.72, 1);
    return g;
  });

const collarGeo = () =>
  cachedGeo("collar", () => {
    const g = new THREE.TorusGeometry(0.07, 0.024, 5, 12);
    g.rotateX(Math.PI / 2);
    g.scale(1.15, 1, 0.9);
    return g;
  });

const lensGeo = () => cachedGeo("lens", () => new THREE.TorusGeometry(0.027, 0.0045, 4, 14));

// ── Painted textures ────────────────────────────────────────────────────────

const texCache = new Map<string, THREE.Texture>();

function makeTexture(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  let tex = texCache.get(key);
  if (!tex) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    paint(c.getContext("2d")!);
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    texCache.set(key, tex);
  }
  return tex;
}

/**
 * Face + hair painted around the head sphere. On the sphere's UVs the face
 * looks out at u = 0.25 (x = 64), the ears sit at x = 0 / 128 and the back of
 * the head at x = 192; y runs from the crown (0) to the chin (128).
 */
function faceTexture(look: Look) {
  const key = `face-${look.skin}-${look.hair}-${look.hairStyle}-${look.mustache}-${look.glasses}`;
  return makeTexture(key, 256, 128, (ctx) => {
    ctx.fillStyle = look.skin;
    ctx.fillRect(0, 0, 256, 128);
    // Soft shading under the jaw and at the temples
    const jaw = ctx.createLinearGradient(0, 80, 0, 128);
    jaw.addColorStop(0, "rgba(90,40,20,0)");
    jaw.addColorStop(1, "rgba(90,40,20,0.35)");
    ctx.fillStyle = jaw;
    ctx.fillRect(0, 80, 256, 48);

    const hair = look.hair;
    ctx.fillStyle = hair;
    if (look.hairStyle === "short" || look.hairStyle === "cap") {
      ctx.fillRect(0, 0, 256, 30);
      // Temples dip a little lower than the forehead
      ctx.beginPath();
      ctx.moveTo(26, 30);
      ctx.quadraticCurveTo(44, 38, 50, 30);
      ctx.lineTo(78, 30);
      ctx.quadraticCurveTo(84, 38, 102, 30);
      ctx.fill();
      // Sides (sideburns down past the ears) and the back down to the nape
      ctx.fillRect(100, 0, 30, 58);
      ctx.fillRect(0, 0, 28, 58);
      ctx.fillRect(128, 0, 128, 74);
      ctx.fillRect(122, 58, 10, 10);
      ctx.fillRect(0, 58, 6, 10);
    } else if (look.hairStyle === "long") {
      ctx.fillRect(0, 0, 256, 32);
      ctx.fillRect(98, 0, 158, 118);
      ctx.fillRect(0, 0, 30, 118);
    } else {
      // Bald: a darker rim around the back
      ctx.fillStyle = "rgba(60,40,30,0.18)";
      ctx.fillRect(110, 46, 146, 22);
    }

    const eyeY = 60;
    for (const ex of [47, 81]) {
      ctx.fillStyle = "#f4efe6";
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 5.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a1c14";
      ctx.beginPath();
      ctx.arc(ex + 0.5, eyeY, 2.4, 0, Math.PI * 2);
      ctx.fill();
      // Brow
      ctx.fillStyle = look.hairStyle === "bald" ? "#5a4434" : hair;
      ctx.beginPath();
      ctx.moveTo(ex - 7, eyeY - 7);
      ctx.quadraticCurveTo(ex, eyeY - 11, ex + 7, eyeY - 7);
      ctx.lineTo(ex + 7, eyeY - 5);
      ctx.quadraticCurveTo(ex, eyeY - 8.5, ex - 7, eyeY - 5);
      ctx.fill();
    }
    // Nose shadow + mouth
    ctx.fillStyle = "rgba(110,55,30,0.35)";
    ctx.fillRect(62, 64, 4, 12);
    ctx.fillStyle = "#8a4a3a";
    ctx.fillRect(57, 88, 14, 2.5);

    if (look.mustache) {
      ctx.fillStyle = look.hairStyle === "bald" ? "#5a4434" : hair;
      ctx.beginPath();
      ctx.moveTo(49, 86);
      ctx.quadraticCurveTo(54, 78, 64, 80);
      ctx.quadraticCurveTo(74, 78, 79, 86);
      ctx.quadraticCurveTo(72, 84, 64, 85);
      ctx.quadraticCurveTo(56, 84, 49, 86);
      ctx.fill();
    }
    if (look.glasses) {
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = 2.5;
      for (const ex of [47, 81]) {
        ctx.beginPath();
        ctx.roundRect(ex - 9, eyeY - 6.5, 18, 13, 4);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(56, eyeY - 1);
      ctx.lineTo(72, eyeY - 1);
      ctx.moveTo(38, eyeY - 2);
      ctx.lineTo(14, eyeY - 4);
      ctx.moveTo(90, eyeY - 2);
      ctx.lineTo(114, eyeY - 4);
      ctx.stroke();
    }
  });
}

/** Torso wrap: an open jacket over the shirt, or just the shirt. Front is at x = 0 / 128. */
function torsoTexture(look: Look) {
  const key = `torso-${look.jacket}-${look.shirt}`;
  return makeTexture(key, 128, 64, (ctx) => {
    if (!look.jacket) {
      ctx.fillStyle = look.shirt;
      ctx.fillRect(0, 0, 128, 64);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, 8, 4);
      ctx.fillRect(120, 0, 8, 4);
      return;
    }
    ctx.fillStyle = look.jacket;
    ctx.fillRect(0, 0, 128, 64);
    // Leather sheen down the sides
    for (const x of [30, 96]) {
      const g = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, "rgba(255,255,255,0.09)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 10, 0, 20, 64);
    }
    // Open front showing the shirt (wraps across the seam at x = 0 / 128)
    ctx.fillStyle = look.shirt;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, 0);
    ctx.lineTo(2, 56);
    ctx.lineTo(0, 56);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(121, 0);
    ctx.lineTo(126, 56);
    ctx.lineTo(128, 56);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(2, 56);
    ctx.moveTo(121, 0);
    ctx.lineTo(126, 56);
    ctx.stroke();
    // Waistband
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 56, 128, 8);
  });
}

function useMats(look: Look) {
  return useMemo(() => {
    const m = (c: string) => new THREE.MeshLambertMaterial({ color: c });
    return {
      skin: m(look.skin),
      hair: m(look.hair),
      shirt: m(look.shirt),
      sleeve: m(look.jacket ?? look.shirt),
      pants: m(look.pants),
      pocket: m(new THREE.Color(look.pants).multiplyScalar(0.85).getStyle()),
      shoes: m(look.shoes),
      cap: m(look.cap ?? look.hair),
      dark: m("#151515"),
      face: new THREE.MeshLambertMaterial({ map: faceTexture(look) }),
      torso: new THREE.MeshLambertMaterial({ map: torsoTexture(look) }),
    };
  }, [look]);
}

type GroupRef = React.RefObject<THREE.Group>;

export function Character({ look, motion }: { look: Look; motion: React.RefObject<Motion> }) {
  const mats = useMats(look);
  const body = useRef<THREE.Group>(null!);
  const spine = useRef<THREE.Group>(null!);
  const legs = [useRef<THREE.Group>(null!), useRef<THREE.Group>(null!)];
  const knees = [useRef<THREE.Group>(null!), useRef<THREE.Group>(null!)];
  const arms = [useRef<THREE.Group>(null!), useRef<THREE.Group>(null!)];
  const elbows = [useRef<THREE.Group>(null!), useRef<THREE.Group>(null!)];
  const phase = useRef(Math.random() * 10);

  useFrame((state, dt) => {
    const speed = motion.current?.speed ?? 0;
    const moving = Math.min(speed * 2, 1);
    const run = Math.min(speed / 6, 1);
    phase.current += dt * (3.5 + speed * 1.3);
    const p = phase.current;
    const swing = Math.sin(p) * (0.35 + 0.45 * run) * moving;

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 1 : -1;
      const ph = p + (i === 0 ? 0 : Math.PI);
      legs[i].current.rotation.x = -swing * side;
      // Knee folds while the leg swings through
      knees[i].current.rotation.x = (0.08 + Math.max(0, -Math.cos(ph)) * (0.5 + 0.7 * run)) * moving;
      arms[i].current.rotation.x = swing * side * 0.85;
      arms[i].current.rotation.z = side * -0.06 - side * Math.sin(state.clock.elapsedTime * 1.6) * 0.015 * (1 - moving);
      elbows[i].current.rotation.x = -(0.18 + 0.55 * run * moving + Math.max(0, swing * side) * 0.3);
    }
    spine.current.rotation.y = swing * 0.12;
    spine.current.rotation.x = run * 0.12 * moving;
    body.current.position.y = Math.abs(Math.cos(p)) * 0.045 * moving;
  });

  const hasJacket = !!look.jacket;

  return (
    <group>
      <BlobShadow w={0.9} d={0.9} />
      <group ref={body}>
        {/* Hips + legs */}
        <group position={[0, 0.95, 0]}>
          <mesh material={mats.pants} geometry={pelvisGeo()} />
          <mesh position={[0, 0.09, 0]} material={mats.dark} scale={[1.02, 1, 1.02]}>
            <cylinderGeometry args={[0.16, 0.16, 0.035, 10]} />
          </mesh>
          {[0, 1].map((i) => {
            const side = i === 0 ? 1 : -1;
            return (
              <group key={i} ref={legs[i] as GroupRef} position={[side * 0.088, -0.02, 0]}>
                <mesh material={mats.pants} geometry={limb(0.082, 0.062, 0.44, 0.95)} />
                {look.cargo && (
                  <mesh position={[side * 0.066, -0.25, 0.005]} material={mats.pocket} geometry={blob(0.045, 0.28, 1.25, 1.1, 6, 4)} />
                )}
                <group ref={knees[i] as GroupRef} position={[0, -0.43, 0]}>
                  <mesh material={mats.pants} geometry={blob(0.063, 1, 1, 1)} />
                  <mesh material={mats.pants} geometry={limb(0.062, 0.05, 0.43, 0.95)} />
                  <mesh position={[0, -0.455, 0.045]} material={mats.shoes} geometry={shoeGeo()} />
                </group>
              </group>
            );
          })}
        </group>

        {/* Upper body */}
        <group ref={spine} position={[0, 1.04, 0]}>
          <mesh material={mats.torso} geometry={torsoGeo()} />
          {hasJacket && <mesh position={[0, 0.53, -0.005]} material={mats.sleeve} geometry={collarGeo()} />}
          {/* Neck + head */}
          <mesh position={[0, 0.57, 0]} material={mats.skin}>
            <cylinderGeometry args={[0.045, 0.05, 0.1, 8]} />
          </mesh>
          <group position={[0, 0.72, 0.005]}>
            <mesh material={mats.face} geometry={headGeo()} rotation={[0, 0, 0]} />
            {/* Ears + nose */}
            {[1, -1].map((s) => (
              <mesh key={s} position={[s * 0.107, -0.005, -0.005]} material={mats.skin} geometry={blob(0.026, 0.45, 1, 0.75, 6, 4)} />
            ))}
            <mesh position={[0, -0.015, 0.118]} rotation={[0.2, 0, 0]} material={mats.skin} geometry={blob(0.02, 0.85, 1.35, 1.05, 6, 4)} />
            {(look.hairStyle === "short" || look.hairStyle === "long") && (
              <mesh rotation={[-0.38, 0, 0]} position={[0, 0.006, -0.004]} material={mats.hair} geometry={crownGeo(Math.PI * 0.4, 0.012)} />
            )}
            {look.hairStyle === "long" && (
              <mesh position={[0, -0.07, -0.06]} material={mats.hair} geometry={blob(0.11, 0.95, 1.45, 0.5)} />
            )}
            {look.hairStyle === "cap" && (
              <>
                <mesh rotation={[-0.15, 0, 0]} material={mats.cap} geometry={crownGeo(Math.PI * 0.42, 0.01)} />
                <mesh position={[0, 0.06, 0.1]} rotation={[0.12, 0, 0]} material={mats.cap} scale={[1, 1, 0.75]}>
                  <cylinderGeometry args={[0.085, 0.085, 0.012, 10, 1, false, -Math.PI / 2, Math.PI]} />
                </mesh>
              </>
            )}
            {look.glasses && (
              <group position={[0, 0.003, 0.111]}>
                {[1, -1].map((s) => (
                  <mesh key={s} position={[s * 0.047, 0, 0]} material={mats.dark} geometry={lensGeo()} />
                ))}
                <mesh material={mats.dark}>
                  <boxGeometry args={[0.03, 0.006, 0.006]} />
                </mesh>
              </group>
            )}
          </group>

          {/* Arms (pivot at the shoulder) */}
          {[0, 1].map((i) => {
            const side = i === 0 ? 1 : -1;
            const sleeve = hasJacket ? mats.sleeve : mats.shirt;
            return (
              <group key={i} position={[side * 0.215, 0.47, 0]}>
                <mesh material={sleeve} geometry={blob(0.075, 1, 0.9, 0.9)} />
                <group ref={arms[i] as GroupRef}>
                  <mesh material={sleeve} geometry={limb(0.058, 0.048, 0.29)} />
                  <group ref={elbows[i] as GroupRef} position={[0, -0.28, 0]}>
                    <mesh material={hasJacket ? sleeve : mats.skin} geometry={blob(0.047, 1, 1, 1, 6, 5)} />
                    <mesh material={hasJacket ? sleeve : mats.skin} geometry={limb(0.047, 0.04, 0.25)} />
                    {hasJacket && (
                      <mesh position={[0, -0.24, 0]} material={mats.dark}>
                        <cylinderGeometry args={[0.043, 0.043, 0.03, 8]} />
                      </mesh>
                    )}
                    <mesh position={[0, -0.3, 0.005]} material={mats.skin} geometry={blob(0.045, 0.75, 1.2, 0.6)} />
                  </group>
                </group>
              </group>
            );
          })}
        </group>
      </group>
    </group>
  );
}
