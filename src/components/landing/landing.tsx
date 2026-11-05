"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarClock, Compass, GraduationCap, MessageCircle, Rocket, Scale, Sparkles, Telescope, Users } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, Chip } from "@/components/ui/primitives";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { LogoMark } from "@/components/layout/logo";
import { MiniSolarSystem } from "@/components/landing/mini-system";
import { SizeComparison } from "@/components/shared/size-comparison";
import { ALL_OBJECTS, getObject } from "@/data/objects";
import { MISSIONS } from "@/data/missions";
import { TOTAL_LESSONS } from "@/data/learning-paths";
import { useUI } from "@/lib/store";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/** Above-the-fold content animates on mount, never waiting on scroll observers. */
const heroIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export function Landing() {
  const setChatOpen = useUI((s) => s.setChatOpen);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-signature opacity-80" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-bg" aria-hidden />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <motion.div {...heroIn} className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-medium text-primary-strong backdrop-blur dark:border-white/10 dark:bg-white/5">
              <Sparkles className="size-3.5" /> Your AI guide to the solar system
            </motion.div>
            {/* The headline is the LCP element: no fade, so it paints immediately. */}
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Understand the universe, <span className="text-gradient">one question at a time.</span>
            </h1>
            <motion.p {...heroIn} transition={{ ...heroIn.transition, delay: 0.1 }} className="mt-5 max-w-xl text-lg text-body">
              Fly through a live 3D solar system, ask anything in plain language, and build real understanding with bite-sized lessons — at your own level, from age 12 to rocket scientist.
            </motion.p>
            <motion.div {...heroIn} transition={{ ...heroIn.transition, delay: 0.15 }} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/explore" size="lg">
                Start exploring <ArrowRight />
              </ButtonLink>
              <Button size="lg" variant="secondary" onClick={() => setChatOpen(true)}>
                <MessageCircle /> Ask a question
              </Button>
            </motion.div>
            <motion.p {...heroIn} transition={{ ...heroIn.transition, delay: 0.2 }} className="mt-6 text-sm text-muted">
              Free to explore · No account needed · Facts sourced from NASA, ESA & JPL
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mx-auto w-full max-w-[520px]">
            <MiniSolarSystem />
          </motion.div>
        </div>
      </section>

      {/* Bento features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <motion.div {...fadeUp} className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Everything in one calm place</div>
          <h2 className="mt-2 text-3xl sm:text-4xl">Six ways to fall in love with space</h2>
        </motion.div>
        <div className="mt-10 grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-6">
          <Bento className="md:col-span-4" href="/explore" icon={Compass} title="3D Solar System Explorer" body="Rotate, zoom and travel through time. Click any world to fly there and see its key facts.">
            <div className="mt-4 flex items-end gap-3">
              {["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"].map((id, i) => (
                <motion.div key={id} animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}>
                  <PlanetOrb object={getObject(id)!} size={[12, 18, 19, 14, 44, 38, 26, 25][i]} />
                </motion.div>
              ))}
            </div>
          </Bento>
          <Bento className="md:col-span-2" href="/ask" icon={MessageCircle} title="Ask Orbital" body="An AI guide that explains at your level — like you're 10, a curious adult or a science nerd.">
            <div className="mt-4 space-y-2 text-sm">
              <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-primary-soft px-3 py-1.5 text-ink">Is Pluto a planet?</div>
              <div className="w-fit rounded-2xl rounded-bl-md border border-border bg-surface px-3 py-1.5 text-body">It&apos;s a dwarf planet — here&apos;s why…</div>
            </div>
          </Bento>
          <Bento className="md:col-span-2" href="/compare" icon={Scale} title="Scale & Comparison Lab" body="Earth vs Jupiter, the Moon vs the USA — true relative sizes, distances and travel times.">
            <div className="mt-4 flex items-end justify-center gap-4">
              <PlanetOrb object={getObject("jupiter")!} size={70} />
              <PlanetOrb object={getObject("earth")!} size={6.4} />
            </div>
          </Bento>
          <Bento className="md:col-span-2" href="/learn" icon={GraduationCap} title="Learning Paths" body={`${TOTAL_LESSONS} bite-sized lessons with interactive diagrams, quizzes and mission badges.`}>
            <div className="mt-4 flex gap-2">
              {["Grand Tour", "Stellar Nursery", "Event Horizon"].map((b) => (
                <span key={b} className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white [background:var(--gradient-strong)]">{b}</span>
              ))}
            </div>
          </Bento>
          <Bento className="md:col-span-2" href="/sky" icon={CalendarClock} title="Tonight's Sky" body="Which planets are up, where to look, the Moon phase, eclipses, meteor showers and ISS passes.">
            <div className="mt-4 text-sm text-ink">🪐 Look south-east, about 3 fists up</div>
          </Bento>
          <Bento className="md:col-span-6" href="/missions" icon={Rocket} title="Missions Timeline" body="From Sputnik to Apollo to Artemis — every mission card shows its discoveries and where it is now.">
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
              {MISSIONS.slice(0, 12).map((m) => (
                <span key={m.id} className="shrink-0 rounded-full border border-border bg-surface px-3 py-1 text-xs text-body">
                  <span className="tabular text-muted">{m.launchYear}</span> · {m.name}
                </span>
              ))}
            </div>
          </Bento>
        </div>
      </section>

      {/* Sample conversation */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Ask Orbital</div>
            <h2 className="mt-2 text-3xl sm:text-4xl">Answers that actually make sense</h2>
            <p className="mt-3 text-lg text-body">
              Orbital explains with analogies, true-to-scale visuals and a “Show me” button that flies the 3D explorer straight to what you&apos;re asking about. It cites NASA, ESA and JPL — and it tells you plainly when science doesn&apos;t know yet.
            </p>
            <ul className="mt-6 space-y-2 text-body">
              {["Three explanation levels, switchable any time", "Knows what you're looking at in the explorer", "Suggested follow-ups to keep you curious"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-primary-soft text-primary">✓</span> {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp}>
            <Card className="p-5 shadow-lift">
              <div className="flex justify-end">
                <div className="rounded-3xl rounded-br-lg bg-primary-soft px-4 py-2.5 text-ink">How big is Jupiter compared to Earth?</div>
              </div>
              <div className="mt-4 flex gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-signature ring-1 ring-border">
                  <LogoMark className="size-5" />
                </div>
                <div className="space-y-3 text-[15px] text-body">
                  <p>
                    <strong className="text-ink">Enormous!</strong> Jupiter is about 11 times wider than Earth — line up 11 Earths and they&apos;d just stretch across it. By volume, more than 1,300 Earths could fit inside.
                  </p>
                  <SizeComparison a="jupiter" b="earth" maxPx={120} />
                  <div className="flex flex-wrap gap-2">
                    <Chip icon={Sparkles}>Could Jupiter become a star?</Chip>
                    <Chip icon={Sparkles}>What is the Great Red Spot?</Chip>
                  </div>
                  <div className="text-xs text-muted">
                    <BookOpen className="mr-1 inline size-3" /> Source: NASA Planetary Fact Sheet
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Audience / proof */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <motion.div {...fadeUp} className="rounded-[28px] bg-signature p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <h2 className="text-3xl">Built for every kind of curious</h2>
              <p className="mt-3 text-body">Grounded in open data from the agencies that actually fly the missions.</p>
              <div className="mt-6 flex flex-wrap gap-6 font-display text-xl font-semibold text-ink/70">
                <span>NASA</span>
                <span>ESA</span>
                <span>JPL</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <Num value={ALL_OBJECTS.length} label="worlds to explore" />
                <Num value={MISSIONS.length} label="missions" />
                <Num value={TOTAL_LESSONS} label="lessons" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: GraduationCap, t: "Students", b: "Homework help that explains the why, plus quizzes that make it stick." },
                { icon: Users, t: "Teachers", b: "Ready-made lessons and true-scale visuals to project in class." },
                { icon: BookOpen, t: "Lifelong learners", b: "Finally understand black holes, seasons and the Big Bang." },
                { icon: Telescope, t: "Stargazers", b: "Know what's up tonight and never miss an eclipse or meteor shower." },
              ].map((x) => (
                <Card key={x.t} className="p-5">
                  <x.icon className="size-5 text-primary" />
                  <div className="mt-2 font-medium text-ink">{x.t}</div>
                  <p className="text-sm text-muted">{x.b}</p>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
        <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl">The universe is waiting.</motion.h2>
        <motion.p {...fadeUp} className="mt-3 text-lg text-body">Start with a single question. See where it takes you.</motion.p>
        <motion.div {...fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/explore" size="lg">Start exploring <ArrowRight /></ButtonLink>
          <ButtonLink href="/learn" size="lg" variant="secondary">Browse lessons</ButtonLink>
        </motion.div>
      </section>
    </div>
  );
}

function Bento({
  className,
  href,
  icon: Icon,
  title,
  body,
  children,
}: {
  className?: string;
  href: string;
  icon: typeof Compass;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div {...fadeUp} className={className}>
      <Link href={href} className="group block h-full">
        <Card hover className="flex h-full flex-col p-6">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon className="size-[18px]" />
            </span>
            <h3 className="text-lg">{title}</h3>
            <ArrowRight className="ml-auto size-4 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <p className="mt-2 text-sm text-body">{body}</p>
          <div className="mt-auto">{children}</div>
        </Card>
      </Link>
    </motion.div>
  );
}

function Num({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold text-ink tabular">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
