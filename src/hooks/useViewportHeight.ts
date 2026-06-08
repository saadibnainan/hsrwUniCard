"use client";

import { useEffect } from "react";

/**
 * iOS Safari reports an incorrect `100dvh` for the first paint after a PWA is
 * launched from a Home Screen icon (added via the Safari share sheet) — the
 * shell renders shorter than the real viewport, leaving a blank gap below the
 * bottom nav until the page is reloaded and the browser recomputes it.
 *
 * Mirror the real viewport height into a `--app-height` custom property
 * (driven by `visualViewport`, which iOS keeps accurate through the
 * standalone-launch chrome transition) and use that as the source of truth
 * for the app shell instead of relying on `dvh` alone.
 */
export function useViewportHeight() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;

    const setAppHeight = () => {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--app-height", `${height}px`);
    };

    setAppHeight();

    window.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);
    viewport?.addEventListener("resize", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
      viewport?.removeEventListener("resize", setAppHeight);
    };
  }, []);
}
