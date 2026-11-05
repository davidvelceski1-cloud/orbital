"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Space is mostly empty",
    body: "At true scale, if the Sun were a basketball, Earth would be a peppercorn 26 m away — and Neptune a marble almost 800 m away.",
  },
  {
    title: "So planets become specks",
    body: "Zoomed out far enough to see the orbits, even Jupiter is far smaller than a single pixel. We've added dots so you can still find them.",
  },
  {
    title: "Readable scale is a trade-off",
    body: "It shrinks distances and enlarges planets so everything fits. Switch back any time — both are useful ways to see.",
  },
];

/** Short animated explanation shown when switching to realistic scale. */
export function ScaleExplainer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Why real scale is hard to show"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="glass absolute left-1/2 top-20 z-30 w-[min(440px,calc(100%-2rem))] -translate-x-1/2 rounded-3xl p-5 shadow-lift"
        >
          <button type="button" onClick={onClose} className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink" aria-label="Close">
            <X className="size-4" />
          </button>
          <ScaleAnimation step={step} />
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h3 className="text-lg">{STEPS[step].title}</h3>
              <p className="mt-1 text-sm text-body">{STEPS[step].body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden>
              {STEPS.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary" : "w-1.5 bg-border-strong"}`} />
              ))}
            </div>
            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button size="sm" onClick={onClose}>Got it</Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScaleAnimation({ step }: { step: number }) {
  // Step 0: sizes shown big; step 1+: planets shrink and drift outward toward true spacing.
  const real = step >= 1;
  const planets = [
    { c: "#A8A29E", big: 6, x: 70, rx: 92 },
    { c: "#FCD9A8", big: 10, x: 95, rx: 120 },
    { c: "#60A5FA", big: 11, x: 122, rx: 150 },
    { c: "#F0937A", big: 8, x: 146, rx: 200 },
    { c: "#E8C4A0", big: 22, x: 182, rx: 380 },
  ];
  return (
    <div className="mb-4 overflow-hidden rounded-2xl bg-signature">
      <svg viewBox="0 0 400 80" className="h-20 w-full" aria-hidden>
        <motion.circle cx={10} cy={40} fill="#FDBA74" animate={{ r: real ? 9 : 32 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
        {planets.map((p, i) => (
          <motion.circle
            key={i}
            cy={40}
            fill={p.c}
            animate={{ cx: real ? p.rx : p.x, r: real ? Math.max(0.6, p.big / 14) : p.big / 2 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: i * 0.05 }}
          />
        ))}
        {real && (
          <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} x={330} y={70} fontSize={10} fill="#64748B">
            Jupiter →
          </motion.text>
        )}
      </svg>
    </div>
  );
}
