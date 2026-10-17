/**
 * HUD
 *
 * The on-screen overlay while playing: stats block (clock, cash, health,
 * "hiring level" stars), the black help box, the area name, the
 * MISSION PASSED splash and the touch controls.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Joystick } from "./joystick";
import { ZONES, type ZoneId } from "./world";
import type { GameStore } from "./store";

export const CASH_PER_SECTION = 250;

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

function useGameClock() {
  // One in-game minute per real second, starting mid-morning
  const [minutes, setMinutes] = useState(10 * 60 + 24);
  useEffect(() => {
    const id = setInterval(() => setMinutes((m) => (m + 1) % (24 * 60)), 1000);
    return () => clearInterval(id);
  }, []);
  return `${pad(Math.floor(minutes / 60), 2)}:${pad(minutes % 60, 2)}`;
}

function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const diff = target - current.current;
      if (Math.abs(diff) < 1) {
        current.current = target;
        setValue(target);
        return;
      }
      current.current += Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.08);
      setValue(Math.round(current.current));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

/** Classic top-right block: clock, cash, health, stars and the "weapon" slot (your face). */
export function Stats({ visited, compact }: { visited: Set<ZoneId>; compact: boolean }) {
  const clock = useGameClock();
  const cash = useCountUp(visited.size * CASH_PER_SECTION);
  const big = compact ? "text-[24px]" : "text-[34px]";
  return (
    <div className="flex items-start gap-2 md:gap-3">
      <div className="flex flex-col items-end leading-[0.95] font-hud gta-stroke tracking-[0.04em]">
        <span className={`${big} text-[#dcc58e]`}>{clock}</span>
        <span className={`${big} text-[#8db6e4]`}>${pad(cash, 8)}</span>
        <span className={`${compact ? "text-[20px]" : "text-[28px]"} text-[#e9a04e] flex items-center gap-1`}>
          <svg viewBox="0 0 24 24" className={compact ? "w-[18px] h-[18px]" : "w-6 h-6"} aria-hidden>
            <path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.9 3.8 4.3 7.3C19.5 16.4 12 21 12 21z" fill="currentColor" stroke="#000" strokeWidth="1.8" />
          </svg>
          100
        </span>
        <span className="flex gap-0.5 mt-1" aria-label={`${visited.size} of ${ZONES.length} sections visited`}>
          {ZONES.map((z, i) => (
            <svg key={z.id} viewBox="0 0 24 24" className={compact ? "w-[18px] h-[18px]" : "w-6 h-6"} aria-hidden>
              {/* Sheriff badge star */}
              <path
                d="M12 1.5l2.6 5 5.6-.9-2.2 5.3 3.6 4.1-5.5 1.1-.6 5.6L12 18.6l-3.5 3.1-.6-5.6-5.5-1.1 3.6-4.1-2.2-5.3 5.6.9z"
                fill={i < visited.size ? "#f2c94c" : "#141414"}
                stroke={i < visited.size ? "#000" : "#5a5a5a"}
                strokeWidth="1.4"
              />
            </svg>
          ))}
        </span>
      </div>
      <div
        className={`${compact ? "w-[58px] h-[58px]" : "w-[92px] h-[92px]"} shrink-0 rounded-[6px] border-[3px] border-black bg-[#f2c418] p-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.45)]`}
      >
        <Image
          src="/avatar-128.webp"
          unoptimized
          alt=""
          width={92}
          height={92}
          className="w-full h-full object-cover rounded-[3px] grayscale-[0.2] contrast-[1.05]"
        />
      </div>
    </div>
  );
}

export function HelpBox({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="bg-black/75 text-white px-4 py-3 max-w-sm text-[13px] md:text-[15px] leading-snug font-sans font-semibold shadow-lg animate-in fade-in duration-200">
      {children}
    </div>
  );
}

export function Key({ children }: { children: React.ReactNode }) {
  return <span className="inline-block px-1.5 mx-0.5 bg-white text-black rounded-sm text-[0.85em] font-bold">{children}</span>;
}

export function AreaName({ show }: { show: boolean }) {
  return (
    <div
      className={`font-gta gta-stroke text-[34px] md:text-[52px] text-[#e9e2c8] transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`}
    >
      Design District
    </div>
  );
}

export function MissionPassed({ zone, allDone }: { zone: ZoneId | null; allDone: boolean }) {
  if (!zone) return null;
  const label = ZONES.find((z) => z.id === zone)?.label;
  return (
    <div className="absolute inset-x-0 top-[22%] flex flex-col items-center text-center pointer-events-none animate-in zoom-in-95 fade-in duration-300 px-4">
      <div className="font-gta gta-stroke text-[40px] md:text-[64px] text-[#f0b53b] leading-none">MISSION PASSED!</div>
      <div className="font-gta gta-stroke text-[26px] md:text-[36px] text-white mt-2">${CASH_PER_SECTION}</div>
      <div className="font-gta gta-stroke text-[18px] md:text-[22px] text-[#e9e2c8] mt-1">
        {allDone ? "All sections found. Thanks for visiting!" : `${label} unlocked`}
      </div>
    </div>
  );
}

interface TouchControlsProps {
  store: GameStore;
  nearZone: ZoneId | null;
  onInteract: () => void;
}

export function TouchControls({ store, nearZone, onInteract }: TouchControlsProps) {
  const zone = ZONES.find((z) => z.id === nearZone);
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-[max(24px,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto">
        <Joystick
          onMove={(x, y) => {
            store.input.jx = x;
            store.input.jy = -y;
          }}
          onStop={() => {
            store.input.jx = 0;
            store.input.jy = 0;
          }}
        />
      </div>
      {zone && (
        <button
          onClick={onInteract}
          className="pointer-events-auto w-24 h-24 rounded-full border-4 border-black font-gta text-[22px] text-black shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-in zoom-in-50 duration-200 active:scale-95 transition-transform"
          style={{ background: zone.color }}
        >
          ENTER
        </button>
      )}
    </div>
  );
}
