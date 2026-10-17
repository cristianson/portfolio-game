/**
 * Scene
 *
 * The <Canvas> and everything inside it: lights, fog, sky, the street and the
 * actors. Drag on the canvas to look around.
 */

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Buildings } from "./buildings";
import { FOG_COLOR, Ground, Sky } from "./ground";
import { Props } from "./props";
import { Markers } from "./markers";
import { Pedestrians } from "./pedestrians";
import { Player } from "./player";
import type { GameStore } from "./store";
import type { ZoneId } from "./world";

interface SceneProps {
  store: GameStore;
  onZoneChange: (zone: ZoneId | null) => void;
  onReady: () => void;
}

export function Scene({ store, onZoneChange, onReady }: SceneProps) {
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
        <color attach="background" args={[FOG_COLOR]} />
        <fog attach="fog" args={[FOG_COLOR, 30, 130]} />
        {/* Flat, bright overcast light: lots of ambient, a soft warm sun */}
        <hemisphereLight args={["#f2eee8", "#9a8f80", 2.3]} />
        <directionalLight position={[-30, 60, -25]} intensity={1.15} color="#fff0e0" />
        <Sky />
        <Ground />
        <Buildings />
        <Props />
        <Markers store={store} />
        <Pedestrians store={store} />
        <Player store={store} onZoneChange={onZoneChange} />
      </Canvas>
    </div>
  );
}
