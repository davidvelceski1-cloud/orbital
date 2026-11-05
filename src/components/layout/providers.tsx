"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { usePrefs } from "@/lib/store";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks";

/** Applies theme + reduced-motion preferences to <html> and Framer Motion. */
export function Providers({ children }: { children: React.ReactNode }) {
  const theme = usePrefs((s) => s.theme);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const reduced = useReducedMotion();

  useEffect(() => {
    const dark = theme === "dark" || (theme === "system" && systemDark);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme, systemDark]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced);
  }, [reduced]);

  return <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>;
}
