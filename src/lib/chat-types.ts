import type { ExplanationLevel, Source } from "@/lib/types";

/**
 * Wire protocol between /api/chat and the chat UI (newline-delimited JSON events),
 * plus the shape chat messages are stored in.
 */

/** Visual blocks the guide can attach to an answer via tool calls. */
export type ChatVisual =
  | { type: "focus"; objectId: string; label: string }
  | { type: "comparison"; a: string; b: string }
  | { type: "facts"; objectId: string }
  | { type: "scale"; objectIds: string[] };

export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | { type: "visual"; visual: ChatVisual }
  | { type: "followups"; questions: string[] }
  | { type: "sources"; sources: Source[] }
  | { type: "status"; message: string }
  | { type: "done"; userContent: string; mode: "ai" | "offline" }
  | { type: "error"; message: string };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** What the user typed / the assistant's markdown answer */
  text: string;
  /** Exact user turn sent to the model (question + context), kept so history stays append-only */
  sentContent?: string;
  visuals?: ChatVisual[];
  followups?: string[];
  sources?: Source[];
  mode?: "ai" | "offline";
  error?: boolean;
  createdAt: string;
}

export interface ChatRequest {
  /** Prior turns, text only, oldest first */
  history: { role: "user" | "assistant"; content: string }[];
  question: string;
  level: ExplanationLevel;
  /** What the user is looking at right now (explorer focus, current page) */
  context: { page: string; focusedObjectId?: string | null };
}
