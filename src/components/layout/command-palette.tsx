"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { BookOpen, Rocket, Search, Sparkles } from "lucide-react";
import { ALL_OBJECTS } from "@/data/objects";
import { LEARNING_PATHS } from "@/data/learning-paths";
import { MISSIONS } from "@/data/missions";
import { NAV_ITEMS, DASHBOARD_ITEM } from "@/components/layout/nav-config";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { useExplorer, useUI } from "@/lib/store";

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-body data-[selected=true]:bg-primary-soft data-[selected=true]:text-ink";
const groupClass =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted";

/** Global ⌘K palette: jump to any object, lesson, mission or page — or ask the AI directly. */
export function CommandPalette() {
  const router = useRouter();
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPaletteOpen);
  const ask = useUI((s) => s.ask);
  const focus = useExplorer((s) => s.focus);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!useUI.getState().paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const go = (fn: () => void) => {
    setOpen(false);
    setQuery("");
    fn();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-surface shadow-lift"
        >
          <Dialog.Title className="sr-only">Search Orbital</Dialog.Title>
          <Command label="Search Orbital" loop>
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 text-faint" aria-hidden />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Jump to a planet, lesson or mission — or ask a question"
                className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
              />
              <kbd className="rounded-md border border-border bg-surface-2 px-1.5 text-[11px] text-muted">Esc</kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-sm text-muted">No matches — press Enter on “Ask Orbital” to ask the AI.</Command.Empty>

              {query.trim().length > 1 && (
                <Command.Group heading="Ask the AI guide" className={groupClass} forceMount>
                  <Command.Item value={`ask ${query}`} forceMount onSelect={() => go(() => ask(query))} className={itemClass}>
                    <span className="grid size-7 place-items-center rounded-full text-white [background:var(--gradient-button)]">
                      <Sparkles className="size-3.5" />
                    </span>
                    Ask Orbital: <span className="font-medium text-ink">“{query}”</span>
                  </Command.Item>
                </Command.Group>
              )}

              <Command.Group heading="Solar system" className={groupClass}>
                {ALL_OBJECTS.map((o) => (
                  <Command.Item
                    key={o.id}
                    value={`${o.name} ${o.kind}`}
                    onSelect={() =>
                      go(() => {
                        focus(o.id);
                        router.push(`/explore?focus=${o.id}`);
                      })
                    }
                    className={itemClass}
                  >
                    <PlanetOrb object={o} size={22} />
                    <span className="text-ink">{o.name}</span>
                    <span className="ml-auto text-xs capitalize text-muted">{o.kind === "dwarf" ? "Dwarf planet" : o.kind}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Lessons" className={groupClass}>
                {LEARNING_PATHS.flatMap((p) =>
                  p.lessons.map((l) => (
                    <Command.Item key={`${p.id}/${l.id}`} value={`${l.title} ${p.title}`} onSelect={() => go(() => router.push(`/learn/${p.id}/${l.id}`))} className={itemClass}>
                      <BookOpen className="size-4 text-primary" />
                      <span className="text-ink">{l.title}</span>
                      <span className="ml-auto truncate text-xs text-muted">{p.title}</span>
                    </Command.Item>
                  )),
                )}
              </Command.Group>

              <Command.Group heading="Missions" className={groupClass}>
                {MISSIONS.map((m) => (
                  <Command.Item key={m.id} value={`${m.name} mission ${m.destination}`} onSelect={() => go(() => router.push(`/missions#${m.id}`))} className={itemClass}>
                    <Rocket className="size-4 text-primary" />
                    <span className="text-ink">{m.name}</span>
                    <span className="ml-auto text-xs text-muted tabular">{m.launchYear}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Pages" className={groupClass}>
                {[...NAV_ITEMS, DASHBOARD_ITEM].map((n) => (
                  <Command.Item key={n.href} value={`page ${n.label}`} onSelect={() => go(() => router.push(n.href))} className={itemClass}>
                    <n.icon className="size-4 text-primary" />
                    <span className="text-ink">{n.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
