"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Layers, Pause, Play, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/controls";
import { Segmented } from "@/components/ui/primitives";
import { SPEEDS, useExplorer, type LayerKey, type SpeedId } from "@/lib/store";
import { setSimTime } from "@/components/explorer/sim-clock";
import { cn } from "@/lib/utils";

const LAYER_LABELS: Record<LayerKey, string> = {
  orbits: "Orbits",
  labels: "Labels",
  moons: "Major moons",
  asteroids: "Asteroid belt",
  kuiper: "Kuiper Belt",
  spacecraft: "Active spacecraft",
};

/** Bottom bar: play/pause, speed presets, date picker, jump to today. */
export function TimeControls({ className }: { className?: string }) {
  const { time, speed, setSpeed, setTime } = useExplorer();
  const [lastSpeed, setLastSpeed] = useState<SpeedId>("day");
  const date = new Date(time);
  const paused = speed === "pause";

  const jump = (t: number) => {
    setSimTime(t);
    setTime(t);
  };

  return (
    <div className={cn("glass flex flex-wrap items-center gap-2 rounded-3xl p-2 shadow-lift", className)}>
      <button
        type="button"
        onClick={() => {
          if (paused) setSpeed(lastSpeed);
          else {
            setLastSpeed(speed);
            setSpeed("pause");
          }
        }}
        className="grid size-10 place-items-center rounded-full text-white [background:var(--gradient-button)]"
        aria-label={paused ? "Play" : "Pause"}
      >
        {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
      </button>
      <Segmented
        label="Simulation speed"
        size="sm"
        value={speed}
        onChange={(v) => setSpeed(v)}
        options={SPEEDS.filter((s) => s.id !== "pause").map((s) => ({ value: s.id, label: s.label }))}
        className="max-w-full overflow-x-auto no-scrollbar"
      />
      <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-ink">
        <CalendarDays className="size-4 text-primary" aria-hidden />
        <span className="sr-only">Show positions on date</span>
        <input
          type="date"
          value={toInputDate(date)}
          min="1900-01-01"
          max="2100-12-31"
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m, d] = e.target.value.split("-").map(Number);
            jump(new Date(y, m - 1, d, 12).getTime());
          }}
          className="tabular bg-transparent outline-none"
        />
      </label>
      <button
        type="button"
        onClick={() => jump(Date.now())}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-surface hover:text-ink"
      >
        <RotateCcw className="size-3.5" /> Today
      </button>
    </div>
  );
}

function toInputDate(d: Date) {
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  if (y < 1900 || y > 2100) return "";
  return `${y}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function LayersMenu() {
  const { layers, toggleLayer } = useExplorer();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink shadow-soft"
      >
        <Layers className="size-4 text-primary" /> Layers
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="glass absolute right-0 top-12 z-30 w-60 rounded-2xl p-2 shadow-lift"
          >
            {(Object.keys(LAYER_LABELS) as LayerKey[]).map((k) => (
              <label key={k} className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface/70">
                {LAYER_LABELS[k]}
                <Switch checked={layers[k]} onCheckedChange={() => toggleLayer(k)} label={LAYER_LABELS[k]} />
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
