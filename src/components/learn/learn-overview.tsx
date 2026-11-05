"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Flame } from "lucide-react";
import { Card, ProgressRing } from "@/components/ui/primitives";
import { BadgeMedal } from "@/components/learn/badge-medal";
import { PathIcon } from "@/components/learn/path-icon";
import { PersonalQuiz } from "@/components/learn/personal-quiz";
import { LEARNING_PATHS, TOTAL_LESSONS } from "@/data/learning-paths";
import { useProgress } from "@/lib/store";
import { useMounted } from "@/lib/hooks";

export function LearnOverview() {
  const mounted = useMounted();
  const completed = useProgress((s) => s.completedLessons);
  const badges = useProgress((s) => s.badges);
  const streak = useProgress((s) => s.streak);
  const doneCount = mounted ? Object.values(completed).reduce((n, l) => n + l.length, 0) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Learning paths</div>
          <h1 className="mt-2 text-3xl sm:text-4xl">Bite-sized courses for curious minds</h1>
          <p className="mt-2 max-w-2xl text-body">Short reads, hands-on diagrams and a quick quiz in every lesson. Collect a mission badge for each path.</p>
        </div>
        <Card className="flex items-center gap-5 px-5 py-4">
          <ProgressRing value={doneCount / TOTAL_LESSONS} size={64} label={`${doneCount}/${TOTAL_LESSONS}`} />
          <div className="text-sm">
            <div className="font-medium text-ink">Lessons completed</div>
            <div className="mt-1 flex items-center gap-1.5 text-muted">
              <Flame className="size-4 text-orange-400" /> {mounted ? streak.count : 0}-day streak
            </div>
          </div>
        </Card>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {LEARNING_PATHS.map((p, i) => {
          const done = mounted ? (completed[p.id]?.length ?? 0) : 0;
          const minutes = p.lessons.reduce((n, l) => n + l.minutes, 0);
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link href={`/learn/${p.id}`} className="group block h-full">
                <Card hover className="flex h-full flex-col overflow-hidden">
                  <div
                    className="flex items-start justify-between gap-4 p-6 [background:var(--path-bg)] dark:[background:var(--gradient)]"
                    style={{ "--path-bg": p.gradient } as React.CSSProperties}
                  >
                    <div className="grid size-12 place-items-center rounded-2xl bg-white/70 text-primary shadow-sm dark:bg-slate-900/50">
                      <PathIcon name={p.icon} className="size-6" />
                    </div>
                    <ProgressRing value={done / p.lessons.length} size={48} stroke={5} label={`${done}/${p.lessons.length}`} />
                  </div>
                  <div className="flex flex-1 flex-col p-6 pt-5">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="rounded-full bg-surface-2 px-2 py-0.5">{p.level}</span>
                      <Clock className="size-3.5" /> {minutes} min · {p.lessons.length} lessons
                    </div>
                    <h2 className="mt-2 text-xl">{p.title}</h2>
                    <p className="mt-1 flex-1 text-sm text-body">{p.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {done === 0 ? "Start path" : done === p.lessons.length ? "Review" : "Continue"}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <PersonalQuiz />

      <section>
        <h2 className="mb-4 text-xl">Mission badges</h2>
        <Card className="flex flex-wrap justify-around gap-6 p-6">
          {LEARNING_PATHS.map((p) => (
            <BadgeMedal key={p.badge.id} name={p.badge.name} earned={mounted && badges.includes(p.badge.id)} />
          ))}
        </Card>
      </section>
    </div>
  );
}
