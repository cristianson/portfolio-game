"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Joystick } from "./joystick";
import { JobEntry } from "./job-entry";

// Custom Icons to replace deprecated Lucide imports
const GithubIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// Types
type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "IDLE";
type InteractionType = "ABOUT" | "PROJECTS" | "CASE_STUDIES" | "SOCIALS" | null;

interface GameState {
  direction: Direction;
  isMoving: boolean;
}

// Constants
const PLAYER_SIZE = 80;
const INTERACTION_DISTANCE = 100; // Adjusted to match visual ring (Radius 80px)
const INTERACTION_BUFFER = 10;
const SNOWFLAKE_COUNT = 30; // Number of snowflakes

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
            <div className="flex flex-col md:flex-row gap-6 items-start">
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
                <p className="text-mono-base leading-relaxed">
                  I love designing and building useful products and fun projects
                  with AI.
                </p>
                <p className="text-mono-base leading-relaxed">
                  I've been designing for the past 5 years and worked with AI
                  startups, fintech, and B2B SaaS companies.
                </p>
                <p className="text-mono-base leading-relaxed">
                  [Add text here]
                </p>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="w-full pt-6 mt-2 border-t-4 border-dashed border-black/10">
              {/* <h3 className="text-mono-lg font-bold mb-6 flex items-center gap-2">
                <span className="text-mono-lg">⏳</span> Work Timeline
              </h3> */}

              <div className="space-y-8">
                <JobEntry
                  title="Founding Product Designer"
                  period="Dec 2025 – Present"
                  company="Lette AI"
                  url="https://www.lette.ai/"
                  description="A solution for orchestrating AI agents that streamline property management operations, from leasing, maintenance, tenant support and more."
                  isCurrent={true}
                  isFirst={true}
                />

                <JobEntry
                  title="Product Design Lead"
                  period="Aug 2024 - Jul 2025"
                  company="FULLY AI (Acquired by Circus Group)"
                  url="https://www.gofully.ai/"
                  description="A no-code multi-agent platform to create brand-ready AI agents embedded in your product that learn, adapt, and improve across every stage of the customer lifecycle."
                />

                <JobEntry
                  title="Product Designer"
                  period="Feb 2023 - Mar 2024"
                  company="Spoke.ai (Acquired by Slack)"
                  url="https://www.spoke.ai/"
                  description="An AI inbox that centralizes notifications from Slack and other work tools, summarizes them, prioritizes tasks, and suggests next actions."
                />

                <JobEntry
                  title="Product Designer"
                  period="Oct 2021 - Jan 2023"
                  company="Sortlist"
                  url="https://www.sortlist.com/"
                  description="A matchmaking B2B SaaS platform that allows companies to find the most relevant digital agencies for their projects."
                  isLast={true}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  },
  PROJECTS: {
    label: "Built Projects",
    color: "bg-purple-500",
    icon: "💻",
    content: {
      title: "Built Projects",
      body: (
        <div className="grid gap-6">
          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-pixel-lg mb-2">Airbnb Listing Comparer</h3>
            <p className="text-mono-xs mb-2">
              Chrome Extension • Product & AI Engineering
            </p>
            <p className="text-mono-base leading-relaxed">
              A Chrome extension that uses AI (Luna) to automate comparing
              Airbnb listings. It extracts data, highlights pros/cons, and
              generates side-by-side comparisons to save travelers time and
              reduce decision fatigue.
            </p>
            <a
              href="https://chromewebstore.google.com/detail/airbnb-listing-comparer/dfkpdnhihibjifejkhbpickfpkkciohe"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              View Extension &gt;
            </a>
          </div>
          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-pixel-lg mb-2">
              Public Transport Ticket Gallery
            </h3>
            <p className="text-mono-xs mb-2">
              Design & Front-end • Personal Project
            </p>
            <p className="text-mono-base leading-relaxed">
              A curated digital archive where public transport tickets are
              displayed as pieces of visual culture. Explores interaction
              patterns, subtle animations, and storytelling through mundane
              artifacts.
            </p>
            <a
              href="https://tickets-phi-one.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              Visit Ticket Gallery &gt;
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
            <h3 className="text-pixel-lg text-orange-500 mb-2">Spoke.ai</h3>
            <p className="text-mono-base leading-relaxed">
              I helped redesign an AI inbox for Slack into a native macOS app so
              it fits naturally into people’s daily workflow. By bringing AI
              summaries, a priority sidebar, and native notifications closer to
              where work happens, time spent focused in the app tripled and DAU
              grew by 147%.
            </p>
            <a
              href="https://www.figma.com/deck/XzPSjhrtDVSIyqK6fkwZP9/Spoke.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-6"
            >
              More info &gt;
            </a>
          </div>
          <hr className="border-zinc-700" />
          <div>
            <h3 className="text-pixel-lg text-orange-500 mb-2">FULLY AI</h3>
            <p className="text-mono-base leading-relaxed">
              I created the vision and v1 of an AI-driven Bento dashboard that
              adapts content to each step of the customer journey. With modular
              blocks built for engagement and clarity, it set clear targets
              (+30% time on page, 40–60% FAQs resolved) and became a valuable
              asset in investor and acquisition discussions.
            </p>
            <a
              href="https://www.figma.com/deck/dxL9upoAsEYSZVEJ8eDp7A/FULLY-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-6"
            >
              More info &gt;
            </a>
          </div>
        </div>
      ),
    },
  },
  SOCIALS: {
    label: "Socials",
    color: "bg-green-500",
    icon: "🌐",
    content: {
      title: "Socials",
      body: (
        <div className="flex flex-col gap-6 items-center justify-center py-8">
          <p className="text-mono-base text-center max-w-md mb-4">
            Feel free to connect with me on social media or check out my code
            repos :)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
            <a
              href="https://www.linkedin.com/in/crisiordan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white border-2 border-black hover:bg-blue-50 transition-colors group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#0077b5] text-white rounded mb-3 group-hover:scale-110 transition-transform">
                <LinkedinIcon size={24} />
              </div>
              <span className="text-pixel-sm">LinkedIn</span>
            </a>

            <a
              href="https://x.com/CristianIordan_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white border-2 border-black hover:bg-gray-50 transition-colors group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded mb-3 group-hover:scale-110 transition-transform">
                <TwitterIcon size={24} />
              </div>
              <span className="text-pixel-sm">Twitter(X)</span>
            </a>

            <a
              href="https://github.com/cristianson"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white border-2 border-black hover:bg-gray-50 transition-colors group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#333] text-white rounded mb-3 group-hover:scale-110 transition-transform">
                <GithubIcon size={24} />
              </div>
              <span className="text-pixel-sm">GitHub</span>
            </a>
          </div>
        </div>
      ),
    },
  },
};

