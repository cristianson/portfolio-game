/**
 * Player Controller & Camera
 *
 * Reads input from the store, moves the character relative to the camera,
 * resolves collisions, detects zones and drives a GTA-style chase camera that
 * swings in behind you while you run (and can be dragged to look around).
 * On the title screen the camera does a slow fly-through of the street.
 * Inside the gallery it collides with the hall instead, and when you stop at
 * a painting the camera moves in to frame it.
 */

"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Character, dressFor, PLAYER_LOOK, type Motion } from "./character";
import type { Season } from "./season";
import { COLLIDERS, groundHeight, MARKER_ZONES, PICKUP_RADIUS, PICKUPS, type ZoneId } from "./world";
import { GALLERY_COLLIDERS, SPOTS } from "./museum";
import { resolveCircle, resolveCircles, segmentHit } from "./collision";
import { angleDiff, type GameStore } from "./store";

const RADIUS = 0.35;
const RUN_SPEED = 6.4;
const SPRINT_SPEED = 9.5;
/** Running further than this from the camera's direction (back towards it) doesn't swing it round. */
const FOLLOW_MAX_ANGLE = 2.0;
/** Fastest the camera turns to follow you, rad/s, so steering with the stick feels like a gentle curve. */
const FOLLOW_MAX_RATE = 1.4;

interface PlayerProps {
  store: GameStore;
  onZoneChange: (zone: ZoneId | null) => void;
  onPickupChange: (name: string | null) => void;
  onSpotChange: (id: string | null) => void;
  season: Season;
  christmas: boolean;
}

