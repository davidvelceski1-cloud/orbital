"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Compass, Flame, Heart, Lightbulb, MessageCircle, Settings2, Sparkles, Trophy } from "lucide-react";
import { ButtonLink, Button } from "@/components/ui/button";
import { Card, Chip, EmptyState, ProgressRing, Segmented, Skeleton } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/controls";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { AccountCard } from "@/components/dashboard/account-card";
import { BadgeMedal } from "@/components/learn/badge-medal";
import { PathIcon } from "@/components/learn/path-icon";
import { LEARNING_PATHS, TOTAL_LESSONS, getLesson } from "@/data/learning-paths";
import { getObject } from "@/data/objects";
import { factOfTheDay } from "@/data/extras";
import { upcomingEvents } from "@/lib/sky";
import { usePrefs, useProgress, useUI, type ThemePref } from "@/lib/store";
import { useMounted } from "@/lib/hooks";
import type { ExplanationLevel } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function Dashboard() {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-5 md:grid-cols-3">
          <Skeleton className="h-48 md:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }
  return <DashboardContent />;
}

function DashboardContent() {
  const prefs = usePrefs();
  const progress = useProgress();
  const ask = useUI((s) => s.ask);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const done = Object.values(progress.completedLessons).reduce((n, l) => n + l.length, 0);
  const exploredCount = Object.keys(progress.explored).length;

  // Continue learning: the last lesson opened, or the first unfinished lesson of the first path.
  const continueTarget = useMemo(() => {
    const last = progress.lastLesson && getLesson(progress.lastLesson.pathId, progress.lastLesson.lessonId);
    if (last) {
      const finished = progress.completedLessons[last.path.id]?.includes(last.lesson.id);
      const next = finished ? last.path.lessons[last.index + 1] : last.lesson;
      if (next) return { path: last.path, lesson: next };
    }
    for (const p of LEARNING_PATHS) {
      const l = p.lessons.find((x) => !progress.completedLessons[p.id]?.includes(x.id));
      if (l) return { path: p, lesson: l };
    }
    return null;
  }, [progress.lastLesson, progress.completedLessons]);

  const events = useMemo(
    () => (prefs.location ? upcomingEvents(prefs.location.lat, prefs.location.lon).slice(0, 4) : []),
    [prefs.location],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl">
            {greeting()}
            {prefs.profile ? `, ${prefs.profile.name.split(" ")[0]}` : ""} ✨
          </h1>
          <p className="mt-1 text-body">Your personal corner of the universe.</p>
        </div>
        <div className="flex gap-2">
          <Stat icon={Flame} value={progress.streak.count} label="day streak" />
          <Stat icon={BookOpen} value={done} label="lessons" />
          <Stat icon={Compass} value={exploredCount} label="worlds explored" />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Continue learning */}
        <Card className="overflow-hidden lg:col-span-2">
          {continueTarget ? (
            <div className="flex h-full flex-col gap-5 p-6 sm:flex-row sm:items-center [background:var(--path-bg)] dark:[background:var(--gradient)]" style={{ "--path-bg": continueTarget.path.gradient } as React.CSSProperties}>
              <ProgressRing value={done / TOTAL_LESSONS} size={84} stroke={8} label={<PathIcon name={continueTarget.path.icon} className="size-7 text-primary" />} />
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Continue learning</div>
                <h2 className="mt-1 text-2xl">{continueTarget.lesson.title}</h2>
                <p className="text-sm text-body">
                  {continueTarget.path.title} · {continueTarget.lesson.minutes} min
                </p>
              </div>
              <ButtonLink href={`/learn/${continueTarget.path.id}/${continueTarget.lesson.id}`}>
                {done === 0 ? "Start" : "Continue"} <ArrowRight />
              </ButtonLink>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-6">
              <Trophy className="size-10 text-primary" />
              <div className="flex-1">
                <h2 className="text-xl">Every lesson complete!</h2>
                <p className="text-sm text-muted">Try a personalized quiz to keep your streak going.</p>
              </div>
              <ButtonLink href="/learn">Quiz me</ButtonLink>
            </div>
          )}
        </Card>

        {/* Fact of the day */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Lightbulb className="size-3.5" /> Fact of the day
          </div>
          <p className="mt-2 flex-1 font-display text-lg font-medium leading-snug text-ink">{factOfTheDay()}</p>
          <Button variant="soft" size="sm" className="mt-4 self-start" onClick={() => ask(`Tell me more about this: ${factOfTheDay()}`)}>
            <Sparkles /> Tell me more
          </Button>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent questions */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Recent questions</h2>
            <Link href="/ask" className="text-sm text-primary">Open chat</Link>
          </div>
          {progress.recentQuestions.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {progress.recentQuestions.slice(0, 6).map((q) => (
                <Chip key={q.at} icon={MessageCircle} onClick={() => ask(q.text)}>
                  {q.text.length > 48 ? `${q.text.slice(0, 46)}…` : q.text}
                </Chip>
              ))}
            </div>
          ) : (
            <EmptyState className="mt-3 border-none px-0 py-6" title="No questions yet" description="Ask anything — there are no silly questions about space." action={<Button size="sm" onClick={() => ask("What's the most mind-blowing fact about space?")}>Ask your first</Button>} />
          )}
        </Card>

        {/* Upcoming sky events */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Upcoming in your sky</h2>
            <Link href="/sky" className="text-sm text-primary">Tonight&apos;s Sky</Link>
          </div>
          {prefs.location ? (
            <ul className="mt-3 space-y-2">
              {events.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2">
                  <CalendarClock className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{e.title}</span>
                  <span className="text-xs text-muted tabular">{e.date.toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState className="mt-3 border-none px-0 py-6" title="Set your location" description="We'll show eclipses, meteor showers and planets for your sky." action={<ButtonLink size="sm" href="/sky">Choose location</ButtonLink>} />
          )}
        </Card>

        {/* APOD */}
        <ApodCard />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg">Mission badges</h2>
          <div className="mt-4 flex flex-wrap justify-around gap-5">
            {LEARNING_PATHS.map((p) => (
              <BadgeMedal key={p.badge.id} name={p.badge.name} earned={progress.badges.includes(p.badge.id)} />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="flex items-center gap-1.5 text-lg">
            <Heart className="size-4 text-rose-400" /> Saved worlds
          </h2>
          {progress.favorites.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {progress.favorites.map((id) => {
                const o = getObject(id);
                return o ? (
                  <Link key={id} href={`/explore?focus=${id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-ink hover:border-primary/40">
                    <PlanetOrb object={o} size={16} /> {o.name}
                  </Link>
                ) : null;
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Tap “Save” on any world in the explorer to keep it here.</p>
          )}
        </Card>
      </div>

      <AccountCard />

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg">
          <Settings2 className="size-4 text-primary" /> Preferences
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Setting label="Explanation level">
            <Segmented
              label="Default explanation level"
              size="sm"
              value={prefs.level}
              onChange={(v: ExplanationLevel) => prefs.set({ level: v })}
              options={[
                { value: "kid", label: "Like I'm 10" },
                { value: "adult", label: "Curious adult" },
                { value: "nerd", label: "Science nerd" },
              ]}
            />
          </Setting>
          <Setting label="Theme">
            <Segmented
              label="Theme"
              size="sm"
              value={prefs.theme}
              onChange={(v: ThemePref) => prefs.set({ theme: v })}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ]}
            />
          </Setting>
          <Setting label="Reduce motion">
            <Switch checked={prefs.reducedMotion ?? false} onCheckedChange={(v) => prefs.set({ reducedMotion: v })} label="Reduce motion" />
          </Setting>
          <Setting label="Sky location">
            <span className="text-sm text-body">{prefs.location?.label ?? "Not set"}</span>
            <ButtonLink href="/sky" size="sm" variant="ghost">Change</ButtonLink>
          </Setting>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="secondary" size="sm" onClick={() => setOnboardingOpen(true)}>Redo onboarding</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Reset all progress, badges and chat history on this device?")) progress.resetAll();
            }}
          >
            Reset progress
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Flame; value: number; label: string }) {
  return (
    <div className="card flex items-center gap-2 px-4 py-2.5">
      <Icon className="size-4 text-primary" />
      <span className="font-display text-lg font-semibold text-ink tabular">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function ApodCard() {
  const [data, setData] = useState<{ title: string; url?: string; pageUrl: string; mediaType: string; copyright?: string } | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    fetch("/api/apod")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setData(d);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <Card className="overflow-hidden">
      {state === "loading" && <Skeleton className="h-full min-h-48 rounded-none" />}
      {state === "error" && (
        <div className="flex h-full flex-col justify-center p-6">
          <h2 className="text-lg">NASA picture of the day</h2>
          <p className="mt-1 text-sm text-muted">Couldn&apos;t load today&apos;s picture.</p>
          <a href="https://apod.nasa.gov/apod/" target="_blank" rel="noreferrer" className="mt-3 text-sm text-primary">View on apod.nasa.gov →</a>
        </div>
      )}
      {state === "ready" && data && (
        <a href={data.pageUrl} target="_blank" rel="noreferrer" className="group relative block h-full min-h-48">
          {data.url && (
            // eslint-disable-next-line @next/next/no-img-element -- external, frequently-changing NASA image
            <img src={data.url} alt={data.title} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/80">NASA picture of the day</div>
            <div className="font-medium leading-snug">{data.title}</div>
            {data.copyright && <div className="text-[11px] text-white/70">© {data.copyright}</div>}
          </div>
        </a>
      )}
    </Card>
  );
}
