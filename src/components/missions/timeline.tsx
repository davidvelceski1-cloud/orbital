"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Navigation, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip, StatusBadge } from "@/components/ui/primitives";
import { MISSIONS, MISSIONS_AS_OF } from "@/data/missions";
import { getObject } from "@/data/objects";
import { useExplorer } from "@/lib/store";
import type { MissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORTED = [...MISSIONS].sort((a, b) => (a.launchDate ?? `${a.launchYear}-12-31`).localeCompare(b.launchDate ?? `${b.launchYear}-12-31`));

/** Horizontal, scrollable missions timeline from Sputnik to Artemis and beyond. */
export function MissionsTimeline() {
  const router = useRouter();
  const focus = useExplorer((s) => s.focus);
  const [filter, setFilter] = useState<MissionStatus | "all">("all");
  const [highlight, setHighlight] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const shown = SORTED.filter((m) => filter === "all" || m.status === filter);

  // Deep links: /missions#voyager-1 scrolls that card into view and highlights it.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    setHighlight(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }));
  }, []);

  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  const whereNow = (target: string) => {
    if (["voyager-1", "voyager-2", "new-horizons", "juno", "jwst", "parker"].includes(target)) {
      const { layers, toggleLayer } = useExplorer.getState();
      if (!layers.spacecraft) toggleLayer("spacecraft");
    }
    focus(target);
    router.push(`/explore?focus=${target}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "active", "completed", "upcoming"] as const).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)} className="capitalize">
              {f} <span className="text-xs text-muted tabular">{f === "all" ? MISSIONS.length : MISSIONS.filter((m) => m.status === f).length}</span>
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon-sm" onClick={() => scrollBy(-1)} aria-label="Scroll earlier">
            <ArrowLeft />
          </Button>
          <Button variant="secondary" size="icon-sm" onClick={() => scrollBy(1)} aria-label="Scroll later">
            <ArrowRight />
          </Button>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar -mx-4 snap-x snap-mandatory overflow-x-auto px-4 pb-6 sm:-mx-6 sm:px-6" tabIndex={0} aria-label="Missions timeline">
        <ol className="relative flex gap-5 pt-10">
          <div className="absolute left-0 right-0 top-[19px] h-0.5 rounded-full bg-signature-strong opacity-40" aria-hidden />
          {shown.map((m, i) => (
            <motion.li
              key={m.id}
              id={m.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px -40px" }}
              transition={{ delay: Math.min(i, 6) * 0.04 }}
              className="relative w-[300px] shrink-0 snap-center sm:w-[320px]"
            >
              <div className="absolute -top-[30px] left-6 flex items-center gap-2">
                <span className={cn("size-3 rounded-full ring-4 ring-bg", m.status === "active" ? "bg-emerald-400" : m.status === "upcoming" ? "bg-sky" : "bg-primary")} />
                <span className="font-display text-sm font-semibold text-ink tabular">{m.launchYear}</span>
              </div>
              <article className={cn("card flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift", highlight === m.id && "ring-2 ring-primary/50")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg leading-snug">{m.name}</h3>
                    <div className="text-xs text-muted">{m.agency}</div>
                  </div>
                  <StatusBadge status={m.status} className="capitalize">{m.status}</StatusBadge>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                  {m.crewed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-peach/25 px-2 py-0.5 text-orange-700 dark:text-orange-300">
                      <Users className="size-3" /> Crewed
                    </span>
                  )}
                  <span>→ {m.destination}</span>
                </div>
                <p className="mt-3 text-sm text-body">{m.goal}</p>
                {m.discoveries.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-body">
                    {m.discoveries.slice(0, 3).map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-pink" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                {m.statusNote && <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">{m.statusNote}</p>}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  {m.explorerTarget && (
                    <Button size="sm" variant="soft" onClick={() => whereNow(m.explorerTarget!)}>
                      <Navigation /> {m.spacecraftId ? "Where is it now?" : `Show ${getObject(m.explorerTarget)?.name ?? "in 3D"}`}
                    </Button>
                  )}
                  <a href={m.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                    {m.source.publisher === "Other" ? "Source" : m.source.publisher} <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </article>
            </motion.li>
          ))}
        </ol>
      </div>
      <p className="text-xs text-muted">Statuses as of {MISSIONS_AS_OF}. Upcoming launch dates often move — check the linked agency pages for the latest.</p>
    </div>
  );
}
