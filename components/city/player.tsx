/**
 * Player Controller & Camera
 *
 * Reads input from the store, moves the character relative to the camera,
 * resolves collisions, detects zones and drives a GTA-style chase camera that
 * swings in behind you while you run (and can be dragged to look around).
 * On the title screen the camera does a slow fly-through of the street.
 */

"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Character, PLAYER_LOOK, type Motion } from "./character";
import { COLLIDERS, groundHeight, ZONES, type ZoneId } from "./world";
import { resolveCircle, resolveCircles, segmentHit } from "./collision";
import { angleDiff, type GameStore } from "./store";

const RADIUS = 0.35;
const RUN_SPEED = 5.6;
const SPRINT_SPEED = 8.5;

interface PlayerProps {
  store: GameStore;
  onZoneChange: (zone: ZoneId | null) => void;
}

export function Player({ store, onZoneChange }: PlayerProps) {
  const group = useRef<THREE.Group>(null!);
  const motion = useRef<Motion>({ speed: 0 });
  const camPos = useRef(new THREE.Vector3(0, 8, -48));
  const lookAt = useRef(new THREE.Vector3(0, 2, -30));
  const tmp = useRef(new THREE.Vector3());
  const { camera, size } = useThree();

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = store.player;
    const playing = store.phase === "play";

    // ── Movement ──────────────────────────────────────────────
    let ix = store.input.kx + store.input.jx;
    let iy = store.input.ky + store.input.jy;
    let mag = Math.hypot(ix, iy);
    if (mag > 1) {
      ix /= mag;
      iy /= mag;
      mag = 1;
    }
    if (!playing || mag < 0.08) mag = 0;

    const yaw = store.camYaw;
    if (mag > 0) {
      const dx = Math.sin(yaw) * iy - Math.cos(yaw) * ix;
      const dz = Math.cos(yaw) * iy + Math.sin(yaw) * ix;
      const target = Math.atan2(dx, dz);
      p.heading += angleDiff(target, p.heading) * Math.min(1, dt * 12);
    }
    const maxSpeed = store.input.sprint ? SPRINT_SPEED : RUN_SPEED;
    const targetSpeed = mag * maxSpeed;
    const accel = targetSpeed > p.speed ? 18 : 26;
    p.speed += Math.sign(targetSpeed - p.speed) * Math.min(Math.abs(targetSpeed - p.speed), accel * dt);

    if (p.speed > 0.001) {
      p.x += Math.sin(p.heading) * p.speed * dt;
      p.z += Math.cos(p.heading) * p.speed * dt;
      resolveCircles(p, RADIUS, store.pedestrians, 0.3);
      resolveCircle(p, RADIUS, COLLIDERS);
    }
    motion.current.speed = p.speed;

    const g = group.current;
    g.position.x = p.x;
    g.position.z = p.z;
    g.position.y += (groundHeight(p.x, p.z) - g.position.y) * Math.min(1, dt * 15);
    g.rotation.y = p.heading;

    // ── Zones ─────────────────────────────────────────────────
    let near: ZoneId | null = null;
    for (const z of ZONES) {
      if (Math.hypot(p.x - z.x, p.z - z.z) < z.radius) near = z.id;
    }
    if (near !== store.nearZone) {
      store.nearZone = near;
      onZoneChange(near);
    }

    // ── Camera ────────────────────────────────────────────────
    const portrait = size.height > size.width;
    const cam = camera as THREE.PerspectiveCamera;
    const fov = portrait ? 68 : 55;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    const ease = 1 - Math.exp(-dt * 7);
    if (store.phase === "title") {
      const t = state.clock.elapsedTime;
      const z = -40 + 32 * (1 - Math.cos(t * 0.06));
      tmp.current.set(Math.sin(t * 0.13) * 2.5, 8 + Math.sin(t * 0.09) * 1.5, z);
      camPos.current.lerp(tmp.current, 1 - Math.exp(-dt * 2));
      lookAt.current.lerp(tmp.current.set(0, 4, z + 14), 1 - Math.exp(-dt * 2));
    } else {
      // Swing behind the player while running forward-ish, unless the user is looking around
      const now = performance.now();
      if (now > store.manualCamUntil && p.speed > 0.5) {
        const diff = angleDiff(p.heading, store.camYaw);
        const follow = Math.max(0, Math.cos(diff)) * (p.speed / RUN_SPEED);
        store.camYaw += diff * Math.min(1, dt * 1.6 * follow);
      }
      // High-ish chase cam looking down at the player, like the reference
      const dist = portrait ? 6.8 : 6.0;
      const height = portrait ? 3.6 : 3.1;
      const bx = p.x - Math.sin(store.camYaw) * dist;
      const bz = p.z - Math.cos(store.camYaw) * dist;
      const hit = segmentHit(p.x, p.z, bx, bz, COLLIDERS);
      const t = Math.max(0.25, hit < 1 ? hit * 0.92 : 1);
      tmp.current.set(p.x + (bx - p.x) * t, g.position.y + height * (0.75 + 0.25 * t), p.z + (bz - p.z) * t);
      camPos.current.lerp(tmp.current, store.phase === "play" ? ease : ease * 0.5);
      // Pull in instantly if a wall gets between us
      if (hit < 1) {
        const want = Math.hypot(tmp.current.x - p.x, tmp.current.z - p.z);
        const have = Math.hypot(camPos.current.x - p.x, camPos.current.z - p.z);
        if (have > want) camPos.current.copy(tmp.current);
      }
      lookAt.current.lerp(
        tmp.current.set(p.x + Math.sin(store.camYaw) * 1.2, g.position.y + 1.5, p.z + Math.cos(store.camYaw) * 1.2),
        1 - Math.exp(-dt * 14)
      );
    }
    camera.position.copy(camPos.current);
    camera.lookAt(lookAt.current);
  });

  return (
    <group ref={group} position={[store.player.x, 0.15, store.player.z]}>
      <Character look={PLAYER_LOOK} motion={motion} />
    </group>
  );
}
