/**
 * Scene
 *
 * The <Canvas> and everything inside it: lights, fog, sky, the street, the
 * gallery interior and the actors. Only one place is visible at a time; the
 * other stays mounted (hidden) so walking in and out is instant.
 * Drag on the canvas to look around.
 */

"use client";

import React, { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Buildings } from "./buildings";
import { Ground, Sky } from "./ground";
import { environmentFor, setNight } from "./daylight";
import { Props } from "./props";
import { Markers } from "./markers";
import { Pedestrians } from "./pedestrians";
import { Player } from "./player";
import { Pickups } from "./pickups";
import { Seasonal } from "./seasonal";
import { Gallery } from "./gallery";
import type { Season } from "./season";
import type { GameStore, Location } from "./store";
import type { ZoneId } from "./world";

interface SceneProps {
  store: GameStore;
  onZoneChange: (zone: ZoneId | null) => void;
  onPickupChange: (name: string | null) => void;
  onSpotChange: (id: string | null) => void;
  onReady: () => void;
  location: Location;
  /** 0 = night, 1 = day (see daylight.ts). */
  daylight: number;
  season: Season;
  christmas: boolean;
}

/** Sky, fog and lights for the current time of day. */
function Environment({ daylight, winter, indoor }: { daylight: number; winter: boolean; indoor: boolean }) {
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => environmentFor(daylight, winter), [daylight, winter]);
  const night = 1 - daylight;

  useEffect(() => {
    const horizon = new THREE.Color(indoor ? "#1a1210" : env.horizon);
    scene.background = horizon;
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(horizon);
    // Indoors the lights are always on, so nothing needs a night glow
    setNight(indoor ? 0 : night);
  }, [scene, env, night, indoor]);

  if (indoor) {
    return (
      <>
        <fog attach="fog" args={["#1a1210", 60, 120]} />
        <hemisphereLight args={["#fff1dc", "#5a3a2a", 1.9]} />
        <directionalLight position={[3, 10, -4]} intensity={0.55} color="#fff4e0" />
      </>
    );
  }

  return (
    <>
      {/* Falling snow thickens the haze */}
      <fog attach="fog" args={[env.horizon, winter ? 24 : 30, winter ? 105 : 130]} />
      <hemisphereLight args={[env.hemiSky, env.hemiGround, env.hemi]} />
      <directionalLight position={env.sunPos} intensity={env.sunIntensity} color={env.sun} />
      <Sky top={env.skyTop} mid={env.skyMid} horizon={env.horizon} night={night} />
    </>
  );
}

// Memoised: the HUD clock re-renders the game shell every few seconds, the 3D scene shouldn't follow
export const Scene = memo(function Scene({
  store,
  onZoneChange,
  onPickupChange,
  onSpotChange,
  onReady,
  location,
  daylight,
  season,
  christmas,
}: SceneProps) {
  const street = location === "street";
  const wrapper = useRef<HTMLDivElement>(null);

  // Drag anywhere on the 3D view to rotate the camera
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    let pointer: number | null = null;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      if (store.phase !== "play") return;
      pointer = e.pointerId;
      lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      store.camYaw -= dx * 0.008;
      store.manualCamUntil = performance.now() + 2500;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId === pointer) pointer = null;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [store]);

  return (
    <div ref={wrapper} className="absolute inset-0 touch-none city-grade">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 55, near: 0.3, far: 400, position: [0, 8, -48] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          onReady();
        }}
      >
        <Environment daylight={daylight} winter={season === "winter"} indoor={!street} />
        <group visible={street}>
          <Ground winter={season === "winter"} />
          <Buildings />
          <Props season={season} christmas={christmas} />
          <Seasonal season={season} christmas={christmas} night={1 - daylight} />
          <Markers store={store} />
          <Pickups store={store} />
          <Pedestrians store={store} season={season} christmas={christmas} />
        </group>
        <Gallery store={store} visible={!street} daylight={daylight} />
        <Player
          store={store}
          onZoneChange={onZoneChange}
          onPickupChange={onPickupChange}
          onSpotChange={onSpotChange}
          season={season}
          christmas={christmas}
        />
      </Canvas>
    </div>
  );
});
