/**
 * Zone Markers
 *
 * Glowing cylinders on the sidewalk in front of each portfolio building, with
 * a spinning arrow bobbing above. Walk into one to get the "enter" prompt.
 * A marker hides while the camera is right next to it (e.g. just after
 * walking out of a building) so it never fills the screen.
 */

"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MARKER_ZONES, SIDEWALK_HEIGHT, type ZoneDef } from "./world";
import { markerTexture } from "./textures";
import type { GameStore } from "./store";

function Marker({ zone, store }: { zone: ZoneDef; store: GameStore }) {
  const root = useRef<THREE.Group>(null!);
  const cyl = useRef<THREE.Mesh>(null!);
  const arrow = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const cam = state.camera.position;
    root.current.visible = Math.hypot(cam.x - zone.x, cam.z - zone.z) > zone.radius + 1.4;
    const t = state.clock.elapsedTime;
    const active = store.nearZone === zone.id;
    const pulse = 1 + Math.sin(t * 3) * 0.04;
    cyl.current.scale.set(pulse, active ? 1.25 : 1, pulse);
    (cyl.current.material as THREE.MeshBasicMaterial).opacity = active ? 0.95 : 0.7;
    arrow.current.position.y = 3 + Math.sin(t * 2.4) * 0.18;
    arrow.current.rotation.y = t * 2;
    ring.current.rotation.z = -t * 0.8;
  });

  return (
    <group ref={root} position={[zone.x, SIDEWALK_HEIGHT + 0.01, zone.z]}>
      <mesh ref={cyl} position={[0, 0.8, 0]} renderOrder={2}>
        <cylinderGeometry args={[zone.radius, zone.radius, 1.6, 24, 1, true]} />
        <meshBasicMaterial
          color={zone.color}
          map={markerTexture()}
          transparent
          opacity={0.7}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} renderOrder={2}>
        <ringGeometry args={[zone.radius * 0.8, zone.radius, 24, 1, 0, Math.PI * 1.6]} />
        <meshBasicMaterial color={zone.color} transparent opacity={0.8} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={arrow}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.35, 0.7, 4]} />
          <meshBasicMaterial color={zone.color} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.22, 0.45, 0.22]} />
          <meshBasicMaterial color={zone.color} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export function Markers({ store }: { store: GameStore }) {
  return (
    <group>
      {MARKER_ZONES.map((z) => (
        <Marker key={z.id} zone={z} store={store} />
      ))}
    </group>
  );
}