export function Player({ store, onZoneChange, onPickupChange, onSpotChange, season, christmas }: PlayerProps) {
  const look = useMemo(() => dressFor(PLAYER_LOOK, season, christmas, "player"), [season, christmas]);
  const group = useRef<THREE.Group>(null!);
  const motion = useRef<Motion>({ speed: 0 });
  const camPos = useRef(new THREE.Vector3(0, 8, -48));
  const lookAt = useRef(new THREE.Vector3(0, 2, -30));
  const tmp = useRef(new THREE.Vector3());
  const { camera, size } = useThree();
  // `?cam=classic`: the old camera that only follows while you run forward (for comparing)
  const [classicCam] = useState(() => new URLSearchParams(window.location.search).get("cam") === "classic");

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = store.player;
    const playing = store.phase === "play" && !store.travelling;
    const inside = store.location === "gallery";
    const colliders = inside ? GALLERY_COLLIDERS : COLLIDERS;

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
      resolveCircles(p, RADIUS, inside ? store.visitors : store.pedestrians, 0.3);
      resolveCircle(p, RADIUS, colliders);
    }
    motion.current.speed = p.speed;

    const g = group.current;
    g.position.x = p.x;
    g.position.z = p.z;
    const ground = inside ? 0 : groundHeight(p.x, p.z);
    if (store.snapCamera) g.position.y = ground;
    g.position.y += (ground - g.position.y) * Math.min(1, dt * 15);
    g.rotation.y = p.heading;

    // ── Zones ─────────────────────────────────────────────────
    let near: ZoneId | null = null;
    for (const z of inside ? [] : MARKER_ZONES) {
      if (Math.hypot(p.x - z.x, p.z - z.z) < z.radius) near = z.id;
    }
    // Coming back out of a building you land next to its marker: it only works again once you've stepped off
    if (store.blockedZone && near !== store.blockedZone) store.blockedZone = null;
    if (near && near === store.blockedZone) near = null;
    if (near !== store.nearZone && !store.travelling) {
      store.nearZone = near;
      onZoneChange(near);
    }
    let pickup: string | null = null;
    for (const s of inside ? [] : PICKUPS) {
      if (Math.hypot(p.x - s.x, p.z - s.z) < PICKUP_RADIUS) pickup = s.name;
    }
    let spot: string | null = null;
    for (const s of inside ? SPOTS : []) {
      if (Math.hypot(p.x - s.x, p.z - s.z) < s.radius) spot = s.id;
    }
    if (spot !== store.nearSpot && !store.travelling) {
      store.nearSpot = spot;
      onSpotChange(spot);
    }
    if (pickup !== store.nearPickup) {
      store.nearPickup = pickup;
      onPickupChange(pickup);
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
    const framed = inside ? SPOTS.find((s) => s.id === store.nearSpot)?.painting : undefined;
    if (framed && store.phase === "play") {
      // Step back far enough to fit the painting (leaving room for the card below), and always
      // behind you so your head stays under the frame
      const aspect = size.width / size.height;
      const vTan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
      const dist = Math.max((framed.w * 0.62) / (vTan * aspect), (framed.h * 0.95) / vTan, 4.4);
      tmp.current.set(framed.x + framed.nx * dist, framed.y + 0.35, framed.z + framed.nz * dist);
      camPos.current.lerp(tmp.current, 1 - Math.exp(-dt * 3.5));
      // Aim below the painting so it sits in the upper part of the screen, clear of the card
      const drop = (portrait ? 0.2 : 0.08) * 2 * dist * vTan;
      lookAt.current.lerp(tmp.current.set(framed.x, framed.y - drop, framed.z), 1 - Math.exp(-dt * 3.5));
      // Keep the controls lined up with the view
      store.camYaw += angleDiff(Math.atan2(-framed.nx, -framed.nz), store.camYaw) * Math.min(1, dt * 3.5);
    } else if (store.phase === "title") {
      const t = state.clock.elapsedTime;
      const z = -21 + 15 * (1 - Math.cos(t * 0.06));
      tmp.current.set(Math.sin(t * 0.13) * 2.5, 8 + Math.sin(t * 0.09) * 1.5, z);
      camPos.current.lerp(tmp.current, 1 - Math.exp(-dt * 2));
      lookAt.current.lerp(tmp.current.set(0, 4, z + 14), 1 - Math.exp(-dt * 2));
    } else {
      // Swing behind the player while running, unless the user is looking around
      const now = performance.now();
      if (now > store.manualCamUntil && p.speed > 0.5) {
        const diff = angleDiff(p.heading, store.camYaw);
        const run = Math.min(p.speed / RUN_SPEED, 1.2);
        if (classicCam) {
          const follow = Math.max(0, Math.cos(diff)) * run;
          store.camYaw += diff * Math.min(1, dt * 1.6 * follow);
        } else if (Math.abs(diff) < FOLLOW_MAX_ANGLE) {
          // Follow sideways running too, so pushing the stick left just steers you round a curve
          // (one thumb, no dragging). Running back towards the camera leaves it be: with
          // camera-relative controls, swinging round would keep "back" spinning forever.
          const rate = THREE.MathUtils.clamp(diff * 1.6, -FOLLOW_MAX_RATE, FOLLOW_MAX_RATE);
          store.camYaw += rate * run * dt;
        }
      }
      // High-ish chase cam looking down at the player, like the reference
      const dist = portrait ? 6.8 : 6.0;
      const height = portrait ? 3.6 : 3.1;
      const bx = p.x - Math.sin(store.camYaw) * dist;
      const bz = p.z - Math.cos(store.camYaw) * dist;
      const hit = segmentHit(p.x, p.z, bx, bz, colliders);
      const t = Math.max(0.25, hit < 1 ? hit * 0.92 : 1);
      tmp.current.set(p.x + (bx - p.x) * t, g.position.y + height * (0.75 + 0.25 * t), p.z + (bz - p.z) * t);
      if (store.snapCamera) camPos.current.copy(tmp.current);
      else camPos.current.lerp(tmp.current, store.phase === "play" ? ease : ease * 0.5);
      // Pull in instantly if a wall gets between us
      if (hit < 1) {
        const want = Math.hypot(tmp.current.x - p.x, tmp.current.z - p.z);
        const have = Math.hypot(camPos.current.x - p.x, camPos.current.z - p.z);
        if (have > want) camPos.current.copy(tmp.current);
      }
      lookAt.current.lerp(
        tmp.current.set(p.x + Math.sin(store.camYaw) * 1.2, g.position.y + 1.5, p.z + Math.cos(store.camYaw) * 1.2),
        store.snapCamera ? 1 : 1 - Math.exp(-dt * 14)
      );
      store.snapCamera = false;
    }
    camera.position.copy(camPos.current);
    camera.lookAt(lookAt.current);
  });

  return (
    <group ref={group} position={[store.player.x, 0.15, store.player.z]}>
      {/* Lit a little after dark so you never lose yourself on the street */}
      <Character look={look} motion={motion} glow={0.55} />
    </group>
  );
}
