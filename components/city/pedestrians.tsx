/**
 * Pedestrians
 *
 * A few locals strolling up and down the sidewalks. They step around you when
 * you're in their way and turn around at the end of their route. Their positions are
 * written to the store so the player can bump into them.
 */

"use client";

import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Character, PEDESTRIAN_LOOKS, type Motion } from "./character";
import { PEDESTRIANS, SIDEWALK_HEIGHT, type PedestrianDef } from "./world";
import type { GameStore } from "./store";

const DODGE = 1.1; // how far to step aside, meters
const DODGE_SPEED = 2.2; // m/s sideways

function Pedestrian({ def, index, store }: { def: PedestrianDef; index: number; store: GameStore }) {
  const group = useRef<THREE.Group>(null!);
  const motion = useRef<Motion>({ speed: 0 });
  const startZ = def.zMin + (def.zMax - def.zMin) * def.start;
  const state = useRef({
    z: startZ,
    dir: index % 2 ? -1 : 1,
    heading: index % 2 ? Math.PI : 0,
    pause: 0,
    /** Sideways offset from the walking line while stepping around the player. */
    offset: 0,
    dodgeSide: 0,
  });

  // Register before the first frame so the player can bump into us right away
  useLayoutEffect(() => {
    store.pedestrians[index] = { x: def.x, z: startZ };
  }, [store, index, def.x, startZ]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const p = store.player;
    const x = def.x + s.offset;

    // Step around the player instead of freezing in front of them
    const ahead = (p.z - s.z) * s.dir;
    const dx = p.x - x;
    const inTheWay = ahead > -0.4 && ahead < 2.2 && Math.abs(dx) < 1.0;
    if (inTheWay && s.dodgeSide === 0) {
      // Away from the player, but stay on the sidewalk
      const outward = Math.sign(def.x);
      const roomOut = 8.5 - Math.abs(def.x);
      s.dodgeSide = Math.abs(dx) > 0.05 ? -Math.sign(dx) : roomOut > 0.8 ? outward : -outward;
    } else if (!inTheWay && (ahead < -0.6 || Math.abs(dx) > 1.6)) {
      s.dodgeSide = 0;
    }
    const target = s.dodgeSide * DODGE;
    const step = Math.sign(target - s.offset) * Math.min(Math.abs(target - s.offset), DODGE_SPEED * dt);
    s.offset += step;
    // Keep inside the sidewalk band (away from the curb furniture and the walls)
    const absX = Math.min(8.5, Math.max(5.8, Math.abs(def.x + s.offset)));
    s.offset = Math.sign(def.x) * absX - def.x;

    // Only stop if the player is right on top of us and we haven't cleared them yet
    const blocked = ahead > 0 && ahead < 0.8 && Math.abs(p.x - (def.x + s.offset)) < 0.6;
    let speed = blocked ? 0 : s.dodgeSide !== 0 ? def.speed * 0.8 : def.speed;

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

    // Face where we're actually going, including the sidestep
    const sideways = step / Math.max(dt, 1e-4);
    const forward = s.dir * Math.max(speed, 0.3);
    const target2 = Math.atan2(sideways, forward);
    let diff = target2 - s.heading;
    diff = ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    s.heading += diff * Math.min(1, dt * 6);

    motion.current.speed = Math.hypot(speed, sideways);
    group.current.position.x = def.x + s.offset;
    group.current.position.z = s.z;
    group.current.rotation.y = s.heading;
    const me = store.pedestrians[index];
    if (me) {
      me.x = def.x + s.offset;
      me.z = s.z;
    }
  });

  return (
    <group ref={group} position={[def.x, SIDEWALK_HEIGHT, startZ]}>
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
