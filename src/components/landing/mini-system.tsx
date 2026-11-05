"use client";

import { useMemo } from "react";
import Link from "next/link";
import * as Astronomy from "astronomy-engine";
import { PLANETS } from "@/data/objects";
import { useMounted, useReducedMotion } from "@/lib/hooks";

const BODY = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  earth: Astronomy.Body.Earth,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
} as const;

/**
 * Lightweight live preview for the landing page: planets start at today's real
 * heliocentric longitudes and orbit at their true relative speeds (1 Earth year ≈ 20 s).
 * Pure SVG + CSS — no WebGL — so it never delays first paint.
 */
export function MiniSolarSystem() {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const longitudes = useMemo(() => {
    const now = new Date();
    return Object.fromEntries(
      PLANETS.map((p) => [p.id, mounted ? Astronomy.EclipticLongitude(BODY[p.id as keyof typeof BODY], now) : 0]),
    );
  }, [mounted]);

  return (
    <Link href="/explore" aria-label="Open the 3D solar system explorer" className="group relative block aspect-square w-full max-w-[520px]">
      <svg viewBox="-260 -260 520 520" className="size-full overflow-visible">
        <defs>
          <radialGradient id="mini-sun">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="55%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FDBA74" />
          </radialGradient>
          <radialGradient id="mini-glow">
            <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F9A8D4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r={90} fill="url(#mini-glow)" />
        {PLANETS.map((p, i) => {
          const r = 46 + i * 26;
          const size = Math.max(3.5, Math.sqrt(p.radiusKm) / 22);
          const period = (p.orbitalPeriodDays ?? 365) / 365.25; // years
          const duration = Math.min(period * 20, 2000);
          return (
            <g key={p.id}>
              <circle r={r} fill="none" stroke="var(--border-strong)" strokeWidth={1} />
              <g
                style={{
                  transform: `rotate(${-longitudes[p.id]}deg)`,
                  transformOrigin: "0 0",
                }}
              >
                <g
                  style={{
                    animation: reduced ? undefined : `orbit-spin ${duration}s linear infinite reverse`,
                    transformOrigin: "0 0",
                  }}
                >
                  {p.hasRings && <ellipse cx={r} cy={0} rx={size * 2} ry={size * 0.6} fill="none" stroke="#E7D3A8" strokeWidth={1.5} />}
                  <circle cx={r} cy={0} r={size} fill={p.color} />
                </g>
              </g>
            </g>
          );
        })}
        <circle r={26} fill="url(#mini-sun)" />
      </svg>
      <span className="glass absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-ink opacity-90 shadow-soft transition-opacity group-hover:opacity-100">
        Live positions for today · open in 3D →
      </span>
    </Link>
  );
}
