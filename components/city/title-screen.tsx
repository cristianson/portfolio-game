/**
 * Title Screen
 *
 * Cinematic letterbox over a slow fly-through of the street, with the name
 * card and a blinking "press start".
 */

"use client";

import React from "react";

interface TitleScreenProps {
  ready: boolean;
  isTouch: boolean;
  onStart: () => void;
}

export function TitleScreen({ ready, isTouch, onStart }: TitleScreenProps) {
  return (
    <button
      type="button"
      onClick={() => ready && onStart()}
      className="absolute inset-0 z-30 flex flex-col text-left cursor-pointer select-none"
      aria-label="Start game"
    >
      <div className="h-[12vh] bg-black w-full shrink-0" />
      <div className="flex-1 w-full relative bg-gradient-to-b from-black/10 via-transparent to-black/60">
        <div className="absolute left-0 right-0 bottom-[8%] px-6 md:px-16">
          <div className="font-gta text-[14px] md:text-[18px] tracking-[0.35em] text-[#e9e2c8] gta-stroke mb-2">
            WELCOME TO DESIGN DISTRICT
          </div>
          <h1 className="font-gta gta-stroke-lg text-white leading-[0.85] text-[64px] sm:text-[88px] md:text-[128px]">
            CRISTIAN
            <br />
            IORDAN
          </h1>
          <div className="inline-block mt-4 bg-[#ff4fa3] border-[3px] border-black px-3 py-1 font-gta text-[20px] md:text-[28px] text-black">
            PRODUCT DESIGNER
          </div>
        </div>
      </div>
      <div className="h-[12vh] bg-black w-full shrink-0 flex items-center justify-center pb-[env(safe-area-inset-bottom)]">
        <span className={`font-gta text-[20px] md:text-[26px] tracking-[0.2em] text-[#f0b53b] ${ready ? "animate-pulse" : "opacity-60"}`}>
          {ready ? (isTouch ? "TAP TO START" : "PRESS ENTER TO START") : "LOADING..."}
        </span>
      </div>
    </button>
  );
}
