/**
 * Radar
 *
 * Round minimap in the corner, rotating with the camera like the classic
 * 2001-era HUD. Section blips stick to the rim when they're out of range.
 * Updated straight from the store in its own rAF loop (no React renders).
 */

"use client";

import React, { useEffect, useRef } from "react";
import { BUILDINGS, PARK, ROAD_HALF, SIDEWALK_OUTER, ZONES } from "./world";
import type { GameStore } from "./store";

const RANGE = 48; // meters from centre to rim
const S = 100 / RANGE;
const RIM = 84;

export function Radar({ store, className = "" }: { store: GameStore; className?: string }) {
  const map = useRef<SVGGElement>(null);
  const blips = useRef<(SVGGElement | null)[]>([]);
  const north = useRef<SVGGElement>(null);
  const arrow = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const { x: px, z: pz, heading } = store.player;
      const yaw = store.camYaw;
      const cos = Math.cos(yaw);
      const sin = Math.sin(yaw);
      // World (x, z) → radar (u, v): camera forward points up
      const a = -cos * S;
      const b = -sin * S;
      const c = sin * S;
      const d = -cos * S;
      const e = -(a * px + c * pz);
      const f = -(b * px + d * pz);
      map.current?.setAttribute("transform", `matrix(${a} ${b} ${c} ${d} ${e} ${f})`);

      ZONES.forEach((zone, i) => {
        let u = a * zone.x + c * zone.z + e;
        let v = b * zone.x + d * zone.z + f;
        const len = Math.hypot(u, v);
        if (len > RIM) {
          u = (u / len) * RIM;
          v = (v / len) * RIM;
        }
        blips.current[i]?.setAttribute("transform", `translate(${u} ${v})`);
      });

      const nu = c;
      const nv = d;
      const nl = Math.hypot(nu, nv) || 1;
      north.current?.setAttribute("transform", `translate(${(nu / nl) * 92} ${(nv / nl) * 92})`);

      const rel = ((heading - yaw) * 180) / Math.PI;
      arrow.current?.setAttribute("transform", `rotate(${-rel})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [store]);

  return (
    <svg viewBox="-100 -100 200 200" className={`drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${className}`} aria-hidden>
      <defs>
        <clipPath id="radar-clip">
          <circle r="96" />
        </clipPath>
      </defs>
      <circle r="98" fill="#0d0d0d" />
      <g clipPath="url(#radar-clip)">
        <circle r="96" fill="#1b2a38" />
        <g ref={map}>
          <rect x={-40} y={-70} width={80} height={140} fill="#56606a" />
          <rect x={PARK.x0} y={PARK.z0} width={PARK.x1 - PARK.x0} height={PARK.z1 - PARK.z0} fill="#3f6f3a" />
          <rect x={-SIDEWALK_OUTER} y={-56} width={SIDEWALK_OUTER * 2} height={112} fill="#7b838b" />
          <rect x={-ROAD_HALF} y={-56} width={ROAD_HALF * 2} height={112} fill="#a7adb3" />
          {BUILDINGS.map((b) => {
            const zone = ZONES.find((z) => z.id === b.zone);
            return (
              <rect
                key={b.id}
                x={b.x0 + 0.3}
                y={b.z0 + 0.3}
                width={b.x1 - b.x0 - 0.6}
                height={b.z1 - b.z0 - 0.6}
                fill={zone ? zone.color : "#2c343c"}
                fillOpacity={zone ? 0.45 : 1}
              />
            );
          })}
        </g>
        {ZONES.map((zone, i) => (
          <g key={zone.id} ref={(el) => { blips.current[i] = el; }}>
            <rect x={-9} y={-9} width={18} height={18} fill={zone.color} stroke="#000" strokeWidth={2.5} />
            <text y={6} textAnchor="middle" fontSize={15} fontWeight={900} fill="#000" fontFamily="Arial Black, Arial, sans-serif">
              {zone.blip}
            </text>
          </g>
        ))}
        <polygon ref={arrow} points="0,-10 7,8 0,4 -7,8" fill="#ffffff" stroke="#000" strokeWidth={2} />
      </g>
      <circle r="97" fill="none" stroke="#000" strokeWidth={4} />
      <circle r="94" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
      <g ref={north}>
        <circle r={9} fill="#0d0d0d" stroke="#fff" strokeWidth={1.5} />
        <text y={5} textAnchor="middle" fontSize={13} fontWeight={900} fill="#fff" fontFamily="Arial Black, Arial, sans-serif">
          N
        </text>
      </g>
    </svg>
  );
}
