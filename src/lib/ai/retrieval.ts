/**
 * Lightweight retrieval over the curated knowledge base + object fact sheets.
 * Keyword scoring is plenty for ~60 short documents and keeps the app dependency-free;
 * swap in embeddings here if the knowledge base grows.
 */
import { KNOWLEDGE } from "@/data/knowledge";
import { ALL_OBJECTS, getObject } from "@/data/objects";
import type { CelestialObject, KnowledgeNote, Source } from "@/lib/types";
import { formatDayLength, formatKm, formatTemp, formatYearLength } from "@/lib/utils";

const STOP = new Set(
  "a an the is are was were be of to in on at for and or but why how what when where who does do did can could would will it its this that with from about there their my me i you your".split(" "),
);

function tokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s*-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function findObjectsInText(text: string): CelestialObject[] {
  const lower = text.toLowerCase();
  return ALL_OBJECTS.filter((o) => new RegExp(`\\b${o.name.toLowerCase()}\\b`).test(lower) || (o.id === "moon" && /\bmoon\b/.test(lower)));
}

const OBJECT_ID_SET = new Set(ALL_OBJECTS.map((o) => o.id));

export function scoreNotesDetailed(query: string, boostObjectId?: string | null, limit = 4): { note: KnowledgeNote; score: number }[] {
  const q = tokens(query);
  const qs = new Set(q);
  const lower = query.toLowerCase();
  const scored = KNOWLEDGE.map((note) => {
    let score = 0;
    for (const tag of note.tags) {
      if (!new RegExp(`\\b${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(lower)) continue;
      // Topic tags ("rings", "seasons") say more about relevance than a bare object name ("earth").
      score += OBJECT_ID_SET.has(tag) ? 1.5 : tag.includes(" ") ? 4 : 3;
    }
    for (const t of tokens(note.title)) if (qs.has(t)) score += 2;
    const body = note.text.toLowerCase();
    for (const t of qs) if (body.includes(t)) score += 0.5;
    if (boostObjectId && note.tags.includes(boostObjectId)) score += 1.5;
    return { note, score };
  });
  return scored
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function scoreNotes(query: string, boostObjectId?: string | null, limit = 4): KnowledgeNote[] {
  return scoreNotesDetailed(query, boostObjectId, limit).map((s) => s.note);
}

export function factSheet(o: CelestialObject): string {
  const lines = [
    `${o.name} (${o.kind}${o.parentId ? ` of ${getObject(o.parentId)?.name}` : ""}) — ${o.tagline}.`,
    o.description,
    `Radius: ${o.radiusKm.toLocaleString("en-US")} km.`,
    o.distanceFromSunKm ? `Mean distance from the Sun: ${formatKm(o.distanceFromSunKm)}.` : "",
    o.distanceFromParentKm ? `Mean distance from parent: ${formatKm(o.distanceFromParentKm)}.` : "",
    `Rotation period: ${formatDayLength(o.dayLengthHours)}.`,
    o.orbitalPeriodDays ? `Orbital period: ${formatYearLength(o.orbitalPeriodDays)}.` : "",
    `Surface gravity: ${o.gravity} m/s².`,
    `Temperature: ${formatTemp(o.temperatureC)}.`,
    o.moonCount !== undefined ? `Known moons: ${o.moonCount} (as of 2025).` : "",
    `Composition: ${o.composition.join("; ")}.`,
    `Fun fact: ${o.funFact}`,
  ];
  return lines.filter(Boolean).join(" ");
}

export interface RetrievedContext {
  notes: KnowledgeNote[];
  /** Score of the best note — the offline guide only leans on notes that clearly match */
  topNoteScore: number;
  /** Objects named in the question, in the order they appear */
  mentioned: CelestialObject[];
  /** Mentioned objects first, then the one the user is viewing */
  objects: CelestialObject[];
  sources: Source[];
}

export function retrieve(question: string, focusedObjectId?: string | null): RetrievedContext {
  const lower = question.toLowerCase();
  const mentioned = findObjectsInText(question).sort((a, b) => lower.indexOf(a.name.toLowerCase()) - lower.indexOf(b.name.toLowerCase()));
  const focused = focusedObjectId ? getObject(focusedObjectId) : undefined;
  const objects = [...new Map([...mentioned, ...(focused ? [focused] : [])].map((o) => [o.id, o])).values()].slice(0, 3);
  const scored = scoreNotesDetailed(question, mentioned.length ? null : focusedObjectId);
  const notes = scored.map((s) => s.note);
  const sources = [...new Map([...notes.map((n) => n.source), ...objects.flatMap((o) => o.sources)].map((s) => [s.url, s])).values()];
  return { notes, topNoteScore: scored[0]?.score ?? 0, mentioned, objects, sources };
}

export function contextBlock(ctx: RetrievedContext): string {
  const parts: string[] = [];
  ctx.objects.forEach((o) => parts.push(`[fact sheet: ${o.id}] ${factSheet(o)} (Source: ${o.sources[0].publisher}, ${o.sources[0].url})`));
  ctx.notes.forEach((n) => parts.push(`[note: ${n.id}] ${n.title}: ${n.text} (Source: ${n.source.publisher}, ${n.source.url})`));
  return parts.join("\n\n");
}
