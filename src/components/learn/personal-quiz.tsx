"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/primitives";
import { Quiz } from "@/components/learn/quiz";
import { useProgress } from "@/lib/store";
import type { QuizQuestion } from "@/lib/types";

/** AI-generated quiz built from what the learner explored and asked about. */
export function PersonalQuiz() {
  const explored = useProgress((s) => s.explored);
  const recent = useProgress((s) => s.recentQuestions);
  const touchStreak = useProgress((s) => s.touchStreak);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [quiz, setQuiz] = useState<{ title: string; questions: QuizQuestion[]; mode: string } | null>(null);

  const generate = async () => {
    setState("loading");
    try {
      const topExplored = Object.entries(explored)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id]) => id);
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explored: topExplored, questions: recent.slice(0, 6).map((q) => q.text) }),
      });
      if (!res.ok) throw new Error();
      setQuiz(await res.json());
      setState("ready");
    } catch {
      setState("error");
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-signature p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" /> Made for you
          </div>
          <h3 className="mt-1 text-xl">{quiz?.title ?? "Your personal quiz"}</h3>
          <p className="mt-1 text-sm text-body">Three questions built from the worlds you explored and the questions you asked.</p>
        </div>
        <Button onClick={generate} disabled={state === "loading"}>
          <Wand2 /> {state === "ready" ? "New quiz" : "Generate quiz"}
        </Button>
      </div>
      {state !== "idle" && (
        <div className="p-5 sm:p-6">
          {state === "loading" && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {state === "error" && <p className="text-sm text-rose-600">Couldn&apos;t build a quiz right now. Please try again.</p>}
          {state === "ready" && quiz && (
            <>
              {quiz.mode === "offline" && <p className="mb-3 text-xs text-muted">Picked from Orbital&apos;s lessons (AI guide not connected).</p>}
              <Quiz key={quiz.title + quiz.questions[0]?.question} questions={quiz.questions} onComplete={() => touchStreak()} />
            </>
          )}
        </div>
      )}
    </Card>
  );
}
