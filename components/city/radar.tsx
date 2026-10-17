/**
 * Radar
 *
 * Round minimap in the corner, rotating with the camera like the classic
 * 2001-era HUD. Section blips stick to the rim when they're out of range.
 * Inside the gallery it shows the hall's floor plan instead.
 * Updated straight from the store in its own rAF loop (no React renders).
 */

"use client";

import React, { useEffect, useRef } from "react";
import { BUILDINGS, MARKER_ZONES, PARK, PICKUPS, ROAD_HALF, SIDEWALK_OUTER, STREET_LENGTH, ZONES } from "./world";
import { SOCIALS } from "./content";
import { BENCHES, EXIT, HALL, PAINTINGS } from "./museum";
import type { GameStore } from "./store";

const RANGE = 48; // meters from centre to rim
const GALLERY_RANGE = 22;
const RIM = 84;

export function Radar({ store, className = "" }: { store: GameStore; className?: string }) {
  const map = useRef<SVGGElement>(null);
  const streetMap = useRef<SVGGElement>(null);
  const galleryMap = useRef<SVGGElement>(null);
  const streetBlips = useRef<SVGGElement>(null);
  const blips = useRef<(SVGGElement | null)[]>([]);
  const pickupBlips = useRef<(SVGGElement | null)[]>([]);
  const north = useRef<SVGGElement>(null);
  const arrow = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const { x: px, z: pz, heading } = store.player;
      const yaw = store.camYaw;
      const inside = store.location === "gallery";
      const S = 100 / (inside ? GALLERY_RANGE : RANGE);
      // display, not visibility: the blips set their own visibility, which would override a hidden parent
      streetMap.current?.setAttribute("display", inside ? "none" : "inline");
      streetBlips.current?.setAttribute("display", inside ? "none" : "inline");
      galleryMap.current?.setAttribute("display", inside ? "inline" : "none");
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

      // Pickups only show up when they're within range, like the real thing
      PICKUPS.forEach((pk, i) => {
        const u = a * pk.x + c * pk.z + e;
        const v = b * pk.x + d * pk.z + f;
        const el = pickupBlips.current[i];
        if (!el) return;
        el.setAttribute("transform", `translate(${u} ${v})`);
        el.setAttribute("visibility", Math.hypot(u, v) < RIM ? "visible" : "hidden");
      });

      MARKER_ZONES.forEach((zone, i) => {
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
        {/* Classic palette: yellow city blocks, dark streets */}
        <circle r="96" fill="#5c5544" />
        <g ref={map}>
          <g ref={galleryMap} display="none">
            <rect x={-HALL.w / 2} y={-HALL.d / 2} width={HALL.w} height={HALL.d} fill="#8a3a3a" stroke="#e6b84f" strokeWidth={0.6} />
            <rect x={-1.3} y={-HALL.d / 2} width={2.6} height={HALL.d - 2} fill="#a84848" />
            {BENCHES.map((b) => (
              <rect key={b.x} x={b.x - 0.45} y={b.z - 1.2} width={0.9} height={2.4} fill="#5c2020" />
            ))}
            {PAINTINGS.map((p) => (
              <rect
                key={p.id}
                x={p.x - (p.nx ? 0.35 : p.w / 2)}
                y={p.z - (p.nz ? 0.35 : p.w / 2)}
                width={p.nx ? 0.7 : p.w}
                height={p.nz ? 0.7 : p.w}
                fill={p.project === undefined ? "#9a9a9a" : "#b36bff"}
                stroke="#000"
                strokeWidth={0.25}
              />
            ))}
            <circle cx={EXIT.x} cy={EXIT.z} r={EXIT.radius} fill="#f0b53b" stroke="#000" strokeWidth={0.25} />
          </g>
          <g ref={streetMap}>
            <rect x={-40} y={-70} width={80} height={140} fill="#e6b84f" />
            <rect x={PARK.x0} y={PARK.z0} width={PARK.x1 - PARK.x0} height={PARK.z1 - PARK.z0} fill="#9fb052" />
            <rect x={-SIDEWALK_OUTER} y={-STREET_LENGTH / 2} width={SIDEWALK_OUTER * 2} height={STREET_LENGTH} fill="#8a7d5c" />
            <rect x={-ROAD_HALF} y={-STREET_LENGTH / 2} width={ROAD_HALF * 2} height={STREET_LENGTH} fill="#5c5544" />
            {BUILDINGS.map((b) => {
              const zone = ZONES.find((z) => z.id === b.zone);
              return (
                <rect
                  key={b.id}
                  x={b.x0 + 0.3}
                  y={b.z0 + 0.3}
                  width={b.x1 - b.x0 - 0.6}
                  height={b.z1 - b.z0 - 0.6}
                  fill={zone ? zone.color : "#e6b84f"}
                  fillOpacity={zone ? 0.55 : 1}
                  stroke="#a9802e"
                  strokeWidth={0.5}
                />
              );
            })}
          </g>
        </g>
        <g ref={streetBlips}>
          {PICKUPS.map((pk, i) => (
            <g key={pk.name} ref={(el) => { pickupBlips.current[i] = el; }}>
              <circle r={6} fill={SOCIALS.find((s) => s.name === pk.name)?.color} stroke="#fff" strokeWidth={2} />
            </g>
          ))}
          {MARKER_ZONES.map((zone, i) => (
            <g key={zone.id} ref={(el) => { blips.current[i] = el; }}>
              <rect x={-9} y={-9} width={18} height={18} fill={zone.color} stroke="#000" strokeWidth={2.5} />
              <text y={6} textAnchor="middle" fontSize={15} fontWeight={900} fill="#000" fontFamily="Arial Black, Arial, sans-serif">
                {zone.blip}
              </text>
            </g>
          ))}
        </g>
        <polygon ref={arrow} points="0,-11 7,7 0,3 -7,7" fill="#ffffff" stroke="#000" strokeWidth={2} />
      </g>
      <circle r="96" fill="none" stroke="#000" strokeWidth={7} />
      <g ref={north}>
        <circle r={10} fill="#0d0d0d" />
        <text y={5} textAnchor="middle" fontSize={13} fontWeight={900} fill="#fff" fontFamily="Arial Black, Arial, sans-serif">
          N
        </text>
      </g>
    </svg>
  );
}
