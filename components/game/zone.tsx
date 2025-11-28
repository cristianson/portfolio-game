/**
 * Zone Component
 *
 * This component renders the interactive areas on the map. It visualizes the pedestal,
 * the floating icon above it, and the interaction ring on the floor. It also handles
 * visual feedback when a player is within range (isActive).
 */

import React from "react";
import { InteractionType, ZoneConfig } from "./types";
import { ZONE_CONTENT } from "./data";

interface ZoneProps {
  zone: ZoneConfig;
  isActive: boolean;
}

export const Zone = ({ zone, isActive }: ZoneProps) => {
  const data = ZONE_CONTENT[zone.id as keyof typeof ZONE_CONTENT];

  return (
    <div
      className="absolute flex flex-col items-center justify-center pointer-events-none"
      style={{
        left: zone.x - 40,
        top: zone.y - 40,
        width: 80,
        height: 80,
      }}
    >
      {/* Interaction Indicator - Floor Reticle */}
      {isActive && (
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[100px] h-[100px]">
          {/* Rotating Brackets */}
          <div className="absolute inset-0 animate-spin-slow">
            {/* Top Left */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white/50" />
            {/* Top Right */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white/50" />
            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white/50" />
            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white/50" />
          </div>

          {/* Pulse Circle */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-full animate-pulse-glow" />
        </div>
      )}

      {/* 3D Pixel Pedestal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Floating Icon */}
        <div
          className={`relative z-20 mb-[-16px] transition-transform duration-300 ${
            isActive ? "scale-110 animate-float" : "scale-100 animate-float"
          }`}
          style={{
            animationDuration: isActive ? "2s" : "3s",
          }}
        >
          {/* Icon Container */}
          <div
            className={`w-16 h-16 ${data.color} pixel-border flex items-center justify-center text-2xl relative overflow-hidden group`}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-full group-hover:animate-shine" />
            <div className="relative z-10 drop-shadow-md">{data.icon}</div>
          </div>

          {/* Active Arrow Indicator */}
          {isActive && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce font-bold text-lg drop-shadow-md">
              ▼
            </div>
          )}
        </div>

        {/* Pedestal Base */}
        <div className="relative z-10 w-12 h-4 bg-zinc-800 border-t-4 border-zinc-700 shadow-lg">
          {/* Side Shading */}
          <div className="absolute top-0 right-0 w-2 h-full bg-zinc-900/50" />
          {/* Glow Strip */}
          <div
            className={`absolute top-1 left-1 right-1 h-1 ${data.color.replace(
              "bg-",
              "bg-"
            )}/50 animate-pulse`}
          />
        </div>

        {/* Ground Shadow */}
        <div className="absolute bottom-[-4px] w-16 h-2 bg-black/40 rounded-[50%] blur-[2px]" />
      </div>

      {/* Label Tooltip */}
      <div
        className={`absolute -bottom-8 transition-all duration-300 ${
          isActive ? "opacity-100 translate-y-1" : "opacity-90 translate-y-1"
        }`}
      >
        <div className="bg-black/80 text-white px-3 py-1 text-[10px] pixel-border-sm backdrop-blur-sm whitespace-nowrap">
          {data.label}
        </div>
      </div>
    </div>
  );
};
