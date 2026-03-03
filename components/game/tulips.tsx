/**
 * Tulips Component - Spring Effect
 *
 * Renders pixel-art tulips that appear randomly across the map.
 * Each tulip has a random color, position, and animation timing.
 * Design inspired by classic pixel-art heart-shaped tulips.
 */

import React from "react";

interface Tulip {
  id: number;
  x: number; // Position in pixels (absolute in game world)
  y: number; // Position in pixels (absolute in game world)
  color: "red" | "pink" | "yellow" | "purple";
  swaySpeed: number; // Sway animation duration
  growDelay: number; // Delay before growing in
}

const TULIP_COLORS = {
  red: { main: "#ef4444", dark: "#dc2626", shadow: "#b91c1c" },
  pink: { main: "#ec4899", dark: "#db2777", shadow: "#be185d" },
  yellow: { main: "#facc15", dark: "#eab308", shadow: "#ca8a04" },
  purple: { main: "#a855f7", dark: "#9333ea", shadow: "#7e22ce" },
};

export function Tulips({ tulips }: { tulips: Tulip[] }) {
  return (
    <>
      {tulips.map((tulip) => {
        const colors = TULIP_COLORS[tulip.color];
        return (
          <div
            key={tulip.id}
            className="absolute animate-grow"
            style={{
              left: `${tulip.x}px`,
              top: `${tulip.y}px`,
              animationDelay: `${tulip.growDelay}s`,
            }}
          >
            {/* Tulip Container with Sway */}
            <div
              className="relative animate-sway"
              style={{
                animationDuration: `${tulip.swaySpeed}s`,
                animationDelay: `${tulip.growDelay}s`,
                width: "32px",
                height: "48px",
              }}
            >
              {/* Pixel-Art Tulip Flower - Heart/Tulip Shape */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                {/* Row 1 - Top bumps of heart */}
                <div className="flex" style={{ height: "4px" }}>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div style={{ width: "4px" }}></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                </div>

                {/* Row 2 */}
                <div className="flex" style={{ height: "4px" }}>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                </div>

                {/* Row 3 */}
                <div className="flex" style={{ height: "4px" }}>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                </div>

                {/* Row 4 */}
                <div className="flex" style={{ height: "4px" }}>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                </div>

                {/* Row 5 - Middle */}
                <div className="flex" style={{ height: "4px" }}>
                  <div style={{ width: "4px" }}></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.main }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div style={{ width: "4px" }}></div>
                </div>

                {/* Row 6 - Bottom point */}
                <div className="flex" style={{ height: "4px" }}>
                  <div style={{ width: "4px" }}></div>
                  <div style={{ width: "4px" }}></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.dark }}
                  ></div>
                  <div style={{ width: "4px" }}></div>
                  <div style={{ width: "4px" }}></div>
                </div>

                {/* Row 7 - Tip */}
                <div className="flex" style={{ height: "4px" }}>
                  <div style={{ width: "4px" }}></div>
                  <div style={{ width: "4px" }}></div>
                  <div style={{ width: "4px" }}></div>
                  <div
                    style={{ width: "4px", backgroundColor: colors.shadow }}
                  ></div>
                  <div style={{ width: "4px" }}></div>
                  <div style={{ width: "4px" }}></div>
                  <div style={{ width: "4px" }}></div>
                </div>
              </div>

              {/* Stem - Classic pixel art green vertical line */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: "4px",
                  height: "20px",
                  backgroundColor: "#15803d",
                  top: "28px",
                }}
              ></div>

              {/* Leaves - Pixel art style */}
              <div className="absolute" style={{ top: "34px", left: "4px" }}>
                {/* Left Leaf */}
                <div className="flex flex-col">
                  <div className="flex">
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#16a34a",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#16a34a",
                      }}
                    ></div>
                  </div>
                  <div className="flex">
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#16a34a",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#15803d",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#15803d",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="absolute" style={{ top: "34px", right: "4px" }}>
                {/* Right Leaf */}
                <div className="flex flex-col">
                  <div className="flex">
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#16a34a",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#16a34a",
                      }}
                    ></div>
                  </div>
                  <div className="flex">
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#15803d",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#15803d",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        backgroundColor: "#16a34a",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
