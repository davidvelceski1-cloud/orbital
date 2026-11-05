"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, Segmented } from "@/components/ui/primitives";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { DWARF_PLANETS, PLANETS, SUN } from "@/data/objects";
import { formatNumber } from "@/lib/utils";

const REFERENCES = [
  { id: "basketball", label: "Basketball", diameterM: 0.24, emoji: "🏀" },
  { id: "beachball", label: "Beach ball", diameterM: 0.6, emoji: "🏖️" },
  { id: "grapefruit", label: "Grapefruit", diameterM: 0.12, emoji: "🍊" },
] as const;

function everydayThing(mm: number) {
  if (mm < 0.5) return "a grain of salt";
  if (mm < 1.2) return "a grain of sand";
  if (mm < 1.8) return "a poppy seed";
  if (mm < 3.5) return "a peppercorn";
  if (mm < 6) return "a lentil";
  if (mm < 11) return "a blueberry";
  if (mm < 18) return "a chickpea";
  if (mm < 30) return "a grape";
  if (mm < 60) return "a walnut";
  return "a tennis ball";
}

function everydayDistance(m: number) {
  if (m < 50) return "across a classroom or two";
  if (m < 150) return "about a football pitch away";
  if (m < 400) return "a few city blocks away";
  if (m < 1200) return "a 10-minute walk away";
  if (m < 3000) return "a half-hour walk away";
  return "across town";
}

/** "If the Sun were a basketball…" — relatable scale for every planet and the bigger dwarfs. */
export function DistanceLab() {
  const [refId, setRefId] = useState<(typeof REFERENCES)[number]["id"]>("basketball");
  const ref = REFERENCES.find((r) => r.id === refId)!;
  const k = ref.diameterM / (SUN.radiusKm * 2); // metres per km

  const rows = useMemo(
    () =>
      [...PLANETS, ...DWARF_PLANETS.filter((d) => ["pluto", "eris"].includes(d.id))]
        .sort((x, y) => (x.distanceFromSunKm ?? 0) - (y.distanceFromSunKm ?? 0))
        .map((o) => {
          const mm = o.radiusKm * 2 * k * 1000;
          const m = (o.distanceFromSunKm ?? 0) * k;
          return { o, mm, m };
        }),
    [k],
  );
  const maxM = rows[rows.length - 1].m;
  const earth = rows.find((r) => r.o.id === "earth")!;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg text-ink">
          If the Sun were a <span className="font-semibold">{ref.label.toLowerCase()}</span> {ref.emoji}, Earth would be{" "}
          <span className="font-semibold">{everydayThing(earth.mm)}</span> <span className="tabular font-semibold">{formatNumber(earth.m, 0)} m</span> away.
        </p>
        <Segmented label="Sun reference" size="sm" value={refId} onChange={setRefId} options={REFERENCES.map((r) => ({ value: r.id, label: `${r.emoji} ${r.label}` }))} />
      </div>

      {/* A walk outward on a square-root axis so the inner planets don't all pile up at zero */}
      <div className="relative mt-8 h-44 overflow-x-auto no-scrollbar">
        <div className="relative h-full min-w-[640px]">
          <div className="absolute left-0 right-4 top-1/2 h-px bg-border-strong" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl" aria-hidden>{ref.emoji}</div>
          {rows.map(({ o, m }, i) => {
            const pct = 4 + (Math.sqrt(m) / Math.sqrt(maxM)) * 92;
            // Four label tiers (near/far, above/below) so the crowded inner planets don't collide.
            const above = i % 2 === 1;
            const far = i % 4 >= 2;
            const label = (
              <span className="whitespace-nowrap text-[11px] text-muted tabular">
                {o.name} · {formatNumber(m, 0)} m
              </span>
            );
            return (
              <div key={o.id} className="absolute top-1/2" style={{ left: `${pct}%`, transform: `translate(-50%, ${above ? "-100%" : "0%"})` }}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center py-1"
                >
                  {above && label}
                  {above && <span className={far ? "h-7 w-px bg-border-strong" : "h-1"} aria-hidden />}
                  <PlanetOrb object={o} size={o.kind === "dwarf" ? 8 : 12} />
                  {!above && <span className={far ? "h-7 w-px bg-border-strong" : "h-1"} aria-hidden />}
                  {!above && label}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="py-2 font-medium">World</th>
              <th className="py-2 font-medium">Size at this scale</th>
              <th className="py-2 font-medium">Distance from the {ref.label.toLowerCase()}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ o, mm, m }) => (
              <tr key={o.id} className="border-b border-border/70 last:border-none">
                <td className="py-2.5">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <PlanetOrb object={o} size={18} /> {o.name}
                  </span>
                </td>
                <td className="py-2.5 text-body tabular">
                  {formatNumber(mm, mm < 10 ? 1 : 0)} mm — {everydayThing(mm)}
                </td>
                <td className="py-2.5 text-body tabular">
                  {m >= 1000 ? `${formatNumber(m / 1000, 1)} km` : `${formatNumber(m, 0)} m`} — {everydayDistance(m)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
