"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, Segmented } from "@/components/ui/primitives";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { getObject } from "@/data/objects";
import { formatNumber } from "@/lib/utils";

const WORLDS = ["mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "titan", "sun"];

function feeling(ratio: number) {
  if (ratio > 20) return "You couldn't stand up";
  if (ratio > 2) return "Like carrying another you";
  if (ratio > 1.05) return "A bit heavier";
  if (ratio > 0.95) return "Home sweet home";
  if (ratio > 0.3) return "Bouncy steps";
  if (ratio > 0.1) return "Moon-walk mode";
  return "Floaty!";
}

/** "Your weight on…" — the same mass, different gravity. */
export function WeightLab() {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [weight, setWeight] = useState(60);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="weight" className="text-ink">
          On Earth I weigh
        </label>
        <input
          id="weight"
          type="number"
          inputMode="decimal"
          min={1}
          max={1000}
          value={weight}
          onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
          className="h-10 w-24 rounded-full border border-border-strong bg-surface px-4 text-ink tabular outline-none focus:border-primary/50"
        />
        <Segmented label="Unit" size="sm" value={unit} onChange={setUnit} options={[{ value: "kg", label: "kg" }, { value: "lb", label: "lb" }]} />
      </div>
      <p className="mt-2 text-xs text-muted">Your mass never changes — only how hard each world pulls on it. (Giant planets are measured at their cloud tops; you couldn&apos;t actually stand there.)</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {WORLDS.map((id, i) => {
          const o = getObject(id)!;
          const ratio = o.gravity / 9.81;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                <PlanetOrb object={o} size={22} />
                <span className="font-medium text-ink">{o.name}</span>
              </div>
              <div className="mt-3 font-display text-2xl font-semibold text-ink tabular">
                {formatNumber(weight * ratio, weight * ratio < 10 ? 1 : 0)} <span className="text-base font-medium text-muted">{unit}</span>
              </div>
              <div className="text-xs text-muted">{feeling(ratio)}</div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
