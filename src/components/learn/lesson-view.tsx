"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, MessageCircle, PartyPopper } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { LessonDiagram } from "@/components/learn/diagrams";
import { Quiz } from "@/components/learn/quiz";
import { BadgeMedal } from "@/components/learn/badge-medal";
import { getLesson } from "@/data/learning-paths";
import { useProgress, useUI } from "@/lib/store";

/** Render **bold** markers in lesson text without pulling in a markdown parser. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function LessonView({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const { path, lesson, index } = getLesson(pathId, lessonId)!;
  const completeLesson = useProgress((s) => s.completeLesson);
  const setLastLesson = useProgress((s) => s.setLastLesson);
  const ask = useUI((s) => s.ask);
  const [finished, setFinished] = useState<{ score: number; badge: boolean } | null>(null);
  const next = path.lessons[index + 1];

  useEffect(() => {
    setLastLesson(pathId, lessonId);
    setFinished(null);
  }, [pathId, lessonId, setLastLesson]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/learn" className="hover:text-ink">Learn</Link>
        <span>/</span>
        <Link href={`/learn/${path.id}`} className="hover:text-ink">{path.title}</Link>
      </nav>

      <div className="mt-4 flex gap-1.5" aria-label={`Lesson ${index + 1} of ${path.lessons.length}`}>
        {path.lessons.map((l, i) => (
          <span key={l.id} className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-border-strong"}`} />
        ))}
      </div>

      <header className="mt-6">
        <div className="flex items-center gap-2 text-xs text-muted">
          Lesson {index + 1} of {path.lessons.length} · <Clock className="size-3.5" /> {lesson.minutes} min
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl">{lesson.title}</h1>
        <p className="mt-2 text-lg text-body">{lesson.summary}</p>
      </header>

      <div className="mt-8 space-y-4 text-[17px] leading-relaxed text-body">
        {lesson.body.map((p, i) => (
          <p key={i}>
            <RichText text={p} />
          </p>
        ))}
      </div>

      <figure className="mt-10">
        <LessonDiagram kind={lesson.diagram} />
        <figcaption className="mt-2 text-center text-sm text-muted">{lesson.diagramCaption}</figcaption>
      </figure>

      <div className="mt-6 flex justify-center">
        <Button variant="secondary" size="sm" onClick={() => ask(`I'm learning "${lesson.title}". Can you explain it another way?`)}>
          <MessageCircle /> Still curious? Ask Orbital
        </Button>
      </div>

      <section className="mt-12" aria-labelledby="quiz-title">
        <h2 id="quiz-title" className="mb-4 text-2xl">Quick check</h2>
        <Quiz
          key={lessonId}
          questions={lesson.quiz}
          onComplete={(score) => {
            const badge = completeLesson(path.id, lesson.id, score, path.lessons.length, path.badge.id);
            setFinished({ score, badge });
          }}
        />
      </section>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-8 rounded-3xl border border-border bg-surface p-6 text-center shadow-lift"
            role="status"
          >
            {finished.badge ? (
              <>
                <BadgeMedal name={path.badge.name} earned size={72} className="mx-auto" />
                <h3 className="mt-3 text-xl">Mission badge earned!</h3>
                <p className="text-sm text-muted">{path.badge.description}. Brilliant work.</p>
              </>
            ) : (
              <>
                <PartyPopper className="mx-auto size-8 text-primary" />
                <h3 className="mt-2 text-xl">Lesson complete</h3>
                <p className="text-sm text-muted">Progress saved. Keep your streak going!</p>
              </>
            )}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {next ? (
                <ButtonLink href={`/learn/${path.id}/${next.id}`}>
                  Next: {next.title} <ArrowRight />
                </ButtonLink>
              ) : (
                <ButtonLink href="/learn">
                  Explore more paths <ArrowRight />
                </ButtonLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex justify-between border-t border-border pt-6 text-sm">
        {index > 0 ? (
          <Link href={`/learn/${path.id}/${path.lessons[index - 1].id}`} className="inline-flex items-center gap-1 text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> {path.lessons[index - 1].title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/learn/${path.id}/${next.id}`} className="inline-flex items-center gap-1 text-muted hover:text-ink">
            {next.title} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </article>
  );
}
