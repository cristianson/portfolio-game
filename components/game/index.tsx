/**
 * Game Main Entry Point
 *
 * This is the root component of the game. It orchestrates the game loop, handles user input
 * (keyboard and joystick), manages game state (player position, active zones), and renders
 * the main game world, player, and UI overlays.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Joystick } from "./joystick";
import { GameState, InteractionType, Position } from "./types";
import {
  PLAYER_SIZE,
  INTERACTION_DISTANCE,
  INTERACTION_BUFFER,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
} from "./constants";
import { Player } from "./player";
import { Zone } from "./zone";
import { Modal } from "./modal";
import { PixelTooltip } from "./pixel-tooltip";
import { getCurrentSeason } from "./seasons";
import { useWebHaptics } from "web-haptics/react";
import { Tulips } from "./tulips";

const SNOWFLAKE_COUNT = 30;
const TULIP_COUNT_DESKTOP = 8;
const TULIP_COUNT_MOBILE = 5;

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
  // Track if component has mounted and initialized - prevents flash of incorrect layout
  const [isReady, setIsReady] = useState(false);

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
  const [showInstructions, setShowInstructions] = useState(true);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const { trigger: triggerHaptic } = useWebHaptics();

  // Fire a heavy haptic on mobile when the "Press to interact" button appears
  useEffect(() => {
    if (activeZone && isMobile) {
      triggerHaptic("heavy");
    }
  }, [activeZone, isMobile, triggerHaptic]);

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

  // Get current season configuration
  const currentSeason = getCurrentSeason();

  // Snowflakes - Initialize on client only to match hydration
  const [snowflakes, setSnowflakes] = useState<
    Array<{ id: number; left: number; speed: number; delay: number }>
  >([]);

  // Tulips - Initialize on client only to match hydration
  const [tulips, setTulips] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      color: "red" | "pink" | "yellow" | "purple";
      swaySpeed: number;
      growDelay: number;
    }>
  >([]);

  useEffect(() => {
    // Only initialize snowflakes if the current season shows them
    if (currentSeason.showSnowflakes) {
      const flakes = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // Random horizontal position 0-100%
        speed: 5 + Math.random() * 10, // Random duration between 5-15s
        delay: -(Math.random() * 15), // Negative delay to start mid-animation
      }));
      setSnowflakes(flakes);
    } else {
      setSnowflakes([]);
    }

    // Initialize tulips if the current season shows them
    if (currentSeason.showFlowers) {
      const colors: Array<"red" | "pink" | "yellow" | "purple"> = [
        "red",
        "pink",
        "yellow",
        "purple",
      ];

      // Use different tulip count based on screen size
      const tulipCount = isMobile ? TULIP_COUNT_MOBILE : TULIP_COUNT_DESKTOP;

      // Define safe zones to avoid (zones + mobile UI elements + player start position)
      const SAFE_ZONE_RADIUS = 120; // Distance to keep away from zones
      const PLAYER_SAFE_ZONE_RADIUS = 150; // Distance to keep away from player start
      const MIN_TULIP_DISTANCE = 80; // Minimum distance between tulips
      const MOBILE_JOYSTICK_SAFE_ZONE = {
        x: config.width - 100, // Right side
        y: config.height - 100, // Bottom
        radius: 120,
      };

      // Player starting position (center of map)
      const playerStartX = config.width / 2;
      const playerStartY = config.height / 2;

      // Helper function to check if a position is valid
      const isPositionValid = (
        x: number,
        y: number,
        existingTulips: Array<{ x: number; y: number }>
      ): boolean => {
        // Check distance from player starting position
        const distToPlayer = Math.sqrt(
          Math.pow(x - playerStartX, 2) + Math.pow(y - playerStartY, 2)
        );
        if (distToPlayer < PLAYER_SAFE_ZONE_RADIUS) {
          return false;
        }

        // Check distance from zones
        for (const zone of config.zones) {
          const distToZone = Math.sqrt(
            Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2)
          );
          if (distToZone < SAFE_ZONE_RADIUS) {
            return false;
          }
        }

        // Check distance from mobile joystick (bottom-right corner)
        const distToJoystick = Math.sqrt(
          Math.pow(x - MOBILE_JOYSTICK_SAFE_ZONE.x, 2) +
            Math.pow(y - MOBILE_JOYSTICK_SAFE_ZONE.y, 2)
        );
        if (distToJoystick < MOBILE_JOYSTICK_SAFE_ZONE.radius) {
          return false;
        }

        // Check distance from other tulips
        for (const tulip of existingTulips) {
          const distToTulip = Math.sqrt(
            Math.pow(x - tulip.x, 2) + Math.pow(y - tulip.y, 2)
          );
          if (distToTulip < MIN_TULIP_DISTANCE) {
            return false;
          }
        }

        return true;
      };

      // Generate tulips with collision detection
      const flowers: Array<{
        id: number;
        x: number;
        y: number;
        color: "red" | "pink" | "yellow" | "purple";
        swaySpeed: number;
        growDelay: number;
      }> = [];

      let attempts = 0;
      const maxAttempts = tulipCount * 50; // Prevent infinite loop

      while (flowers.length < tulipCount && attempts < maxAttempts) {
        const x = 100 + Math.random() * (config.width - 200);
        const y = 100 + Math.random() * (config.height - 200);

        if (isPositionValid(x, y, flowers)) {
          flowers.push({
            id: flowers.length,
            x,
            y,
            color: colors[Math.floor(Math.random() * colors.length)],
            swaySpeed: 2 + Math.random() * 2,
            growDelay: Math.random() * 2,
          });
        }

        attempts++;
      }

      setTulips(flowers);
    } else {
      setTulips([]);
    }
  }, [
    currentSeason.showSnowflakes,
    currentSeason.showFlowers,
    config.width,
    config.height,
    config.zones,
    isMobile,
  ]);

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
    // Mark as ready after first initialization - this prevents the initial flash
    setIsReady(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dismiss instructions when moving
  useEffect(() => {
    if (gameState.isMoving && showInstructions) {
      setShowInstructions(false);
    }
  }, [gameState.isMoving, showInstructions]);

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
  }, [activeZone, isModalOpen, viewportSize, gameState.direction, config]);

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

  return (
    <div
      className={`relative w-full h-screen bg-black overflow-hidden select-none touch-none transition-opacity duration-300 ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Seasonal Effects Overlay - Fixed to viewport */}
      {currentSeason.showSnowflakes && snowflakes.length > 0 && (
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
      )}

      {/* Spring Tulips */}
      {/* Tulips are now inside the game world map, not here */}

      {/* Future seasonal effects can be added here */}
      {/* Example: {currentSeason.showSunRays && <SunRays />} */}
      {/* Example: {currentSeason.showLeaves && <FallingLeaves />} */}

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
        {/* Spring Tulips - In the game world so they scroll with camera */}
        {currentSeason.showFlowers && tulips.length > 0 && (
          <Tulips tulips={tulips} />
        )}

        {/* Zones */}
        {config.zones.map((zone) => (
          <Zone key={zone.id} zone={zone} isActive={activeZone === zone.id} />
        ))}

        {/* Player - INSIDE the map so it transforms with the camera */}
        <Player
          ref={playerRef}
          x={playerPosRef.current.x}
          y={playerPosRef.current.y}
          direction={gameState.direction}
          isMoving={gameState.isMoving}
        />
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
        {showInstructions && !isModalOpen && (
          <PixelTooltip className="hidden md:block bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="px-6 py-3 text-base">
              <span className="animate-pulse">MOVE AROUND TO EXPLORE</span>
            </div>
          </PixelTooltip>
        )}

        {activeZone && !isModalOpen && (
          <PixelTooltip
            className="hidden md:block bottom-24 left-1/2 -translate-x-1/2"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="px-6 py-3 text-base">
              <span className="animate-pulse">PRESS SPACE TO INTERACT</span>
            </div>
          </PixelTooltip>
        )}
      </div>

      {/* Mobile Controls — fixed to viewport so they're always visible regardless of browser chrome */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="relative h-36">
          {/* Joystick — bottom right */}
          <div className="absolute bottom-4 right-8 pointer-events-auto">
            <Joystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
          </div>

          {/* "MOVE TO EXPLORE" hint pointing toward the joystick */}
          {showInstructions && !isModalOpen && (
            <PixelTooltip
              className="bottom-16 right-44 pointer-events-none"
              arrow="right"
              arrowPosition="-right-3"
              animate="slide-horizontal"
            >
              <div className="px-3 py-2 text-[10px]">MOVE TO EXPLORE</div>
            </PixelTooltip>
          )}

          {/* Interact button + hint — bottom left, only when near a zone */}
          {activeZone && !isModalOpen && (
            <>
              <PixelTooltip
                className="bottom-[5.5rem] left-6 pointer-events-none"
                arrow="bottom"
                arrowPosition="left-9"
              >
                <div className="px-3 py-2 text-[10px]">PRESS TO INTERACT</div>
              </PixelTooltip>

              <div className="absolute bottom-4 left-8 pointer-events-auto">
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
      </div>

      {/* Modal */}
      {isModalOpen && activeZone && (
        <Modal activeZone={activeZone} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
