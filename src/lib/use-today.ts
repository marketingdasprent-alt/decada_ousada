"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Data de hoje (YYYY-MM-DD) calculada só no browser.
 * No servidor devolve "": evita valores dependentes da hora no HTML pré-renderizado.
 */
export function useToday(): string {
  return useSyncExternalStore(
    noop,
    () => new Date().toISOString().slice(0, 10),
    () => "",
  );
}
