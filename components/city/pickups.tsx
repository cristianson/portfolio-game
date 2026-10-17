/**
 * Social Pickups
 *
 * LinkedIn, X and GitHub lie on the street like the health and cash pickups in
 * GTA 3: a chunky glossy ball with the logo on it, spinning forever above a
 * soft yellow glow. Walking into one shows its card (see PickupCard in hud.tsx).
 */

"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SOCIALS } from "./content";
import { SOCIAL_ICON_PATHS } from "./icons";
import { groundHeight, PICKUPS, type PickupDef } from "./world";
import type { GameStore } from "./store";

const iconCache = new Map<string, THREE.Texture>();
const tmpScale = new THREE.Vector3();

/** White logo on a transparent canvas, drawn from the same paths as the UI icons. */
function iconTexture(name: string) {
  let tex = iconCache.get(name);
  if (!tex) {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const scale = (size * 0.62) / 24;
    ctx.translate(size / 2 - 12 * scale, size / 2 - 12 * scale);
    ctx.scale(scale, scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Dark outline first, then the white glyph, so it reads on any color
    for (const [color, width] of [["rgba(0,0,0,0.35)", 4], ["#ffffff", 2.4]] as const) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      for (const d of SOCIAL_ICON_PATHS[name] ?? []) ctx.stroke(new Path2D(d));
    }
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    iconCache.set(name, tex);
  }
  return tex;
}

let glowTex: THREE.Texture | null = null;
function glowTexture() {
  if (!glowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,236,140,0.85)");
    g.addColorStop(0.45, "rgba(255,214,90,0.35)");
    g.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
  }
  return glowTex;
}

function Pickup({ def, store, index }: { def: PickupDef; store: GameStore; index: number }) {
  const social = SOCIALS.find((s) => s.name === def.name)!;
  const spin = useRef<THREE.Group>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  const ground = groundHeight(def.x, def.z);

  const { ball, icon } = useMemo(
    () => ({
      ball: new THREE.MeshLambertMaterial({ color: social.color, emissive: social.color, emissiveIntensity: 0.25 }),
      icon: new THREE.MeshBasicMaterial({ map: iconTexture(def.name), transparent: true, toneMapped: false }),
    }),
    [social.color, def.name]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 1.3;
    const near = store.nearPickup === def.name;
    spin.current.rotation.y = t * 2.2;
    spin.current.position.y = ground + 0.9 + Math.sin(t * 2.6) * 0.08;
    const s = near ? 1.18 : 1;
    spin.current.scale.lerp(tmpScale.setScalar(s), 0.15);
    (glow.current.material as THREE.MeshBasicMaterial).opacity = (near ? 1 : 0.75) + Math.sin(t * 3) * 0.1;
  });

  return (
    <group position={[def.x, 0, def.z]}>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, ground + 0.03, 0]} renderOrder={2}>
        <circleGeometry args={[1.25, 24]} />
        <meshBasicMaterial
          map={glowTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group ref={spin}>
        {/* Slightly squashed low-poly ball, like the PS2 pickups */}
        <mesh material={ball} scale={[1, 1, 0.82]}>
          <icosahedronGeometry args={[0.42, 1]} />
        </mesh>
        {[1, -1].map((side) => (
          <mesh key={side} position={[0, 0, side * 0.355]} rotation={[0, side > 0 ? 0 : Math.PI, 0]} material={icon}>
            <planeGeometry args={[0.54, 0.54]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Pickups({ store }: { store: GameStore }) {
  return (
    <group>
      {PICKUPS.map((def, i) => (
        <Pickup key={def.name} def={def} store={store} index={i} />
      ))}
    </group>
  );
}
