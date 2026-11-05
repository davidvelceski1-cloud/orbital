"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, Chip } from "@/components/ui/primitives";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { AU_KM, getObject } from "@/data/objects";
import { TRAVEL_MODES } from "@/data/extras";
import { distanceFromEarthAu } from "@/lib/ephemeris";
import { formatDuration, formatKm } from "@/lib/utils";

const DESTINATIONS = [
  { id: "moon", label: "The Moon" },
  { id: "sun", label: "The Sun" },
  { id: "venus", label: "Venus" },
  { id: "mars", label: "Mars" },
  { id: "jupiter", label: "Jupiter" },
  { id: "saturn", label: "Saturn" },
  { id: "neptune", label: "Neptune" },
  { id: "pluto", label: "Pluto" },
  { id: "proxima", label: "Proxima Centauri" },
] as const;

const LIGHT_YEAR_KM = 9.4607e12;

/** How long to get there by car, plane, rocket or light — using today's real distance. */
export function TravelLab() {
  const [dest, setDest] = useState<(typeof DESTINATIONS)[number]["id"]>("mars");
  const [mode, setMode] = useState<(typeof TRAVEL_MODES)[number]["id"]>("car");

  const km = useMemo(() => {
    if (dest === "moon") return 384_400;
    if (dest === "proxima") return 4.24 * LIGHT_YEAR_KM;
    if (dest === "sun") return AU_KM;
    return distanceFromEarthAu(getObject(dest)!, new Date()) * AU_KM;
  }, [dest]);

  const m = TRAVEL_MODES.find((t) => t.id === mode)!;
  const hours = km / m.kmh;
  const obj = dest === "proxima" ? null : getObject(dest);

  return (
    <Card className="p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-xs font-medium text-muted">Destination</div>
            <div className="flex flex-wrap gap-1.5">
              {DESTINATIONS.map((d) => (
                <Chip key={d.id} active={dest === d.id} onClick={() => setDest(d.id)}>
                  {d.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-muted">Travel by</div>
            <div className="flex flex-wrap gap-1.5">
              {TRAVEL_MODES.map((t) => (
                <Chip key={t.id} active={mode === t.id} onClick={() => setMode(t.id)}>
                  <span aria-hidden>{t.emoji}</span> {t.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-3xl bg-signature p-6 text-center">
          <div className="mx-auto mb-3 flex items-center gap-3 text-2xl" aria-hidden>
            <span>{m.emoji}</span>
            <span className="h-px w-16 bg-gradient-to-r from-primary/60 to-pink" />
            {obj ? <PlanetOrb object={obj} size={28} /> : <span>✨</span>}
          </div>
          <div className="text-sm text-body">
            {DESTINATIONS.find((d) => d.id === dest)!.label} is {dest === "proxima" ? "4.24 light-years" : formatKm(km)} away
            {["moon", "sun", "proxima"].includes(dest) ? "" : " today"}.
          </div>
          <motion.div key={`${dest}-${mode}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold text-ink tabular sm:text-5xl">
            {formatDuration(hours)}
          </motion.div>
          <div className="mt-1 text-sm text-muted">non-stop {m.label.toLowerCase()} at {m.kmh.toLocaleString("en-US")} km/h</div>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {TRAVEL_MODES.filter((t) => t.id !== "walk" && t.id !== mode).slice(0, 4).map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-surface p-3">
            <div className="text-xs text-muted">
              <span aria-hidden>{t.emoji}</span> {t.label}
            </div>
            <div className="mt-0.5 font-display font-semibold text-ink tabular">{formatDuration(km / t.kmh)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
