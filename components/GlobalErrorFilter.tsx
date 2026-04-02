"use client";

import { useEffect } from "react";

/**
 * hls.js and @mux/mux-player call console.error() directly for benign
 * network errors (signed-URL 403s, brief 404s during deletion, etc.).
 * These are non-actionable and clutter the dev console.
 *
 * We patch console.error in the root layout using Object.defineProperty
 * so the filter survives Next.js Turbopack's per-route console overrides.
 */
const SUPPRESSED_PATTERNS = [
  "getErrorFromHlsErrorData",
  "playback-id was invalid",
  "playback-id does not exist",
  "URL or playback-id was invalid",
  "URL or playback-id does not exist",
  "[mux-player",
  "MediaError data",
];

export default function GlobalErrorFilter() {
  useEffect(() => {
    const original = console.error.bind(console);

    const filtered = (...args: unknown[]) => {
      const msg = args.map(String).join(" ");
      if (SUPPRESSED_PATTERNS.some((p) => msg.includes(p))) return;
      original(...args);
    };

    // Use defineProperty so Next.js Turbopack's per-route setup
    // (which does `console.error = newWrapper`) can't overwrite our filter.
    Object.defineProperty(console, "error", {
      get: () => filtered,
      set: () => {
        /* intentional noop — prevents overwrite */
      },
      configurable: true,
    });

    return () => {
      // Restore properly on unmount (full app teardown / HMR)
      Object.defineProperty(console, "error", {
        value: original,
        writable: true,
        configurable: true,
      });
    };
  }, []);

  return null;
}
