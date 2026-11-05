"use client";

import { motion } from "framer-motion";
import { getObject } from "@/data/objects";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { comparisonSentence, resolveComparable, type Comparable } from "@/lib/comparison";
import { cn, formatNumber } from "@/lib/utils";

export { comparisonSentence, resolveComparable, type Comparable };

/**
 * Side-by-side, true relative size. The larger item fills `maxPx`;
 * anything that would render under 2px is shown as a dot with a "too small to see" note.
 */
export function SizeComparison({ a, b, maxPx = 180, className }: { a: string; b: string; maxPx?: number; className?: string }) {
  const A = resolveComparable(a);
  const B = resolveComparable(b);
  if (!A || !B) return null;
  const max = Math.max(A.diameterKm, B.diameterKm);

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-4", className)}>
      <div className="flex items-end justify-center gap-6 overflow-hidden sm:gap-10" style={{ minHeight: Math.min(maxPx, 220) + 40 }}>
        {[A, B].map((item) => (
          <ComparableItem key={item.id} item={item} px={(item.diameterKm / max) * maxPx} />
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-body">{comparisonSentence(A, B)}</p>
    </div>
  );
}

function ComparableItem({ item, px }: { item: Comparable; px: number }) {
  const tiny = px < 2;
  const size = Math.max(px, 2);
  const obj = getObject(item.id);
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 20 }}
        className="grid place-items-end"
      >
        {item.kind === "body" && obj ? (
          <PlanetOrb object={obj} size={size} />
        ) : (
          <div className="rounded-md bg-gradient-to-r from-emerald-300 to-sky-300" style={{ width: size, height: Math.max(6, Math.min(size * 0.35, 40)) }} />
        )}
      </motion.div>
      <div className="text-center">
        <div className="text-sm font-medium text-ink">{item.name}</div>
        <div className="text-xs text-muted tabular">
          {formatNumber(item.diameterKm)} km {item.kind === "place" ? "across" : "wide"}
          {tiny && " · too small to see at this scale"}
        </div>
      </div>
    </div>
  );
}
