"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, ProgressRing } from "@/components/ui/primitives";
import { BadgeMedal } from "@/components/learn/badge-medal";
import { PathIcon } from "@/components/learn/path-icon";
import { getPath } from "@/data/learning-paths";
import { useProgress } from "@/lib/store";
import { useMounted } from "@/lib/hooks";

export function PathOverview({ pathId }: { pathId: string }) {
  const path = getPath(pathId)!;
  const mounted = useMounted();
  const done = useProgress((s) => s.completedLessons[pathId]) ?? [];
  const badges = useProgress((s) => s.badges);
  const completed = mounted ? done : [];
  const next = path.lessons.find((l) => !completed.includes(l.id)) ?? path.lessons[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All paths
      </Link>
      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-6 p-6 sm:p-8 [background:var(--path-bg)] dark:[background:var(--gradient)]" style={{ "--path-bg": path.gradient } as React.CSSProperties}>
          <div className="grid size-16 place-items-center rounded-3xl bg-white/70 text-primary shadow-sm dark:bg-slate-900/50">
            <PathIcon name={path.icon} className="size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl">{path.title}</h1>
            <p className="mt-1 text-body">{path.description}</p>
          </div>
          <ProgressRing value={completed.length / path.lessons.length} size={72} stroke={7} label={`${completed.length}/${path.lessons.length}`} />
        </div>
        <ol className="divide-y divide-border">
          {path.lessons.map((l, i) => {
            const isDone = completed.includes(l.id);
            return (
              <li key={l.id}>
                <Link href={`/learn/${path.id}/${l.id}`} className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-surface-2 sm:px-8">
                  {isDone ? <CheckCircle2 className="size-6 shrink-0 text-emerald-500" aria-label="Completed" /> : <Circle className="size-6 shrink-0 text-faint" aria-label="Not started" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted">Lesson {i + 1}</div>
                    <div className="font-medium text-ink">{l.title}</div>
                    <div className="text-sm text-muted">{l.summary}</div>
                  </div>
                  <span className="hidden items-center gap-1 text-xs text-muted sm:flex">
                    <Clock className="size-3.5" /> {l.minutes} min
                  </span>
                  <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ol>
      </Card>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <ButtonLink href={`/learn/${path.id}/${next.id}`} size="lg">
          {completed.length === 0 ? "Start the first lesson" : completed.length === path.lessons.length ? "Review lessons" : "Continue"} <ArrowRight />
        </ButtonLink>
        <div className="flex items-center gap-3 text-sm text-muted">
          Finish all lessons to earn
          <BadgeMedal name={path.badge.name} earned={mounted && badges.includes(path.badge.id)} size={44} />
        </div>
      </div>
    </div>
  );
}
