/**
 * Player Component
 *
 * This component renders the player character. It handles the sprite rendering,
 * animations (walking legs, swinging arms), and direction facing (flipping the sprite).
 * It receives position via props but is designed to work with direct DOM updates for performance.
 */

import React, { forwardRef } from "react";
import { Direction } from "./types";
import { PLAYER_SIZE } from "./constants";

interface PlayerProps {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
}

export const Player = forwardRef<HTMLDivElement, PlayerProps>(
  ({ x, y, direction, isMoving }, ref) => {
    return (
      <div
        ref={ref}
        className="absolute z-10 flex flex-col items-center will-change-transform"
        style={{
          left: 0, // Position will be handled via ref directly for performance, but we need initial render or declarative backup if we want.
          // actually, the original code updated style.left/top directly on the ref.
          // But for the initial render, or if we switch to React state for position (which we aren't, we are using ref),
          // we might want to pass style. However, in the original code:
          // playerRef.current.style.left = `${x - PLAYER_SIZE / 2}px`;
          // The parent component handles the positioning via ref.
          // So this component just renders the inner sprite.
          // WAIT. The original code had the `ref` on the wrapper div and updated it manually.
          // If I extract this component, I need to pass the ref down.
          // And the parent (index.tsx) will update the style.
          // SO `x` and `y` props might strictly not be needed for the DOM update if the parent does it directly.
          // BUT, for the React render cycle (like direction changes), we need to render.
          // The parent `updateGame` loop modifies `playerRef.current.style`.
          // So I should stick to that pattern.
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
        }}
      >
        {/* Name Tag */}
        <div className="absolute -top-12 bg-black/50 px-2 py-0.5 rounded text-[8px] text-white whitespace-nowrap z-20">
          Player 1
        </div>

        {/* Character Sprite - Pixel Human with Santa Hat */}
        <div
          className={`w-full h-full relative transition-transform duration-150 ${
            direction === "LEFT" ? "scale-x-[-1]" : ""
          }`}
        >
          {/* Santa Hat */}
          <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-10 h-8 z-30">
            {/* Pom-pom - Centered on top */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white pixel-border-sm rounded-full z-40"></div>
            {/* Red Hat Body */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-red-600 pixel-border-sm rounded-t-full"></div>
            {/* White Trim */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-white pixel-border-sm"></div>
          </div>

          {/* Head */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-6 z-20">
            {/* Hair */}
            <div className="absolute top-0 left-0 w-full h-2.5 bg-amber-800 pixel-border-sm"></div>
            <div className="absolute top-2 -left-0.5 w-1 h-4 bg-amber-800"></div>
            <div className="absolute top-2 -right-0.5 w-1 h-4 bg-amber-800"></div>

            {/* Face */}
            <div className="absolute top-2.5 left-0 w-full h-3.5 bg-orange-200 pixel-border-sm">
              {/* Eyes */}
              <div className="absolute top-1 left-2 w-1 h-1 bg-black"></div>
              <div className="absolute top-1 right-2 w-1 h-1 bg-black"></div>
              {/* Blush */}
              <div className="absolute top-2.5 left-1.5 w-1 h-0.5 bg-pink-300/50"></div>
              <div className="absolute top-2.5 right-1.5 w-1 h-0.5 bg-pink-300/50"></div>
            </div>
          </div>

          {/* Body (Torso) */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-7 h-8 bg-blue-600 z-10 pixel-border-sm">
            {/* Shirt Details */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-blue-400"></div>
          </div>

          {/* Arms */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-11 h-7 z-15 pointer-events-none">
            {/* Left Arm */}
            <div
              className={`absolute left-[-4px] top-0 w-2 h-7 bg-blue-700 origin-top transition-transform ${
                isMoving ? "rotate-12 translate-y-[-1px]" : ""
              }`}
            >
              <div className="absolute bottom-0 w-full h-2 bg-orange-200 border-t border-black/10"></div>
            </div>
            {/* Right Arm */}
            <div
              className={`absolute right-[-4px] top-0 w-2 h-7 bg-blue-700 origin-top transition-transform ${
                isMoving ? "-rotate-12 translate-y-[-1px]" : ""
              }`}
            >
              <div className="absolute bottom-0 w-full h-2 bg-orange-200 border-t border-black/10"></div>
            </div>
          </div>

          {/* Legs */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-7 h-6 z-0">
            {/* Left Leg */}
            <div
              className={`absolute left-0.5 top-0 w-2.5 h-full bg-white origin-top transition-all duration-150 ${
                isMoving ? "h-[80%] translate-y-[-1px]" : "h-full"
              }`}
            ></div>
            {/* Right Leg */}
            <div
              className={`absolute right-0.5 top-0 w-2.5 h-full bg-white origin-top transition-all duration-150 delay-75 ${
                isMoving ? "h-full" : "h-full"
              }`}
            ></div>
          </div>
        </div>
      </div>
    );
  }
);

Player.displayName = "Player";
