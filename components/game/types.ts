/**
 * Shared Types
 *
 * This file defines the TypeScript interfaces and types used across multiple game components.
 * It includes definitions for game state, positions, directions, and interaction types.
 */

export type Position = { x: number; y: number };
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "IDLE";
export type InteractionType =
  | "ABOUT"
  | "PROJECTS"
  | "CASE_STUDIES"
  | "SOCIALS"
  | null;

export interface GameState {
  direction: Direction;
  isMoving: boolean;
}

export interface ZoneConfig {
  id: string;
  x: number;
  y: number;
}

export interface GameConfig {
  width: number;
  height: number;
  speed: number;
  zones: ZoneConfig[];
}
