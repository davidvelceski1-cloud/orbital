"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { SizeComparison, resolveComparable } from "@/components/shared/size-comparison";
import { ALL_OBJECTS } from "@/data/objects";
import { PLACES } from "@/data/extras";
import { cn } from "@/lib/utils";

type Slot = "a" | "b";

const PRESETS: [string, string][] = [
  ["earth", "jupiter"],
  ["moon", "usa"],
  ["sun", "earth"],
  ["pluto", "moon"],
  ["ganymede", "mercury"],
];

/**
 * Drag a chip onto slot A or B (desktop), or tap a slot then tap a chip (touch & keyboard).
 * Selections are mirrored to the URL so comparisons are shareable.
 */
export function SizeLab() {
  const params = useSearchParams();
  const router = useRouter();
  const [a, setA] = useState(params.get("a") ?? "earth");
  const [b, setB] = useState(params.get("b") ?? "jupiter");
  const [active, setActive] = useState<Slot>("a");
  const [over, setOver] = useState<Slot | null>(null);

  useEffect(() => {
    router.replace(`/compare?a=${a}&b=${b}`, { scroll: false });
  }, [a, b, router]);

  const assign = (slot: Slot, id: string) => {
    if (slot === "a") setA(id);
    else setB(id);
    setActive(slot === "a" ? "b" : "a");
  };

  const items = [
    ...ALL_OBJECTS.map((o) => ({ id: o.id, label: o.name, orb: o })),
    ...PLACES.map((p) => ({ id: p.id, label: p.name, emoji: p.emoji })),
  ];

  return (
    <Card className="p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {(["a", "b"] as const).map((slot, i) => {
              const id = slot === "a" ? a : b;
              const c = resolveComparable(id);
              const orb = ALL_OBJECTS.find((o) => o.id === id);
              return (
                <div key={slot} className={cn("contents")}>
                  {i === 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setA(b);
                        setB(a);
                      }}
                      className="grid size-9 place-items-center rounded-full border border-border bg-surface text-muted hover:text-ink"
                      aria-label="Swap"
                    >
                      <ArrowLeftRight className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActive(slot)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOver(slot);
                    }}
                    onDragLeave={() => setOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setOver(null);
                      const id = e.dataTransfer.getData("text/plain");
                      if (resolveComparable(id)) assign(slot, id);
                    }}
                    aria-pressed={active === slot}
                    aria-label={`Slot ${slot.toUpperCase()}: ${c?.name}. Select, then choose an object.`}
                    className={cn(
                      "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 transition-all",
                      active === slot ? "border-primary/50 bg-primary-soft/60" : "border-border-strong bg-surface-2",
                      over === slot && "scale-[1.02] border-primary bg-primary-soft",
                    )}
                  >
                    {orb ? <PlanetOrb object={orb} size={32} /> : <span className="text-2xl">{PLACES.find((p) => p.id === id)?.emoji}</span>}
                    <span className="text-sm font-medium text-ink">{c?.name}</span>
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Drag an object onto a slot — or tap a slot, then tap an object.</p>

          <div className="mt-4 flex max-h-64 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", it.id)}
                onClick={() => assign(active, it.id)}
                className={cn(
                  "inline-flex cursor-grab items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition-all hover:-translate-y-px active:cursor-grabbing",
                  it.id === a || it.id === b ? "border-primary/40 bg-primary-soft text-primary-strong" : "border-border bg-surface text-body hover:border-primary/30",
                )}
              >
                <GripVertical className="size-3 text-faint" aria-hidden />
                {"orb" in it && it.orb ? <PlanetOrb object={it.orb} size={14} /> : <span aria-hidden>{"emoji" in it ? it.emoji : ""}</span>}
                {it.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            Try:
            {PRESETS.map(([x, y]) => (
              <button
                key={x + y}
                type="button"
                onClick={() => {
                  setA(x);
                  setB(y);
                }}
                className="rounded-full bg-surface-2 px-2.5 py-1 text-body hover:text-ink"
              >
                {resolveComparable(x)?.name} vs {resolveComparable(y)?.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <SizeComparison a={a} b={b} maxPx={240} className="border-none bg-signature" />
        </div>
      </div>
    </Card>
  );
}
