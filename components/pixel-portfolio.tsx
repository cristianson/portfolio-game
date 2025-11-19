"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Gamepad2,
} from "lucide-react";
import { Joystick } from "./joystick";

// Types
type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "IDLE";
type InteractionType = "ABOUT" | "PROJECTS" | "CASE_STUDIES" | null;

interface GameState {
  direction: Direction;
  isMoving: boolean;
}

// Constants
const PLAYER_SIZE = 48;
const PLAYER_SPEED = 4;
const INTERACTION_DISTANCE = 80;
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;

// Mock Data
const ZONES = [
  {
    id: "ABOUT",
    x: 200,
    y: 200,
    label: "About Me",
    color: "bg-blue-500",
    icon: "👤",
    content: {
      title: "About Me",
      body: (
        <div className="space-y-4">
          <p>
            Hi! I'm a Product Designer passionate about creating intuitive and
            engaging digital experiences.
          </p>
          <p>
            With a background in both UX research and UI design, I bridge the
            gap between user needs and business goals.
          </p>
          <p>
            When I'm not designing, I'm probably playing retro RPGs or pixel art
            games!
          </p>
          <div className="mt-4 p-4 bg-zinc-800 text-green-400 text-xs font-mono">
            <p>SKILLS:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Figma & Prototyping</li>
              <li>User Research</li>
              <li>Design Systems</li>
              <li>HTML/CSS/React</li>
            </ul>
          </div>
        </div>
      ),
    },
  },
  {
    id: "PROJECTS",
    x: 900,
    y: 250,
    label: "Projects",
    color: "bg-purple-500",
    icon: "💻",
    content: {
      title: "Built Projects",
      body: (
        <div className="grid gap-6">
          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-lg mb-2 font-bold">E-Commerce Redesign</h3>
            <p className="text-xs mb-2">UX/UI Design • 2024</p>
            <p className="text-sm">
              A complete overhaul of a fashion retailer's mobile checkout flow,
              resulting in a 15% increase in conversion.
            </p>
          </div>
          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-lg mb-2 font-bold">Finance Dashboard</h3>
            <p className="text-xs mb-2">Product Design • 2023</p>
            <p className="text-sm">
              Designed a complex data visualization tool for fintech analysts to
              track market trends in real-time.
            </p>
          </div>
        </div>
      ),
    },
  },
  {
    id: "CASE_STUDIES",
    x: 550,
    y: 600,
    label: "Case Studies",
    color: "bg-orange-500",
    icon: "📚",
    content: {
      title: "Case Studies",
      body: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg text-orange-500 mb-2">
              The User Journey of "App X"
            </h3>
            <p className="text-sm leading-relaxed">
              An in-depth look at how we solved the retention problem for a
              social media startup through gamification and improved onboarding
              flows.
            </p>
            <button className="mt-2 text-xs underline hover:text-orange-400">
              Read full study &gt;
            </button>
          </div>
          <hr className="border-zinc-700" />
          <div>
            <h3 className="text-lg text-orange-500 mb-2">
              Accessibility First
            </h3>
            <p className="text-sm leading-relaxed">
              How implementing WCAG 2.1 standards from day one improved the
              overall usability for all users, not just those with disabilities.
            </p>
            <button className="mt-2 text-xs underline hover:text-orange-400">
              Read full study &gt;
            </button>
          </div>
        </div>
      ),
    },
  },
];

