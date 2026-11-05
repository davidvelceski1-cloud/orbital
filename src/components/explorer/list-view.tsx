"use client";

import { DWARF_PLANETS, MOONS, PLANETS, SUN } from "@/data/objects";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { useExplorer } from "@/lib/store";
import { cn, formatKm, formatNumber, formatYearLength } from "@/lib/utils";
import type { CelestialObject } from "@/lib/types";

const GROUPS: { title: string; items: CelestialObject[] }[] = [
  { title: "Our star", items: [SUN] },
  { title: "Planets", items: PLANETS },
  { title: "Dwarf planets", items: DWARF_PLANETS },
  { title: "Major moons", items: MOONS },
];

/** Accessible alternative to the 3D view: every object as a keyboard-friendly list. */
export function ExplorerListView() {
  const focus = useExplorer((s) => s.focus);
  const focusedId = useExplorer((s) => s.focusedId);
  return (
    <div className="h-full overflow-y-auto px-4 pb-40 pt-20 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {GROUPS.map((g) => (
          <section key={g.title} aria-labelledby={`grp-${g.title}`}>
            <h2 id={`grp-${g.title}`} className="mb-3 text-lg">
              {g.title}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.items.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => focus(o.id)}
                    aria-pressed={focusedId === o.id}
                    className={cn(
                      "card flex w-full items-center gap-3 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift",
                      focusedId === o.id && "ring-2 ring-primary/40",
                    )}
                  >
                    <PlanetOrb object={o} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{o.name}</span>
                      <span className="block truncate text-xs text-muted">{o.tagline}</span>
                    </span>
                    <span className="hidden text-right text-xs text-muted tabular sm:block">
                      {formatNumber(o.radiusKm * 2)} km
                      <br />
                      {o.distanceFromSunKm ? formatKm(o.distanceFromSunKm) : o.orbitalPeriodDays ? formatYearLength(o.orbitalPeriodDays) : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
