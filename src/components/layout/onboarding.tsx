"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, LocateFixed, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { LogoMark } from "@/components/layout/logo";
import { INTERESTS } from "@/data/extras";
import { PRESET_CITIES } from "@/data/cities";
import { usePrefs, useUI } from "@/lib/store";
import type { ExplanationLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVELS: { value: ExplanationLevel; title: string; body: string; emoji: string }[] = [
  { value: "kid", title: "Explain like I'm 10", body: "Simple words, fun comparisons", emoji: "🧒" },
  { value: "adult", title: "Curious adult", body: "Plain language with key numbers", emoji: "🙂" },
  { value: "nerd", title: "Science nerd", body: "Physics, units and open questions", emoji: "🤓" },
];

/** First-visit onboarding: level → interests → (optional) location. Skippable at every step. */
export function Onboarding() {
  const prefs = usePrefs();
  const open = useUI((s) => s.onboardingOpen);
  const setOpen = useUI((s) => s.setOnboardingOpen);
  const [step, setStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Show once, a moment after first paint, if never completed or skipped.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!usePrefs.getState().onboarded) setOpen(true);
    }, 900);
    return () => clearTimeout(t);
  }, [setOpen]);

  const finish = () => {
    prefs.set({ onboarded: true });
    setOpen(false);
  };

  const locate = () => {
    if (!("geolocation" in navigator)) return setLocError("Location isn't available in this browser.");
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        prefs.set({ location: { lat: pos.coords.latitude, lon: pos.coords.longitude, label: "My location" } });
        setLocating(false);
      },
      () => {
        setLocError("We couldn't get your location — pick a nearby city instead.");
        setLocating(false);
      },
      { timeout: 10_000, maximumAge: 3_600_000 },
    );
  };

  const steps = [
    {
      title: "How should Orbital explain things?",
      body: "You can change this any time, right in the chat.",
      content: (
        <div className="grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => {
            const active = prefs.level === l.value;
            return (
              <button
                key={l.value}
                type="button"
                onClick={() => prefs.set({ level: l.value })}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5",
                  active ? "border-primary/50 bg-primary-soft shadow-soft" : "border-border bg-surface hover:border-primary/30",
                )}
              >
                <div className="text-2xl" aria-hidden>{l.emoji}</div>
                <div className="mt-2 font-medium text-ink">{l.title}</div>
                <div className="text-sm text-muted">{l.body}</div>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "What are you curious about?",
      body: "Pick as many as you like — we'll tailor suggestions and quizzes.",
      content: (
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const active = prefs.interests.includes(i.id);
            return (
              <Chip
                key={i.id}
                active={active}
                onClick={() =>
                  prefs.set({ interests: active ? prefs.interests.filter((x) => x !== i.id) : [...prefs.interests, i.id] })
                }
              >
                <span aria-hidden>{i.emoji}</span> {i.label}
              </Chip>
            );
          })}
        </div>
      ),
    },
    {
      title: "Want to know what's in your sky tonight?",
      body: "Optional. Your location stays on this device and is only used for sky calculations.",
      content: (
        <div className="space-y-4">
          <Button variant="secondary" onClick={locate} disabled={locating}>
            <LocateFixed /> {locating ? "Finding you…" : "Use my location"}
          </Button>
          {locError && <p className="text-sm text-rose-600 dark:text-rose-400">{locError}</p>}
          <div>
            <div className="mb-2 text-xs font-medium text-muted">Or choose a city</div>
            <div className="flex flex-wrap gap-2">
              {PRESET_CITIES.slice(0, 10).map((c) => (
                <Chip key={c.label} active={prefs.location?.label === c.label} icon={MapPin} onClick={() => prefs.set({ location: c })}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
          {prefs.location && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <Check className="size-4" /> Sky set for {prefs.location.label}
            </p>
          )}
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => (v ? setOpen(true) : finish())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(640px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border bg-surface shadow-lift">
          <div className="bg-signature px-6 pb-5 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogoMark />
                <span className="text-sm font-medium text-ink">Welcome to Orbital</span>
              </div>
              <button type="button" onClick={finish} className="rounded-full px-3 py-1 text-sm text-muted hover:bg-surface/60 hover:text-ink">
                Skip
              </button>
            </div>
            <div className="mt-5 flex gap-1.5" aria-label={`Step ${step + 1} of 3`}>
              {steps.map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-surface/70")} />
              ))}
            </div>
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <Dialog.Title className="font-display text-xl font-semibold text-ink">{current.title}</Dialog.Title>
                <Dialog.Description className="mb-5 mt-1 text-sm text-muted">{current.body}</Dialog.Description>
                {current.content}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
                <ArrowLeft /> Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button onClick={finish}>
                  Start exploring <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
