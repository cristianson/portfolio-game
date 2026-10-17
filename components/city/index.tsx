/**
 * Design District — 3D portfolio
 *
 * Top-level component for the GTA 3 inspired version of the portfolio.
 * Wires keyboard/touch input into the shared store, owns the UI state
 * (title, panel, pause menu, visited sections) and lays out the HUD.
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { Scene } from "./scene";
import { createStore, type Phase } from "./store";
import { ZONES, type ZoneId } from "./world";
import { Radar } from "./radar";
import { AreaName, HelpBox, Key, MissionPassed, Stats, TouchControls } from "./hud";
import { ContentPanel, PauseMenu } from "./panel";
import { TitleScreen } from "./title-screen";

const VISITED_KEY = "design-district-visited";

function loadVisited(): Set<ZoneId> {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    const ids = raw ? (JSON.parse(raw) as ZoneId[]) : [];
    return new Set(ids.filter((id) => ZONES.some((z) => z.id === id)));
  } catch {
    return new Set();
  }
}

function saveVisited(visited: Set<ZoneId>) {
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]));
  } catch {
    // Private mode etc. — progress just won't persist
  }
}

function useCompactLayout() {
  const [state, setState] = useState({ compact: false, touch: false });
  useEffect(() => {
    const touchQ = window.matchMedia("(pointer: coarse)");
    const narrowQ = window.matchMedia("(max-width: 767px)");
    const update = () => setState({ touch: touchQ.matches, compact: touchQ.matches || narrowQ.matches });
    update();
    touchQ.addEventListener("change", update);
    narrowQ.addEventListener("change", update);
    return () => {
      touchQ.removeEventListener("change", update);
      narrowQ.removeEventListener("change", update);
    };
  }, []);
  return state;
}

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

// If the 3D canvas hasn't started after this much *visible* time, assume the GPU can't run it.
// Only visible time counts: background tabs don't render, so the canvas can't start there.
const STARTUP_TIMEOUT_MS = 15000;
const STARTUP_TICK_MS = 500;

export default function DesignDistrict({ onFatal }: { onFatal?: () => void }) {
  const store = useRef(createStore()).current;
  const { trigger: haptic } = useWebHaptics();
  const { compact, touch } = useCompactLayout();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready || !onFatal) return;
    let visibleMs = 0;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      visibleMs += STARTUP_TICK_MS;
      if (visibleMs >= STARTUP_TIMEOUT_MS) {
        clearInterval(id);
        onFatal();
      }
    }, STARTUP_TICK_MS);
    return () => clearInterval(id);
  }, [ready, onFatal]);
  const [phase, setPhaseState] = useState<Phase>("title");
  const [nearZone, setNearZone] = useState<ZoneId | null>(null);
  const [panelZone, setPanelZone] = useState<ZoneId | null>(null);
  const [visited, setVisited] = useState<Set<ZoneId>>(() => new Set());
  const [passed, setPassed] = useState<ZoneId | null>(null);
  const [introHelp, setIntroHelp] = useState(false);
  const [areaName, setAreaName] = useState(false);
  const passedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setVisited(loadVisited()), []);

  // `?debug` exposes the store for poking at things from the console
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __dd: typeof store }).__dd = store;
    }
  }, [store]);

  const setPhase = useCallback(
    (p: Phase) => {
      store.phase = p;
      if (p !== "play") {
        store.input.jx = store.input.jy = 0;
      }
      setPhaseState(p);
    },
    [store]
  );

  const start = useCallback(() => {
    setPhase("play");
    setIntroHelp(true);
    setAreaName(true);
    setTimeout(() => setAreaName(false), 4000);
    setTimeout(() => setIntroHelp(false), 12000);
  }, [setPhase]);

  const openZone = useCallback(
    (zone: ZoneId) => {
      setPanelZone(zone);
      setPhase("panel");
      setIntroHelp(false);
      haptic("medium");
    },
    [setPhase, haptic]
  );

  const closePanel = useCallback(() => {
    const zone = panelZone;
    setPanelZone(null);
    setPhase("play");
    if (zone && !visited.has(zone)) {
      const next = new Set(visited).add(zone);
      setVisited(next);
      saveVisited(next);
      setPassed(zone);
      haptic("success");
      clearTimeout(passedTimer.current);
      passedTimer.current = setTimeout(() => setPassed(null), 3500);
    }
  }, [panelZone, visited, setPhase, haptic]);

  const interact = useCallback(() => {
    if (store.phase === "play" && store.nearZone) openZone(store.nearZone);
  }, [store, openZone]);

  const onZoneChange = useCallback(
    (zone: ZoneId | null) => {
      setNearZone(zone);
      if (zone) haptic("selection");
    },
    [haptic]
  );

  // Keyboard
  useEffect(() => {
    const pressed = new Set<string>();
    const sync = () => {
      let x = 0;
      let y = 0;
      pressed.forEach((code) => {
        const v = MOVE_KEYS[code];
        if (v) {
          x += v[0];
          y += v[1];
        }
      });
      store.input.kx = Math.max(-1, Math.min(1, x));
      store.input.ky = Math.max(-1, Math.min(1, y));
      store.input.sprint = pressed.has("ShiftLeft") || pressed.has("ShiftRight");
    };
    const down = (e: KeyboardEvent) => {
      const isAction = e.code === "Enter" || e.code === "Space" || e.code === "KeyE";
      // Only steal arrows / space while walking; in panels and the menu they scroll and press buttons
      const steering = store.phase === "play" || store.phase === "title";
      if (steering && (MOVE_KEYS[e.code] || e.code === "Space")) e.preventDefault();
      if (store.phase === "title") {
        if (ready && (e.code === "Enter" || e.code === "Space")) start();
        return;
      }
      if (e.code === "Escape") {
        if (store.phase === "panel") closePanel();
        else if (store.phase === "menu") setPhase("play");
        else if (store.phase === "play") setPhase("menu");
        return;
      }
      if (store.phase === "play" && isAction && !e.repeat) {
        interact();
        return;
      }
      pressed.add(e.code);
      sync();
    };
    const up = (e: KeyboardEvent) => {
      pressed.delete(e.code);
      sync();
    };
    const blur = () => {
      pressed.clear();
      sync();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [store, ready, start, closePanel, interact, setPhase]);

  const near = ZONES.find((z) => z.id === nearZone);
  const playing = phase === "play";

  let help: React.ReactNode = null;
  if (playing && near) {
    help = touch ? (
      <>
        Tap <Key>ENTER</Key> to visit <span style={{ color: near.color }}>{near.label}</span>.
      </>
    ) : (
      <>
        Press <Key>ENTER</Key> to visit <span style={{ color: near.color }}>{near.label}</span>.
      </>
    );
  } else if (playing && introHelp) {
    help = (
      <>
        Explore the street. The glowing markers lead to my <span className="text-[#ff4fa3]">About Me</span>,{" "}
        <span className="text-[#ffb020]">Case Studies</span>, <span className="text-[#b36bff]">Built Projects</span> and{" "}
        <span className="text-[#3ddc84]">Socials</span>.
        <span className="block mt-1.5 text-white/70 font-medium">
          {touch ? "Use the joystick to move, drag the street to look around." : <>Use <Key>WASD</Key> or arrows to move, <Key>Shift</Key> to sprint, drag to look around.</>}
        </span>
      </>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none touch-none overscroll-none">
      <Scene store={store} onZoneChange={onZoneChange} onReady={() => setReady(true)} />

      {phase === "title" && <TitleScreen ready={ready} isTouch={touch} onStart={start} />}

      {phase !== "title" && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Top row */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-3 md:px-5 pt-[max(12px,env(safe-area-inset-top))]">
            <div>{compact ? <Radar store={store} className="w-[92px] h-[92px]" /> : <HelpBox>{help}</HelpBox>}</div>
            <button
              onClick={() => setPhase("menu")}
              className={`pointer-events-auto absolute bg-black/70 text-white font-gta text-[15px] tracking-wider px-3 py-1 border-2 border-black hover:text-[#f0b53b] ${compact ? "left-3 top-[calc(max(12px,env(safe-area-inset-top))+100px)]" : "left-1/2 -translate-x-1/2 top-[max(12px,env(safe-area-inset-top))]"}`}
            >
              {compact ? "MENU" : "ESC · MENU"}
            </button>
            <Stats visited={visited} compact={compact} />
          </div>

          {compact && help && (
            <div className="absolute left-3 right-3 top-[calc(max(12px,env(safe-area-inset-top))+140px)]">
              <HelpBox>{help}</HelpBox>
            </div>
          )}

          {!compact && <Radar store={store} className="absolute left-6 bottom-6 w-[170px] h-[170px]" />}

          <div className={`absolute ${compact ? "inset-x-0 bottom-[190px] flex justify-center" : "right-8 bottom-6"}`}>
            <AreaName show={areaName && playing} />
          </div>

          <MissionPassed zone={passed} allDone={visited.size === ZONES.length} />

          {touch && playing && <TouchControls store={store} nearZone={nearZone} onInteract={interact} />}
        </div>
      )}

      {panelZone && <ContentPanel zone={panelZone} onClose={closePanel} />}
      {phase === "menu" && (
        <PauseMenu visited={visited} isTouch={touch} onSelect={openZone} onResume={() => setPhase("play")} />
      )}
    </div>
  );
}
