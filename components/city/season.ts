/**
 * Seasons
 *
 * The street dresses for the visitor's current date: blossom and flowers in
 * spring, Hawaiian shirts in summer, yellow trees and fallen leaves in autumn,
 * snow in winter, and Christmas decorations from 1 December to 6 January.
 * Northern hemisphere, by calendar month. Preview with `?date=2026-12-24`.
 */

export type Season = "spring" | "summer" | "autumn" | "winter";

export function seasonAt(date: Date): Season {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

/** Christmas decorations: 1 December – 6 January (Epiphany). */
export function isChristmas(date: Date) {
  return date.getMonth() === 11 || (date.getMonth() === 0 && date.getDate() <= 6);
}

/** Tree canopy colours: [main, highlight]. */
export const CANOPY: Record<Season, [string, string]> = {
  // Fresh green with pink blossom
  spring: ["#6aa343", "#f5a8c3"],
  summer: ["#4f7f34", "#6a9a3e"],
  autumn: ["#c9822a", "#e8b53a"],
  // Snow sitting on dark evergreen-ish branches
  winter: ["#55654f", "#eef2f5"],
};