// Default config values (used for SSR and initial render)
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

// Helper to generate responsive config based on viewport size
const getResponsiveConfig = (width: number, height: number) => {
  const isMobile = width < 768;

  // Map dimensions:
  // Use the larger of (Screen Size) or (Minimum Size).
  // This ensures the map always fills the screen, but has a minimum size for gameplay.
  const mapWidth = Math.max(width, isMobile ? 600 : DEFAULT_WIDTH);
  const mapHeight = Math.max(height, DEFAULT_HEIGHT);

  // Calculate speed proportional to map size for consistent feel across screen sizes
  // Mobile: Keep speed constant (mobile screens don't vary much in size)
  // Desktop: Scale speed proportionally, with higher multiplier for large screens (1920px+)
  const baseSpeed = mapWidth >= 1920 ? 5 : 4;
  const speed = isMobile ? 6 : (mapWidth / DEFAULT_WIDTH) * baseSpeed;

  return {
    width: mapWidth,
    height: mapHeight,
    speed: speed,
    zones: isMobile
      ? [
          // Mobile: Compact 2x2 Grid (Optimized for small screens)
          {
            id: "ABOUT",
            x: mapWidth * 0.25, // Top-Left
            y: mapHeight * 0.25,
          },
          {
            id: "PROJECTS",
            x: mapWidth * 0.75, // Top-Right
            y: mapHeight * 0.25,
          },
          {
            id: "CASE_STUDIES",
            x: mapWidth * 0.75, // Bottom-Right
            y: mapHeight * 0.75,
          },
          {
            id: "SOCIALS",
            x: mapWidth * 0.25, // Bottom-Left
            y: mapHeight * 0.75,
          },
        ]
      : [
          // Desktop: Scattered / Adventure Layout
          // Spreads zones towards corners/edges to encourage exploration
          {
            id: "ABOUT",
            x: mapWidth * 0.2, // Left-ish, Top-ish
            y: mapHeight * 0.25,
          },
          {
            id: "PROJECTS",
            x: mapWidth * 0.65, // Right-ish, Top
            y: mapHeight * 0.3,
          },
          {
            id: "CASE_STUDIES",
            x: mapWidth * 0.7, // Right, Bottom
            y: mapHeight * 0.75,
          },
          {
            id: "SOCIALS",
            x: mapWidth * 0.25, // Left, Bottom
            y: mapHeight * 0.7,
          },
        ],
  };
};

