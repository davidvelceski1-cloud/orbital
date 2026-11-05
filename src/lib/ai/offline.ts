/**
 * Offline guide: when no Claude credentials are configured, answer from the curated
 * knowledge base so the app still works end to end (clearly labelled in the UI).
 */
import type { ChatStreamEvent, ChatVisual } from "@/lib/chat-types";
import type { ExplanationLevel } from "@/lib/types";
import type { RetrievedContext } from "@/lib/ai/retrieval";
import { comparisonSentence, resolveComparable } from "@/lib/comparison";

const SIZE_QUESTION = /\b(big|bigger|biggest|size|sizes|large|larger|small|smaller|wide|wider|compare|compared|vs|versus|fit inside)\b/i;
/** A note must match on more than a bare object name before the offline guide relies on it. */
const NOTE_CONFIDENCE = 4;

export function offlineAnswer(question: string, ctx: RetrievedContext, level: ExplanationLevel): ChatStreamEvent[] {
  const events: ChatStreamEvent[] = [];
  const visuals: ChatVisual[] = [];
  const paragraphs: string[] = [];
  const primary = ctx.mentioned[0] ?? ctx.objects[0];
  const note = ctx.topNoteScore >= NOTE_CONFIDENCE ? ctx.notes[0] : undefined;

  if (primary && SIZE_QUESTION.test(question)) {
    // Size questions: answer with a true-scale comparison.
    const otherId = ctx.mentioned[1]?.id ?? (primary.id === "earth" ? "moon" : "earth");
    const a = resolveComparable(primary.id)!;
    const b = resolveComparable(otherId)!;
    paragraphs.push(comparisonSentence(a, b));
    paragraphs.push(`**${primary.name}** — ${primary.tagline}. ${primary.description}`);
    visuals.push({ type: "comparison", a: primary.id, b: otherId });
  } else if (note) {
    const sentences = note.text.split(/(?<=\.)\s+/);
    paragraphs.push(level === "kid" ? sentences.slice(0, 2).join(" ") : level === "adult" ? sentences.slice(0, 4).join(" ") : note.text);
  } else if (primary) {
    paragraphs.push(`**${primary.name}** — ${primary.tagline}. ${primary.description}`);
    if (level !== "kid") paragraphs.push(`Fun fact: ${primary.funFact}`);
    visuals.push({ type: "facts", objectId: primary.id });
  } else {
    paragraphs.push(
      "I don't have a curated note on that yet. Try asking about a planet, moon, the Sun, black holes, seasons, Moon phases or a mission — or connect the full AI guide for open-ended questions.",
    );
  }

  events.push({ type: "text", delta: paragraphs.join("\n\n") });
  if (primary) visuals.unshift({ type: "focus", objectId: primary.id, label: primary.name });
  visuals.forEach((visual) => events.push({ type: "visual", visual }));

  const followups = primary?.suggestedQuestions.filter((q) => q.toLowerCase() !== question.toLowerCase()).slice(0, 3) ?? [];
  events.push({
    type: "followups",
    questions: followups.length ? followups : ["Why does Saturn have rings?", "How are stars born?", "What causes the seasons?"],
  });
  const sources = note ? [note.source, ...(primary?.sources ?? [])] : (primary?.sources ?? ctx.sources);
  if (sources.length) events.push({ type: "sources", sources: [...new Map(sources.map((s) => [s.url, s])).values()].slice(0, 3) });
  return events;
}
