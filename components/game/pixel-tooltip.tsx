/**
 * Pixel Tooltip
 *
 * A reusable UI component for displaying retro-styled tooltips or floating labels.
 * Used for "Press Space to Interact" prompts and zone labels.
 */

import React from "react";

interface PixelTooltipProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  arrow?: "none" | "right" | "bottom";
  arrowPosition?: string; // Tailwind classes for arrow positioning (e.g. "left-9")
  animate?: "bounce" | "slide-horizontal";
}

export const PixelTooltip = ({
  children,
  className = "",
  onClick,
  arrow = "none",
  arrowPosition = "",
  animate = "bounce",
}: PixelTooltipProps) => {
  const BaseTag = onClick ? "button" : "div";
  const interactiveClasses = onClick
    ? "hover:bg-yellow-300 active:bg-yellow-500 transition-colors"
    : "";

  const animationClass =
    animate === "slide-horizontal" ? "animate-pulse-horizontal" : "animate-bounce";

  return (
    <div
      className={`absolute ${animationClass} pointer-events-auto z-40 ${className}`}
    >
      <BaseTag
        onClick={onClick}
        className={`bg-yellow-400 text-black font-bold pixel-border flex items-center gap-2 shadow-lg whitespace-nowrap ${interactiveClasses}`}
      >
        {children}
        {arrow === "right" && (
          <svg
            className={`absolute top-1/2 -translate-y-1/2 -right-3 w-4 h-4 text-yellow-400 fill-current -rotate-90 ${arrowPosition}`}
            viewBox="0 0 24 24"
          >
            <path d="M0 0 L12 12 L24 0 Z" />
          </svg>
        )}
        {arrow === "bottom" && (
          <svg
            className={`absolute -bottom-3 w-4 h-4 text-yellow-400 fill-current ${arrowPosition}`}
            viewBox="0 0 24 24"
          >
            <path d="M0 0 L12 12 L24 0 Z" />
          </svg>
        )}
      </BaseTag>
    </div>
  );
};
