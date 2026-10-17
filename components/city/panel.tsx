/**
 * Content Panel & Pause Menu
 *
 * The panel frames a section page (see sections.tsx) in a dark GTA-style
 * window. The pause menu is a quick way to jump to any section without
 * walking there.
 */

"use client";

import React from "react";
import { X } from "lucide-react";
import { SECTION_SUBTITLE, SectionPage } from "./sections";
import { ZONES, type ZoneId } from "./world";

export function ContentPanel({ zone, onClose }: { zone: ZoneId; onClose: () => void }) {
  const def = ZONES.find((z) => z.id === zone)!;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-[2px] md:p-6 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={def.label}
        className="relative w-full h-full md:h-[88vh] md:max-w-4xl flex flex-col bg-[#111111] text-[#ece7dd] font-sans shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:border md:border-white/10 animate-in slide-in-from-bottom-4 fade-in duration-300"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 px-5 md:px-8 pt-[max(14px,env(safe-area-inset-top))] pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-7 h-7 shrink-0 border-2 border-black font-gta text-[15px] leading-[24px] text-center text-black" style={{ background: def.color }}>
              {def.blip}
            </span>
            <span className="font-gta text-[14px] tracking-[0.22em] text-[#8f8a80] truncate">
              DESIGN DISTRICT <span className="text-white/25">/</span> <span className="text-white/80">{def.label.toUpperCase()}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full border border-white/20 text-white hover:text-black hover:bg-[var(--accent)] transition-colors"
            style={{ ["--accent" as string]: def.color }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Title */}
          <header className="px-5 md:px-10 pt-8 md:pt-10 pb-6">
            <h2 className="font-gta gta-stroke-lg text-[52px] md:text-[84px] leading-[0.9] uppercase" style={{ color: def.color }}>
              {def.label}
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-1 w-12" style={{ background: def.color }} />
              <span className="text-[15px] md:text-[16px] text-[#a8a297]">{SECTION_SUBTITLE[zone]}</span>
            </div>
          </header>
          <div className="px-5 md:px-10 pb-[max(32px,env(safe-area-inset-bottom))]">
            <SectionPage zone={zone} accent={def.color} />
          </div>
        </div>

        <div className="hidden md:flex justify-between items-center bg-black/40 border-t border-white/10 text-white/50 px-8 py-2.5 font-gta tracking-[0.18em] text-[13px] shrink-0">
          <span>CRISTIAN IORDAN · PRODUCT DESIGNER</span>
          <span>ESC — BACK TO THE STREET</span>
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
      </nav>
      <p className="mt-8 text-white/50 text-[13px] font-sans text-center max-w-xs">
        {isTouch
          ? "Joystick to move · drag the street to look around · ENTER near a marker"
          : "WASD / arrows to move · Shift to sprint · drag to look around · Enter near a marker · Esc for this menu"}
      </p>
    </div>
  );
}