// Initial config for SSR - always use defaults to avoid hydration mismatch
const INITIAL_CONFIG = getResponsiveConfig(DEFAULT_WIDTH, DEFAULT_HEIGHT);

export default function PixelPortfolio() {
  const [isMobile, setIsMobile] = useState(false);

  // Always initialize with the same values on server and client to avoid hydration mismatch
  // The actual window size will be applied in useEffect after mount
  const [config, setConfig] = useState(INITIAL_CONFIG);

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

  // Track current config for resize calculations
  const configRef = useRef(config);

  // Use default values for initial position (will be updated in useEffect)
  const playerPosRef = useRef({
    x: DEFAULT_WIDTH / 2,
    y: DEFAULT_HEIGHT / 2,
  });
  const joystickRef = useRef({ x: 0, y: 0 });

  // Snowflakes - Initialize on client only to match hydration
  const [snowflakes, setSnowflakes] = useState<
    Array<{ id: number; left: number; speed: number; delay: number }>
  >([]);

  useEffect(() => {
    const flakes = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position 0-100%
      speed: 5 + Math.random() * 10, // Random duration between 5-15s
      delay: -(Math.random() * 15), // Negative delay to start mid-animation
    }));
    setSnowflakes(flakes);
  }, []);

  // Initialize viewport and detect mobile
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewportSize({ width, height });

      const mobile = width < 768;
      setIsMobile(mobile);

      const newConfig = getResponsiveConfig(width, height);

      // Preserve relative position
      const prevWidth = configRef.current.width;
      const prevHeight = configRef.current.height;

      // If dimensions changed, scale position
      if (prevWidth !== newConfig.width || prevHeight !== newConfig.height) {
        const relativeX = playerPosRef.current.x / prevWidth;
        const relativeY = playerPosRef.current.y / prevHeight;

        playerPosRef.current = {
          x: newConfig.width * relativeX,
          y: newConfig.height * relativeY,
        };
      }

      setConfig(newConfig);
      configRef.current = newConfig;
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
      {/* Snowflakes Overlay - Fixed to viewport */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute pixel-snowflake pointer-events-none animate-fall"
            style={{
              left: `${flake.left}%`,
              top: "-10px",
              animationDuration: `${flake.speed}s`,
              animationDelay: `${flake.delay}s`,
            }}
          />
        ))}
      </div>

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
        {/* Zones */}
        {config.zones.map((zone) => {
          const data = ZONE_CONTENT[zone.id as keyof typeof ZONE_CONTENT];
          // Calculate the ring size to match INTERACTION_DISTANCE
          // Zone visual is 80x80 centered on (zone.x, zone.y)
          // Ring should extend INTERACTION_DISTANCE from center, so diameter = INTERACTION_DISTANCE * 2
          const ringSize = INTERACTION_DISTANCE * 2;
          const zoneSize = 80;
          const ringMargin = (ringSize - zoneSize) / 2;

          return (
            <div
              key={zone.id}
              className="absolute flex flex-col items-center justify-center pointer-events-none"
              style={{
                left: zone.x - 40,
                top: zone.y - 40,
                width: 80,
                height: 80,
              }}
            >
              {/* Interaction Indicator - Floor Reticle */}
              {activeZone === zone.id && (
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
                  className={`relative z-20 mb-[-10px] animate-float transition-transform duration-300 ${
                    activeZone === zone.id ? "scale-110" : "scale-100"
                  }`}
                >
                  {/* Icon Container */}
                  <div
                    className={`w-16 h-16 ${data.color} pixel-border flex items-center justify-center text-2xl relative overflow-hidden group`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-full group-hover:animate-shine" />
                    <div className="relative z-10 drop-shadow-md">
                      {data.icon}
                    </div>
                  </div>

                  {/* Active Arrow Indicator */}
                  {activeZone === zone.id && (
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
                  activeZone === zone.id
                    ? "opacity-100 translate-y-1"
                    : "opacity-90 translate-y-1"
                }`}
              >
                <div className="bg-black/80 text-white px-3 py-1 text-[10px] pixel-border-sm backdrop-blur-sm whitespace-nowrap">
                  {data.label}
                </div>
              </div>
            </div>
          );
        })}

        {/* Player - INSIDE the map so it transforms with the camera */}
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

          {/* Character Sprite - Pixel Human with Santa Hat */}
          <div
            className={`w-full h-full relative transition-transform duration-150 ${
              gameState.direction === "LEFT" ? "scale-x-[-1]" : ""
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
                  gameState.isMoving ? "rotate-12 translate-y-[-1px]" : ""
                }`}
              >
                <div className="absolute bottom-0 w-full h-2 bg-orange-200 border-t border-black/10"></div>
              </div>
              {/* Right Arm */}
              <div
                className={`absolute right-[-4px] top-0 w-2 h-7 bg-blue-700 origin-top transition-transform ${
                  gameState.isMoving ? "-rotate-12 translate-y-[-1px]" : ""
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
                  gameState.isMoving ? "h-[80%] translate-y-[-1px]" : "h-full"
                }`}
              ></div>
              {/* Right Leg */}
              <div
                className={`absolute right-0.5 top-0 w-2.5 h-full bg-white origin-top transition-all duration-150 delay-75 ${
                  gameState.isMoving ? "h-full" : "h-full"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* HUD / UI Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white text-black px-4 py-2 pixel-border pointer-events-auto">
            <h1 className="text-pixel-sm md:text-pixel-base font-bold">
              Cristian's_Portfolio.EXE
            </h1>
            <p className="text-[10px] text-gray-500">v1.0.0</p>
          </div>

          <div className="hidden md:block bg-black/80 text-white p-4 pixel-border text-xs space-y-2">
            <p className="flex items-center gap-2">
              <span className="bg-gray-700 px-2 py-1 pixel-border-sm text-[10px] font-bold shadow-sm">
                WASD
              </span>
              <span>or</span>
              <span className="bg-gray-700 px-2 py-1 pixel-border-sm text-[10px] font-bold shadow-sm">
                Arrow Keys
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
          <div
            className={`bg-white text-black w-full h-full md:w-full ${
              activeZone === "ABOUT" ? "md:max-w-4xl" : "md:max-w-3xl"
            } md:h-auto md:max-h-[80vh] flex flex-col md:pixel-border shadow-2xl animate-in zoom-in-95 duration-200`}
          >
            {/* Modal Header */}
            <div
              className={`${currentZoneData.color} p-4 flex justify-between items-center border-b-4 border-black shrink-0`}
            >
              <h2 className="text-white text-pixel-xl md:text-pixel-2xl flex items-center gap-3">
                <span className="text-pixel-2xl">{currentZoneData.icon}</span>
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
            <div className="bg-gray-200 p-4 border-t-4 border-black text-right text-mono-xs text-gray-500 hidden md:block shrink-0">
              PRESS ESC TO CLOSE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
