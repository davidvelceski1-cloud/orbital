"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePrefs } from "@/lib/store";

/** True after the first client render — gate anything read from localStorage to avoid hydration mismatches. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
}

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Effective reduced-motion: the user's in-app choice wins, else the OS setting. */
export function useReducedMotion() {
  const pref = usePrefs((s) => s.reducedMotion);
  const os = useMediaQuery("(prefers-reduced-motion: reduce)");
  return pref ?? os;
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

/** Rough device capability check for the 3D explorer (degrade gracefully on low-end devices). */
export function useLowPowerDevice() {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    setLow(cores <= 4 || memory <= 4);
  }, []);
  return low;
}
