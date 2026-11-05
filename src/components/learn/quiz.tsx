"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A friendly 3-question quiz. Reports the score once every question is answered. */
export function Quiz({ questions, onComplete }: { questions: QuizQuestion[]; onComplete?: (score: number) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const done = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a === questions[i].answerIndex).length;

  const choose = (qi: number, oi: number) => {
    if (answers[qi] !== null) return;
    const next = answers.map((a, i) => (i === qi ? oi : a));
    setAnswers(next);
    if (next.every((a) => a !== null)) onComplete?.(next.filter((a, i) => a === questions[i].answerIndex).length);
  };

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const picked = answers[qi];
        return (
          <fieldset key={qi} className="rounded-3xl border border-border bg-surface p-5">
            <legend className="sr-only">Question {qi + 1}</legend>
            <div className="mb-3 flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary-strong">{qi + 1}</span>
              <p className="font-medium text-ink">{q.question}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const isPicked = picked === oi;
                const isRight = oi === q.answerIndex;
                const reveal = picked !== null;
                return (
                  <motion.button
                    key={oi}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => choose(qi, oi)}
                    disabled={reveal}
                    aria-pressed={isPicked}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                      !reveal && "border-border-strong bg-surface hover:-translate-y-px hover:border-primary/40",
                      reveal && isRight && "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
                      reveal && isPicked && !isRight && "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
                      reveal && !isRight && !isPicked && "border-border opacity-60",
                    )}
                  >
                    {opt}
                    {reveal && isRight && <Check className="size-4 shrink-0" aria-label="Correct answer" />}
                    {reveal && isPicked && !isRight && <X className="size-4 shrink-0" aria-label="Your answer" />}
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {picked !== null && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 text-sm text-body" role="status">
                  <span className="font-semibold text-ink">{picked === q.answerIndex ? "Nice! " : "Not quite. "}</span>
                  {q.explanation}
                </motion.p>
              )}
            </AnimatePresence>
          </fieldset>
        );
      })}
      {done && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-signature p-5">
          <p className="font-display text-lg font-semibold text-ink">
            {score} / {questions.length} correct {score === questions.length ? "🎉" : score >= 2 ? "👏" : "🌱"}
          </p>
          <Button variant="secondary" size="sm" onClick={() => setAnswers(questions.map(() => null))}>
            <RotateCcw /> Try again
          </Button>
        </div>
      )}
    </div>
  );
}
