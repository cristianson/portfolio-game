"use client";

import { useEffect } from "react";
import { startTracking } from "@/lib/analytics/track";

/** Our own cookie-less analytics (lib/analytics, docs/analytics.md). Renders nothing. */
export function Tracking() {
  useEffect(() => startTracking(), []);
  return null;
}
