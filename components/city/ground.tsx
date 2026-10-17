/**
 * Ground & Sky
 *
 * Road, raised sidewalks with curbs, crosswalks, the little park and the
 * gradient sky dome. The fog colour matches the sky horizon so the far end
 * of the street dissolves into haze.
 */

"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CROSSWALKS, PARK, ROAD_HALF, SIDEWALK_HEIGHT, SIDEWALK_OUTER, STREET_LENGTH } from "./world";
import { worldBox } from "./geometry";
import {
  crosswalkTexture,
  grassTexture,
  roadTexture,
  sidewalkTexture,
  createSky,
} from "./textures";


const LENGTH = STREET_LENGTH;
const CURB = new THREE.MeshLambertMaterial({ color: "#a8a49b" });

function Sidewalk({ side }: { side: 1 | -1 }) {
  const w = SIDEWALK_OUTER - ROAD_HALF;
  const { geo, mats } = useMemo(() => {
    const top = new THREE.MeshLambertMaterial({ map: sidewalkTexture() });
    return {
      geo: worldBox(w, SIDEWALK_HEIGHT, LENGTH, 2, 2),
      mats: [CURB, CURB, top, CURB, CURB, CURB],
    };
  }, [w]);
  return (
    <mesh
      geometry={geo}
      material={mats}
      position={[side * (ROAD_HALF + w / 2), SIDEWALK_HEIGHT / 2, 0]}
    />
  );
}

// Gap in the fence + gravel path, in the middle of the park
const PARK_GATE = (PARK.z0 + PARK.z1) / 2;

function Park() {
  const w = PARK.x1 - PARK.x0;
  const d = PARK.z1 - PARK.z0;
  const { geo, mats } = useMemo(() => {
    const top = new THREE.MeshLambertMaterial({ map: grassTexture() });
    return { geo: worldBox(w, SIDEWALK_HEIGHT, d, 3, 3), mats: [CURB, CURB, top, CURB, CURB, CURB] };
  }, [w, d]);
  return (
    <group>
      <mesh geometry={geo} material={mats} position={[(PARK.x0 + PARK.x1) / 2, SIDEWALK_HEIGHT / 2 + 0.005, (PARK.z0 + PARK.z1) / 2]} />
      {/* Iron fence along the sidewalk edge, with a gap for the path */}
      {[
        [PARK.z0, PARK_GATE - 2.5],
        [PARK_GATE + 2.5, PARK.z1],
      ].map(([z0, z1]) => (
        <group key={z0}>
          <mesh position={[-SIDEWALK_OUTER - 0.1, 0.65, (z0 + z1) / 2]}>
            <boxGeometry args={[0.06, 0.06, z1 - z0]} />
            <meshLambertMaterial color="#1f2a24" />
          </mesh>
          {Array.from({ length: Math.floor((z1 - z0) / 0.5) + 1 }, (_, i) => (
            <mesh key={i} position={[-SIDEWALK_OUTER - 0.1, 0.4, z0 + i * 0.5]}>
              <boxGeometry args={[0.04, 0.5, 0.04]} />
              <meshLambertMaterial color="#1f2a24" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Gravel path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, SIDEWALK_HEIGHT + 0.02, PARK_GATE]}>
        <planeGeometry args={[12, 2.4]} />
        <meshLambertMaterial color="#b8a988" />
      </mesh>
    </group>
  );
}

export function Ground() {
  const roadMat = useMemo(() => {
    const tex = roadTexture().clone();
    tex.repeat.set(1, LENGTH / 10);
    tex.needsUpdate = true;
    return new THREE.MeshLambertMaterial({ map: tex });
  }, []);

  return (
    <group>
      {/* Base plane far below everything so no gaps show */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshLambertMaterial color="#8a877f" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={roadMat}>
        <planeGeometry args={[ROAD_HALF * 2, LENGTH]} />
      </mesh>
      {CROSSWALKS.map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]}>
          <planeGeometry args={[ROAD_HALF * 2, 3]} />
          <meshLambertMaterial map={crosswalkTexture()} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        </mesh>
      ))}
      {[-15, 6].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[1.6, 0.02, z]}>
          <circleGeometry args={[0.45, 12]} />
          <meshLambertMaterial color="#2a2b2d" />
        </mesh>
      ))}
      <Sidewalk side={1} />
      <Sidewalk side={-1} />
      <Park />
    </group>
  );
}

/** Sky dome; repainted whenever the time of day changes. */
export function Sky({ top, mid, horizon, night }: { top: string; mid: string; horizon: string; night: number }) {
  const sky = useMemo(() => createSky(), []);
  useEffect(() => sky.paint(top, mid, horizon, night), [sky, top, mid, horizon, night]);
  return (
    <mesh>
      <sphereGeometry args={[300, 16, 12]} />
      <meshBasicMaterial map={sky.texture} side={THREE.BackSide} fog={false} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}
