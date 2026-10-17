/**
 * Content Panel & Pause Menu
 *
 * The panel shows a section's content (the same ZONE_CONTENT used by the 2D
 * version) inside a GTA-style frame. The pause menu is a quick way to jump to
 * any section without walking there.
 */

"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ZONE_CONTENT } from "@/components/game/data";
import { ZONES, type ZoneId } from "./world";

export function ContentPanel({ zone, onClose }: { zone: ZoneId; onClose: () => void }) {
  const data = ZONE_CONTENT[zone];
  const def = ZONES.find((z) => z.id === zone)!;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 md:p-6 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={data.content.title}
        className="gta-panel w-full h-full md:h-auto md:max-h-[86vh] md:max-w-3xl flex flex-col bg-[#f3efe4] text-black shadow-2xl md:border-4 md:border-black animate-in zoom-in-95 duration-200"
      >
        <div className="bg-[#0d0d0d] px-5 pt-[max(16px,env(safe-area-inset-top))] pb-4 flex items-center justify-between gap-4 shrink-0" style={{ borderBottom: `6px solid ${def.color}` }}>
          <div>
            <div className="font-gta text-[13px] tracking-[0.2em] text-white/60">DESIGN DISTRICT</div>
            <h2 className="font-gta gta-stroke text-[34px] md:text-[46px] leading-none" style={{ color: def.color }}>
              {data.content.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 shrink-0 flex items-center justify-center bg-white text-black border-[3px] border-black hover:bg-[#f0b53b] transition-colors"
          >
            <X size={22} strokeWidth={3} />
          </button>
        </div>
        <div className="p-5 md:p-8 overflow-y-auto flex-1 pb-[max(20px,env(safe-area-inset-bottom))]">{data.content.body}</div>
        <div className="hidden md:block bg-[#0d0d0d] text-white/70 px-5 py-2 text-right font-gta tracking-wider text-[15px] shrink-0">
          ESC — BACK TO THE STREET
        </div>
      </div>
    </div>
  );
}

interface PauseMenuProps {
  visited: Set<ZoneId>;
  onSelect: (zone: ZoneId) => void;
  onResume: () => void;
  isTouch: boolean;
}

export function PauseMenu({ visited, onSelect, onResume, isTouch }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center px-6 animate-in fade-in duration-200">
      <h2 className="font-gta gta-stroke text-[56px] md:text-[80px] text-[#f0b53b] leading-none mb-8">PAUSED</h2>
      <nav className="flex flex-col items-stretch gap-2 w-full max-w-xs">
        {ZONES.map((z) => (
          <button
            key={z.id}
            onClick={() => onSelect(z.id)}
            className="group flex items-center justify-between gap-3 px-4 py-2 font-gta text-[26px] text-white hover:bg-white/10 focus-visible:bg-white/10 outline-none text-left"
          >
            <span className="flex items-center gap-3">
              <span className="w-6 h-6 border-2 border-black text-[14px] leading-[20px] text-center text-black" style={{ background: z.color }}>
                {z.blip}
              </span>
              <span className="group-hover:text-[#f0b53b]">{z.label}</span>
            </span>
            {visited.has(z.id) && <span className="text-[#7fc76b] text-[20px]">✓</span>}
          </button>
        ))}
        <div className="h-px bg-white/20 my-3" />
        <button onClick={onResume} className="px-4 py-2 font-gta text-[26px] text-[#f0b53b] hover:text-white text-left">
          Resume
        </button>
        <Link href="/" className="px-4 py-2 font-gta text-[20px] text-white/60 hover:text-white">
          Classic 2D version
        </Link>
      </nav>
      <p className="mt-8 text-white/50 text-[13px] font-sans text-center max-w-xs">
        {isTouch
          ? "Joystick to move · drag the street to look around · ENTER near a marker"
          : "WASD / arrows to move · Shift to sprint · drag to look around · Enter near a marker · Esc for this menu"}
      </p>
    </div>
  );
}
