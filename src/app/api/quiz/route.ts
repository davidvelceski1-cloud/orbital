/**
 * POST /api/quiz — a personalized 3-question quiz from what the learner explored and asked.
 * Uses structured outputs so the response always matches the quiz schema.
 * Without Claude credentials it assembles a quiz from the built-in lessons instead.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getObject } from "@/data/objects";
import { LEARNING_PATHS } from "@/data/learning-paths";
import { MODEL, QUIZ_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { findObjectsInText, scoreNotes } from "@/lib/ai/retrieval";
import type { QuizQuestion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  explored: z.array(z.string().max(40)).max(20),
  questions: z.array(z.string().max(300)).max(10),
});

const QuizSchema = z.object({
  title: z.string(),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        answerIndex: z.number().int(),
        explanation: z.string(),
      }),
    ),
});

type Quiz = { title: string; questions: QuizQuestion[]; mode: "ai" | "offline" };

function validQuestion(q: QuizQuestion) {
  return q.options.length === 4 && q.answerIndex >= 0 && q.answerIndex < 4;
}

/** Deterministic fallback: pull lesson questions that mention the learner's topics. */
function offlineQuiz(explored: string[], asked: string[]): Quiz {
  const names = [
    ...explored.map((id) => getObject(id)?.name.toLowerCase()).filter(Boolean),
    ...asked.flatMap((q) => findObjectsInText(q).map((o) => o.name.toLowerCase())),
  ] as string[];
  const all = LEARNING_PATHS.flatMap((p) => p.lessons.flatMap((l) => l.quiz));
  const relevant = all.filter((q) => names.some((n) => (q.question + q.options.join(" ")).toLowerCase().includes(n)));
  const pool = (relevant.length >= 3 ? relevant : [...relevant, ...all]).slice();
  // Shuffle with a daily seed so it changes day to day.
  let seed = Math.floor(Date.now() / 86_400_000);
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const unique = [...new Map(pool.map((q) => [q.question, q])).values()].slice(0, 3);
  return { title: names.length ? "Your exploration quiz" : "Daily space quiz", questions: unique, mode: "offline" };
}

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { explored, questions } = parsed.data;

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json(offlineQuiz(explored, questions));
  }

  const objectNames = explored.map((id) => getObject(id)?.name).filter(Boolean);
  const notes = scoreNotes([...questions, ...objectNames].join(" "), null, 4);
  const prompt = [
    "Write a 3-question quiz for this learner.",
    objectNames.length ? `Objects they explored: ${objectNames.join(", ")}.` : "They haven't explored specific objects yet — pick broadly interesting solar-system topics.",
    questions.length ? `Questions they asked the guide:\n${questions.map((q) => `- ${q}`).join("\n")}` : "",
    notes.length ? `Reference notes (prefer facts from these):\n${notes.map((n) => `- ${n.title}: ${n.text}`).join("\n")}` : "",
    "Give the quiz a short, fun title. Each question needs exactly 4 options.",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16_000,
      system: QUIZ_SYSTEM_PROMPT,
      output_config: { effort: "low", format: betaZodOutputFormat(QuizSchema) },
      messages: [{ role: "user", content: prompt }],
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json(offlineQuiz(explored, questions));
    }
    const qs = response.parsed_output.questions.filter(validQuestion).slice(0, 3);
    if (qs.length < 3) return Response.json(offlineQuiz(explored, questions));
    return Response.json({ title: response.parsed_output.title, questions: qs, mode: "ai" } satisfies Quiz);
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error("Quiz generation failed", err.status, err.message);
    else console.error(err);
    return Response.json(offlineQuiz(explored, questions));
  }
}
