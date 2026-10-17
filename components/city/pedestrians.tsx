/**
 * Pedestrians
 *
 * A few locals strolling up and down the sidewalks. They stop when you're in
 * their way and turn around at the end of their route. Their positions are
 * written to the store so the player can bump into them.
 */

"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Character, PEDESTRIAN_LOOKS, type Motion } from "./character";
import { PEDESTRIANS, SIDEWALK_HEIGHT, type PedestrianDef } from "./world";
import type { GameStore } from "./store";

function Pedestrian({ def, index, store }: { def: PedestrianDef; index: number; store: GameStore }) {
  const group = useRef<THREE.Group>(null!);
  const motion = useRef<Motion>({ speed: 0 });
  const state = useRef({
    z: def.zMin + (def.zMax - def.zMin) * def.start,
    dir: index % 2 ? -1 : 1,
    heading: index % 2 ? Math.PI : 0,
    pause: 0,
  });

  useMemo(() => {
    store.pedestrians[index] = { x: def.x, z: state.current.z };
  }, [store, index, def.x]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const p = store.player;

    // Wait politely if the player is right in front of us
    const ahead = (p.z - s.z) * s.dir;
    const blocked = ahead > 0 && ahead < 1.6 && Math.abs(p.x - def.x) < 0.9;
    let speed = blocked ? 0 : def.speed;

    if (s.pause > 0) {
      s.pause -= dt;
      speed = 0;
    } else {
      s.z += s.dir * speed * dt;
      if (s.z > def.zMax || s.z < def.zMin) {
        s.z = Math.max(def.zMin, Math.min(def.zMax, s.z));
        s.dir *= -1;
        s.pause = 1 + (index % 3) * 0.6;
      }
    }

    const target = s.dir > 0 ? 0 : Math.PI;
    let diff = target - s.heading;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    s.heading += diff * Math.min(1, dt * 5);

    motion.current.speed = speed;
    group.current.position.z = s.z;
    group.current.rotation.y = s.heading;
    store.pedestrians[index].z = s.z;
  });

  return (
    <group ref={group} position={[def.x, SIDEWALK_HEIGHT, state.current.z]}>
      <Character look={PEDESTRIAN_LOOKS[def.look % PEDESTRIAN_LOOKS.length]} motion={motion} />
    </group>
  );
}

export function Pedestrians({ store }: { store: GameStore }) {
  return (
    <group>
      {PEDESTRIANS.map((def, i) => (
        <Pedestrian key={i} def={def} index={i} store={store} />
      ))}
    </group>
  );
}
