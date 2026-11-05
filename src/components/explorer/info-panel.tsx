"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Rocket, Scale, Sparkles, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip, StatusBadge } from "@/components/ui/primitives";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { ObjectFacts } from "@/components/shared/object-facts";
import { getObject, moonsOf } from "@/data/objects";
import { SPACECRAFT, getMission } from "@/data/missions";
import { distanceFromEarthAu } from "@/lib/ephemeris";
import { useExplorer, useProgress, useUI } from "@/lib/store";
import { useIsMobile, useMounted } from "@/lib/hooks";
import { formatNumber } from "@/lib/utils";

const KIND_LABEL = { star: "Star", planet: "Planet", dwarf: "Dwarf planet", moon: "Moon" } as const;

/** Frosted side panel (desktop) / bottom sheet (mobile) with key facts for the focused object. */
export function InfoPanel() {
  const focusedId = useExplorer((s) => s.focusedId);
  const mobile = useIsMobile();
  return (
    <AnimatePresence>
      {focusedId && (
        <motion.aside
          key={focusedId}
          aria-label="Object details"
          className={
            mobile
              ? "glass absolute inset-x-0 bottom-0 z-20 max-h-[62dvh] overflow-y-auto rounded-t-3xl p-5 pb-28 shadow-lift"
              : "glass absolute bottom-44 right-4 top-20 z-20 w-[380px] overflow-y-auto rounded-3xl p-5 shadow-lift lg:bottom-24"
          }
          initial={mobile ? { y: "100%" } : { x: 24, opacity: 0 }}
          animate={mobile ? { y: 0 } : { x: 0, opacity: 1 }}
          exit={mobile ? { y: "100%" } : { x: 24, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          drag={mobile ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120) useExplorer.getState().focus(null);
          }}
        >
          {mobile && <div className="mx-auto -mt-2 mb-3 h-1.5 w-10 rounded-full bg-border-strong" aria-hidden />}
          {getObject(focusedId) ? <ObjectDetails id={focusedId} /> : <CraftDetails id={focusedId} />}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ObjectDetails({ id }: { id: string }) {
  const o = getObject(id)!;
  const focus = useExplorer((s) => s.focus);
  const time = useExplorer((s) => s.time);
  const ask = useUI((s) => s.ask);
  const favorites = useProgress((s) => s.favorites);
  const toggleFavorite = useProgress((s) => s.toggleFavorite);
  const mounted = useMounted();
  const fav = mounted && favorites.includes(id);
  const parent = o.parentId ? getObject(o.parentId) : undefined;
  const moons = moonsOf(id);
  const earthDistance = o.kind === "planet" || o.kind === "dwarf" || o.kind === "star" ? (id === "earth" ? null : distanceFromEarthAu(o, new Date(time))) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex w-[72px] shrink-0 justify-center pt-1">
          <PlanetOrb object={o} size={o.hasRings ? 40 : 52} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl">{o.name}</h2>
            <StatusBadge status="neutral">{KIND_LABEL[o.kind]}{parent ? ` of ${parent.name}` : ""}</StatusBadge>
          </div>
          <p className="mt-1 text-sm text-muted">{o.tagline}</p>
        </div>
        <button
          type="button"
          onClick={() => focus(null)}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink"
          aria-label="Close details"
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="text-[15px] text-body">{o.description}</p>

      {earthDistance !== null && (
        <div className="rounded-2xl bg-signature px-4 py-3 text-sm text-ink">
          Right now (simulated date) it&apos;s <span className="font-semibold tabular">{formatNumber(earthDistance, 2)} AU</span> from Earth — light takes{" "}
          <span className="font-semibold tabular">{formatNumber((earthDistance * 499) / 60, 1)} minutes</span> to cross that gap.
        </div>
      )}

      <ObjectFacts object={o} />

      <div>
        <h3 className="mb-2 text-sm">Made of</h3>
        <div className="flex flex-wrap gap-1.5">
          {o.composition.map((c) => (
            <span key={c} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-body">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" /> Fun fact
        </div>
        <p className="text-sm text-body">{o.funFact}</p>
      </div>

      {moons.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm">Major moons</h3>
          <div className="flex flex-wrap gap-1.5">
            {moons.map((m) => (
              <Chip key={m.id} onClick={() => focus(m.id)}>
                <PlanetOrb object={m} size={14} /> {m.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm">Ask about {o.name}</h3>
        <div className="flex flex-wrap gap-1.5">
          {o.suggestedQuestions.map((q) => (
            <Chip key={q} icon={MessageCircle} onClick={() => ask(q)}>
              {q}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button size="sm" onClick={() => ask(`Tell me something surprising about ${o.name}.`)}>
          <MessageCircle /> Ask Orbital
        </Button>
        <ButtonLink size="sm" variant="secondary" href={`/compare?a=${id}&b=${id === "earth" ? "moon" : "earth"}`}>
          <Scale /> Compare
        </ButtonLink>
        <Button size="sm" variant="ghost" onClick={() => toggleFavorite(id)} aria-pressed={fav}>
          <Heart className={fav ? "fill-rose-400 text-rose-400" : ""} /> {fav ? "Saved" : "Save"}
        </Button>
      </div>
      <div className="text-xs text-muted">
        Sources:{" "}
        {o.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
              {s.title}
            </a>
          </span>
        ))}
      </div>
    </div>
  );
}

function CraftDetails({ id }: { id: string }) {
  const craft = SPACECRAFT.find((c) => c.id === id);
  const focus = useExplorer((s) => s.focus);
  const ask = useUI((s) => s.ask);
  if (!craft) return null;
  const mission = getMission(craft.missionId);
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Rocket className="size-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl">{craft.name}</h2>
          {mission && <StatusBadge status={mission.status}>{mission.status}</StatusBadge>}
        </div>
        <button type="button" onClick={() => focus(null)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink" aria-label="Close details">
          <X className="size-4" />
        </button>
      </div>
      <p className="text-body">{craft.description}</p>
      {mission && <p className="text-sm text-body">{mission.goal}</p>}
      <p className="rounded-2xl bg-surface-2 px-3 py-2 text-xs text-muted">Position shown is approximate.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => ask(`Where is ${craft.name} now and what is it doing?`)}>
          <MessageCircle /> Ask about it
        </Button>
        {mission && (
          <Link href={`/missions#${mission.id}`} className="inline-flex h-8 items-center rounded-full border border-border-strong bg-surface px-3.5 text-sm text-ink hover:border-primary/40">
            Mission timeline
          </Link>
        )}
      </div>
    </div>
  );
}
