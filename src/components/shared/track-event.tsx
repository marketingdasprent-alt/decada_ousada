"use client";

import { useEffect } from "react";

import { track, trackOnce, type AnalyticsData, type AnalyticsEvent } from "@/lib/analytics";

/** Dispara um evento de analytics quando a página (server component) é vista. */
export function TrackEvent({ name, data, once }: { name: AnalyticsEvent; data?: AnalyticsData; once?: string }) {
  const payload = JSON.stringify(data ?? {});
  useEffect(() => {
    const parsed = JSON.parse(payload) as AnalyticsData;
    if (once) trackOnce(once, name, parsed);
    else track(name, parsed);
  }, [name, payload, once]);
  return null;
}