export default function PixelPortfolio() {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    direction: "IDLE",
    isMoving: false,
  });

  const [activeZone, setActiveZone] = useState<InteractionType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Refs for loop
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const playerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const playerPosRef = useRef({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const joystickRef = useRef({ x: 0, y: 0 });

  // Initialize viewport
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        return;
      }

      if (isModalOpen) return;
      if (e.code === "Space" && activeZone) {
        e.preventDefault(); // Prevent page scroll
        setIsModalOpen(true);
        return;
      }
      keysPressed.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isModalOpen, activeZone]);

  // Game Loop
  const updateGame = useCallback(() => {
    if (isModalOpen) return;

    let { x, y } = playerPosRef.current;
    let moving = false;
    let dx = 0;
    let dy = 0;

    // Keyboard Controls
    const keys = keysPressed.current;
    const keyDx =
      (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) -
      (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
    const keyDy =
      (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) -
      (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);

    // Joystick Controls
    const joyDx = joystickRef.current.x;
    const joyDy = joystickRef.current.y;

    // Combine inputs (Keyboard takes priority if pressed, otherwise Joystick)
    if (keyDx !== 0 || keyDy !== 0) {
      dx = keyDx;
      dy = keyDy;
    } else if (joyDx !== 0 || joyDy !== 0) {
      dx = joyDx;
      dy = joyDy;
    }

    if (dx !== 0 || dy !== 0) {
      moving = true;

      // Normalize vector if length > 1 (to prevent faster diagonal movement)
      // For joystick, it's already normalized 0-1, but keyboard needs it
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 1) {
        dx = dx / length;
        dy = dy / length;
      }

      x += dx * PLAYER_SPEED;
      y += dy * PLAYER_SPEED;
    }

    // Boundary checks
    x = Math.max(PLAYER_SIZE / 2, Math.min(MAP_WIDTH - PLAYER_SIZE / 2, x));
    y = Math.max(PLAYER_SIZE / 2, Math.min(MAP_HEIGHT - PLAYER_SIZE / 2, y));

    // Update Ref
    playerPosRef.current = { x, y };

    if (playerRef.current) {
      playerRef.current.style.left = `${x - PLAYER_SIZE / 2}px`;
      playerRef.current.style.top = `${y - PLAYER_SIZE / 2}px`;
    }

    // Camera Logic - Direct DOM update
    if (mapRef.current && viewportSize.width > 0) {
      const cameraX = Math.max(
        0,
        Math.min(MAP_WIDTH - viewportSize.width, x - viewportSize.width / 2)
      );
      const cameraY = Math.max(
        0,
        Math.min(MAP_HEIGHT - viewportSize.height, y - viewportSize.height / 2)
      );
      mapRef.current.style.transform = `translate3d(${-cameraX}px, ${-cameraY}px, 0)`;
    }

    // State Updates (Only when changed)
    // 1. Direction & Movement State
    let newDirection = gameState.direction;
    if (moving) {
      if (Math.abs(dy) > Math.abs(dx)) {
        newDirection = dy > 0 ? "DOWN" : "UP";
      } else {
        newDirection = dx > 0 ? "RIGHT" : "LEFT";
      }
    }

    setGameState((prev) => {
      if (prev.direction !== newDirection || prev.isMoving !== moving) {
        return { direction: newDirection, isMoving: moving };
      }
      return prev;
    });

    // 2. Zone Interaction
    let nearestZone: InteractionType = null;

    // Optimization: Only check zones if we moved or every N frames (but every frame is fine for 3 zones)
    for (const zone of ZONES) {
      const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
      if (dist < INTERACTION_DISTANCE) {
        nearestZone = zone.id as InteractionType;
        break; // Assume only one zone active at a time
      }
    }

    if (nearestZone !== activeZone) {
      setActiveZone(nearestZone);
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [activeZone, isModalOpen, viewportSize, gameState.direction]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateGame]);

  // Joystick Handler
  const handleJoystickMove = useCallback(
    (x: number, y: number) => {
      if (isModalOpen) return;
      joystickRef.current = { x, y };
    },
    [isModalOpen]
  );

  const handleJoystickStop = useCallback(() => {
    joystickRef.current = { x: 0, y: 0 };
  }, []);

  const currentZoneData = ZONES.find((z) => z.id === activeZone);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none touch-none">
      {/* Game World */}
      <div
        ref={mapRef}
        className="absolute will-change-transform"
        style={{
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          // Initial transform will be set by loop
          backgroundImage: `
            linear-gradient(#333 1px, transparent 1px),
            linear-gradient(90deg, #333 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          backgroundColor: "#222",
        }}
      >
        {/* Decorative Map Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-900 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 right-40 w-64 h-64 bg-blue-900 rounded-full blur-xl"></div>
        </div>

        {/* Zones */}
        {ZONES.map((zone) => (
          <div
            key={zone.id}
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: zone.x - 40,
              top: zone.y - 40,
              width: 80,
              height: 80,
            }}
          >
            <div
              className={`w-16 h-16 ${zone.color} pixel-border animate-bounce flex items-center justify-center text-2xl`}
            >
              {zone.icon}
            </div>
            <div className="mt-2 bg-black/50 text-white px-2 py-1 text-[10px] rounded backdrop-blur-sm whitespace-nowrap">
              {zone.label}
            </div>

            {/* Interaction Ring */}
            <div
              className={`absolute inset-0 -m-4 border-2 border-dashed rounded-full opacity-30 ${
                activeZone === zone.id
                  ? "border-white animate-spin-slow"
                  : "border-transparent"
              }`}
            />
          </div>
        ))}

        {/* Player */}
        <div
          ref={playerRef}
          className="absolute z-10 flex flex-col items-center will-change-transform"
          style={{
            // Initial position
            left: MAP_WIDTH / 2 - PLAYER_SIZE / 2,
            top: MAP_HEIGHT / 2 - PLAYER_SIZE / 2,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
          }}
        >
          {/* Character Sprite Placeholder */}
          <div
            className={`w-full h-full relative transition-transform ${
              gameState.direction === "LEFT" ? "scale-x-[-1]" : ""
            }`}
          >
            {/* Body */}
            <div className="absolute bottom-0 w-8 h-10 bg-blue-600 left-2 pixel-border-sm"></div>
            {/* Head */}
            <div className="absolute bottom-10 w-8 h-8 bg-orange-200 left-2 pixel-border-sm">
              {/* Eyes */}
              <div className="absolute top-3 left-1 w-1 h-1 bg-black"></div>
              <div className="absolute top-3 right-1 w-1 h-1 bg-black"></div>
            </div>
            {/* Legs Animation */}
            <div
              className={`absolute -bottom-1 left-2 w-3 h-3 bg-black ${
                gameState.isMoving ? "animate-pulse" : ""
              }`}
            ></div>
            <div
              className={`absolute -bottom-1 right-4 w-3 h-3 bg-black ${
                gameState.isMoving ? "animate-pulse delay-75" : ""
              }`}
            ></div>
          </div>

          {/* Name Tag */}
          <div className="absolute -top-6 bg-black/50 px-2 py-0.5 rounded text-[8px] text-white whitespace-nowrap">
            Player 1
          </div>
        </div>
      </div>

      {/* HUD / UI Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white text-black px-4 py-2 pixel-border pointer-events-auto">
            <h1 className="text-sm md:text-base font-bold">
              Cristian's Portfolio.exe
            </h1>
            <p className="text-[10px] text-gray-500">v1.0.0</p>
          </div>

          <div className="hidden md:block bg-black/80 text-white p-4 pixel-border text-xs space-y-2">
            <p className="flex items-center gap-2">
              <span className="bg-gray-700 px-2 py-1 pixel-border-sm text-[10px] font-bold shadow-sm">
                WASD
              </span>
              <span>to move</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="bg-gray-700 px-2 py-1 pixel-border-sm text-[10px] font-bold shadow-sm">
                SPACE
              </span>
              <span>to interact</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="bg-gray-700 px-2 py-1 pixel-border-sm text-[10px] font-bold shadow-sm">
                ESC
              </span>
              <span>to close</span>
            </p>
          </div>
        </div>

        {/* Interaction Prompt */}
        {activeZone && !isModalOpen && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce pointer-events-auto hidden md:block">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 pixel-border flex items-center gap-2 transition-colors"
            >
              <span className="animate-pulse">PRESS INTERACT</span>
            </button>
          </div>
        )}

        {/* Mobile Controls */}
        <div className="absolute bottom-8 right-8 pointer-events-auto md:hidden">
          <Joystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
        </div>

        {/* Mobile Interact Button */}
        {activeZone && !isModalOpen && (
          <>
            {/* Mobile-specific tooltip with arrow */}
            <div className="absolute bottom-28 left-6 pointer-events-none md:hidden animate-bounce z-20">
              <div className="bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 pixel-border relative whitespace-nowrap">
                PRESS INTERACT
                {/* Arrow pointing down-left towards the button */}
                <svg
                  className="absolute -bottom-4 left-2 w-4 h-4 text-yellow-400 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 0 L12 12 L24 0 Z" />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 pointer-events-auto md:hidden">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-16 h-16 bg-yellow-400 rounded-full pixel-border flex items-center justify-center active:bg-yellow-500"
              >
                A
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && currentZoneData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
          <div className="bg-white text-black w-full h-full md:w-full md:max-w-2xl md:h-auto md:max-h-[80vh] flex flex-col md:pixel-border shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div
              className={`${currentZoneData.color} p-4 flex justify-between items-center border-b-4 border-black shrink-0`}
            >
              <h2 className="text-white text-xl md:text-2xl flex items-center gap-3">
                <span className="text-3xl">{currentZoneData.icon}</span>
                {currentZoneData.content.title}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 pixel-border-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto bg-[#f0f0f0] flex-1">
              {currentZoneData.content.body}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-200 p-4 border-t-4 border-black text-right text-xs text-gray-500 hidden md:block shrink-0">
              PRESS ESC TO CLOSE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
