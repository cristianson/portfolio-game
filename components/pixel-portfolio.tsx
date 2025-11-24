"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
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
const INTERACTION_DISTANCE = 100;
const INTERACTION_BUFFER = 10;

// Mock Data Content (Separated from positioning)
const ZONE_CONTENT = {
  ABOUT: {
    label: "About Me",
    color: "bg-blue-500",
    icon: "👤",
    content: {
      title: "About Me",
      body: (
        <div className="space-y-4">
          <div className="flex flex-col gap-6 items-start">
            <div className="w-[300px] h-[300px] flex-shrink-0 pixel-border-sm overflow-hidden">
              <Image
                src="/avatar.webp"
                alt="Profile photo"
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <p>
                Hi! I'm a Product Designer passionate about creating intuitive
                and engaging digital experiences.
              </p>
              <p>
                With a background in both UX research and UI design, I bridge
                the gap between user needs and business goals.
              </p>
              <p>
                When I'm not designing, I'm probably playing retro RPGs or pixel
                art games!
              </p>
            </div>
          </div>
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
  PROJECTS: {
    label: "Projects",
    color: "bg-purple-500",
    icon: "💻",
    content: {
      title: "Built Projects",
      body: (
        <div className="grid gap-6">
          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-lg mb-2 font-bold">
              Public Transport Ticket Gallery
            </h3>
            <p className="text-xs mb-2">
              Design & Front-end • Personal Project
            </p>
            <p className="text-sm mb-3">
              A curated digital archive where public transport tickets are
              displayed as pieces of visual culture. Explores interaction
              patterns, subtle animations, and storytelling through mundane
              artifacts.
            </p>
            <a
              href="https://tickets-phi-one.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline hover:text-purple-600 font-bold"
            >
              Visit Live Gallery &gt;
            </a>
          </div>

          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-lg mb-2 font-bold">Airbnb Listing Comparer</h3>
            <p className="text-xs mb-2">
              Chrome Extension • Product & AI Engineering
            </p>
            <p className="text-sm mb-3">
              A Chrome extension that uses AI (Luna) to automate comparing
              Airbnb listings. It extracts data, highlights pros/cons, and
              generates side-by-side comparisons to save travelers time and
              reduce decision fatigue.
            </p>
            <a
              href="https://chromewebstore.google.com/detail/airbnb-listing-comparer/dfkpdnhihibjifejkhbpickfpkkciohe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline hover:text-purple-600 font-bold"
            >
              View on Chrome Web Store &gt;
            </a>
          </div>
        </div>
      ),
    },
  },
  CASE_STUDIES: {
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
};

const DESKTOP_CONFIG = {
  width: 1200,
  height: 800,
  speed: 4,
  zones: [
    { id: "ABOUT", x: 200, y: 200 },
    { id: "PROJECTS", x: 900, y: 250 },
    { id: "CASE_STUDIES", x: 550, y: 600 },
  ],
};

const MOBILE_CONFIG = {
  width: 600, // Smaller map for mobile
  height: 800, // Taller for vertical scrolling feel, but kept compact
  speed: 6, // Reduced from 8 to 6 for slightly slower, more controlled movement on mobile
  zones: [
    { id: "ABOUT", x: 150, y: 150 }, // Top left-ish
    { id: "PROJECTS", x: 450, y: 200 }, // Top right-ish
    { id: "CASE_STUDIES", x: 300, y: 600 }, // Bottom center
  ],
};

export default function PixelPortfolio() {
  const [isMobile, setIsMobile] = useState(false);
  const [config, setConfig] = useState(DESKTOP_CONFIG);

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

  const playerPosRef = useRef({
    x: DESKTOP_CONFIG.width / 2,
    y: DESKTOP_CONFIG.height / 2,
  });
  const joystickRef = useRef({ x: 0, y: 0 });

  // Initialize viewport and detect mobile
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewportSize({ width, height });

      const mobile = width < 768;
      setIsMobile(mobile);
      const newConfig = mobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
      setConfig(newConfig);

      playerPosRef.current = {
        x: newConfig.width / 2,
        y: newConfig.height / 2,
      };
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

      x += dx * config.speed;
      y += dy * config.speed;
    }

    // Boundary checks
    x = Math.max(PLAYER_SIZE / 2, Math.min(config.width - PLAYER_SIZE / 2, x));
    y = Math.max(PLAYER_SIZE / 2, Math.min(config.height - PLAYER_SIZE / 2, y));

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
        Math.min(config.width - viewportSize.width, x - viewportSize.width / 2)
      );
      const cameraY = Math.max(
        0,
        Math.min(
          config.height - viewportSize.height,
          y - viewportSize.height / 2
        )
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
    let minDistance = Number.POSITIVE_INFINITY;

    for (const zone of config.zones) {
      const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));

      // If this is the currently active zone, use the buffered distance (hysteresis)
      // This prevents flickering when standing right on the edge
      const threshold =
        activeZone === zone.id
          ? INTERACTION_DISTANCE + INTERACTION_BUFFER
          : INTERACTION_DISTANCE;

      if (dist < threshold) {
        // If multiple zones are in range (unlikely), pick the closest one
        if (dist < minDistance) {
          minDistance = dist;
          nearestZone = zone.id as InteractionType;
        }
      }
    }

    if (nearestZone !== activeZone) {
      setActiveZone(nearestZone);
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [activeZone, isModalOpen, viewportSize, gameState.direction, config]); // Added config dependency

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

  const getZoneData = (id: string) => {
    const staticData = ZONE_CONTENT[id as keyof typeof ZONE_CONTENT];
    const posData = config.zones.find((z) => z.id === id);
    return { ...staticData, ...posData };
  };

  const currentZoneData = activeZone ? getZoneData(activeZone) : null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none touch-none">
      {/* Game World */}
      <div
        ref={mapRef}
        className="absolute will-change-transform"
        style={{
          width: config.width,
          height: config.height,
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
        {config.zones.map((zone) => {
          const data = ZONE_CONTENT[zone.id as keyof typeof ZONE_CONTENT];
          return (
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
                className={`w-16 h-16 ${data.color} pixel-border animate-bounce flex items-center justify-center text-2xl`}
              >
                {data.icon}
              </div>
              <div className="mt-2 bg-black/50 text-white px-2 py-1 text-[10px] rounded backdrop-blur-sm whitespace-nowrap">
                {data.label}
              </div>

              {/* Interaction Ring */}
              <div
                className={`absolute inset-0 -m-16 border-2 border-dashed rounded-full opacity-30 ${
                  activeZone === zone.id
                    ? "border-white animate-spin-slow"
                    : "border-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Player */}
      <div
        ref={playerRef}
        className="absolute z-10 flex flex-col items-center will-change-transform"
        style={{
          left: config.width / 2 - PLAYER_SIZE / 2,
          top: config.height / 2 - PLAYER_SIZE / 2,
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
        }}
      >
        {/* Name Tag */}
        <div className="absolute -top-12 bg-black/50 px-2 py-0.5 rounded text-[8px] text-white whitespace-nowrap z-20">
          Player 1
        </div>

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
      </div>

      {/* HUD / UI Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white text-black px-4 py-2 pixel-border pointer-events-auto">
            <h1 className="text-sm md:text-base font-bold">
              Cristian's_Portfolio.EXE
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
          </div>
        </div>

        {/* Interaction Prompt */}
        {activeZone && !isModalOpen && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce pointer-events-auto hidden md:block">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 pixel-border flex items-center gap-2 transition-colors"
            >
              <span className="animate-pulse">PRESS SPACE TO INTERACT</span>
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
                PRESS TO INTERACT
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
