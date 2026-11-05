"use client";

import { Clock, Compass, Lightbulb } from "lucide-react";
import { ChatView } from "@/components/chat/chat-view";
import { useProgress, useUI } from "@/lib/store";
import { useMounted } from "@/lib/hooks";

const TOPICS = [
  { label: "The Sun", q: "How does the Sun make energy?" },
  { label: "Black holes", q: "What would happen if I fell into a black hole?" },
  { label: "Life beyond Earth", q: "Where are the best places to look for life in the solar system?" },
  { label: "Scale", q: "How far away is the nearest star, really?" },
  { label: "Missions", q: "What are Voyager 1 and 2 doing now?" },
  { label: "The Moon", q: "Why does the Moon have phases?" },
];

/** Full-page AI guide with recent questions and topic shortcuts. */
export function AskPage() {
  const recent = useProgress((s) => s.recentQuestions);
  const ask = useUI((s) => s.ask);
  const mounted = useMounted();

  return (
    <div className="mx-auto grid h-[calc(100dvh-4rem)] max-w-7xl gap-6 px-0 pb-24 sm:px-6 sm:pt-6 lg:grid-cols-[260px_1fr] lg:pb-6">
      <aside className="hidden flex-col gap-6 overflow-y-auto lg:flex">
        <div>
          <h1 className="text-2xl">Ask Orbital</h1>
          <p className="mt-1 text-sm text-muted">Your friendly guide to the universe.</p>
        </div>
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <Lightbulb className="size-3.5" /> Topics
          </h2>
          <ul className="grid gap-1">
            {TOPICS.map((t) => (
              <li key={t.label}>
                <button type="button" onClick={() => ask(t.q)} className="w-full rounded-xl px-3 py-2 text-left text-sm text-body hover:bg-surface hover:text-ink">
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <Clock className="size-3.5" /> Recent
          </h2>
          {mounted && recent.length > 0 ? (
            <ul className="grid gap-1">
              {recent.slice(0, 8).map((r) => (
                <li key={r.at}>
                  <button type="button" onClick={() => ask(r.text)} className="w-full truncate rounded-xl px-3 py-2 text-left text-sm text-body hover:bg-surface hover:text-ink">
                    {r.text}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 text-sm text-muted">Your questions will appear here.</p>
          )}
        </section>
        <a href="/explore" className="mt-auto flex items-center gap-2 rounded-2xl bg-signature p-4 text-sm text-ink">
          <Compass className="size-4 text-primary" /> Tip: open the 3D explorer — the guide knows what you&apos;re looking at.
        </a>
      </aside>
      <div className="card flex min-h-0 flex-col overflow-hidden rounded-none border-x-0 sm:rounded-3xl sm:border-x">
        <h1 className="sr-only lg:hidden">Ask Orbital</h1>
        <ChatView variant="page" />
      </div>
    </div>
  );
}
