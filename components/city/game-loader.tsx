/**
 * Game Loader
 *
 * Decides whether the 3D game can run. With WebGL it mounts the game and
 * takes the static portfolio out of the tab order; without WebGL, or if the
 * game crashes or never finishes starting, it switches the page to the static
 * portfolio instead (html[data-fallback], styled in city.css).
 */

"use client";

import React, { Component, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// three.js needs the browser, so the game itself is client-only
const DesignDistrict = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />,
});

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    // Free the probe context right away; browsers cap how many can be alive
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

class GameErrorBoundary extends Component<{ onError: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Design District crashed, showing the text version", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type Mode = "checking" | "game" | "fallback";

export function GameLoader() {
  const [mode, setMode] = useState<Mode>("checking");
  const fallback = useCallback(() => setMode("fallback"), []);

  useEffect(() => {
    setMode(hasWebGL() ? "game" : "fallback");
  }, []);

  useEffect(() => {
    const portfolio = document.getElementById("static-portfolio");
    if (mode === "fallback") {
      document.documentElement.setAttribute("data-fallback", "");
      portfolio?.removeAttribute("inert");
    } else if (mode === "game") {
      // Hidden copy stays readable for crawlers, but keyboard focus shouldn't land in it
      portfolio?.setAttribute("inert", "");
    }
  }, [mode]);

  if (mode === "fallback") return null;
  return (
    <div className="game-root">
      {mode === "checking" ? (
        <div className="fixed inset-0 bg-black" />
      ) : (
        <GameErrorBoundary onError={fallback}>
          <DesignDistrict onFatal={fallback} />
        </GameErrorBoundary>
      )}
    </div>
  );
}
