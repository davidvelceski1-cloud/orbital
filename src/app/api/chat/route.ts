/**
 * POST /api/chat — streams the guide's answer as newline-delimited JSON (ChatStreamEvent).
 *
 * Flow: retrieve knowledge → build the user turn (context + notes + question) → run a
 * streaming tool loop on Claude. Text deltas are forwarded as they arrive; tool calls
 * (focus_on_object, show_comparison, …) become UI events, and each gets a short
 * tool_result so the model can finish its turn.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getObject } from "@/data/objects";
import { PLACES } from "@/data/extras";
import { SPACECRAFT } from "@/data/missions";
import { contextBlock, retrieve } from "@/lib/ai/retrieval";
import { LEVEL_GUIDE, LEVEL_LABEL, MODEL, SYSTEM_PROMPT, TOOLS } from "@/lib/ai/prompt";
import { offlineAnswer } from "@/lib/ai/offline";
import type { ChatRequest, ChatStreamEvent } from "@/lib/chat-types";
import type { Source } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOOL_ROUNDS = 4;
const TRUSTED_HOSTS = /(^|\.)(nasa\.gov|esa\.int|iau\.org|isro\.gov\.in|caltech\.edu)$/;

const RequestSchema = z.object({
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(20_000) })).max(40),
  question: z.string().min(1).max(2_000),
  level: z.enum(["kid", "adult", "nerd"]),
  context: z.object({ page: z.string().max(100), focusedObjectId: z.string().max(40).nullish() }),
});

const ToolInputs = {
  focus_on_object: z.object({ object_id: z.string() }),
  show_comparison: z.object({ object_a: z.string(), object_b: z.string() }),
  show_facts: z.object({ object_id: z.string() }),
  suggest_followups: z.object({ questions: z.array(z.string().max(120)).min(1).max(4) }),
  cite_sources: z.object({
    sources: z.array(z.object({ title: z.string(), url: z.string(), publisher: z.string() })).max(3),
  }),
};

function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

function buildUserTurn(req: ChatRequest, knowledge: string) {
  const focused = req.context.focusedObjectId ? getObject(req.context.focusedObjectId) : undefined;
  const ctx = [
    `Page: ${req.context.page}.`,
    focused ? `Currently viewing in the explorer: ${focused.name} (id: ${focused.id}).` : "Not focused on a specific object.",
    `Explanation level: ${LEVEL_LABEL[req.level]} — ${LEVEL_GUIDE[req.level]}`,
  ].join("\n");
  return `<context>\n${ctx}\n</context>\n\n<knowledge>\n${knowledge || "(no matching notes)"}\n</knowledge>\n\n<question>\n${req.question}\n</question>`;
}

function isValidCompareId(id: string) {
  return Boolean(getObject(id) || PLACES.some((p) => p.id === id));
}

/** Turn one validated tool call into UI events plus the tool_result text the model sees. */
function handleTool(name: string, input: unknown, emit: (e: ChatStreamEvent) => void): { ok: boolean; result: string } {
  switch (name) {
    case "focus_on_object": {
      const p = ToolInputs.focus_on_object.safeParse(input);
      const id = p.success ? p.data.object_id : "";
      const label = getObject(id)?.name ?? SPACECRAFT.find((s) => s.id === id)?.name;
      if (!label) return { ok: false, result: `Unknown object id "${id}".` };
      emit({ type: "visual", visual: { type: "focus", objectId: id, label } });
      return { ok: true, result: `A "Show me ${label}" button is now under your answer.` };
    }
    case "show_comparison": {
      const p = ToolInputs.show_comparison.safeParse(input);
      if (!p.success || !isValidCompareId(p.data.object_a) || !isValidCompareId(p.data.object_b))
        return { ok: false, result: "Invalid object ids for comparison." };
      emit({ type: "visual", visual: { type: "comparison", a: p.data.object_a, b: p.data.object_b } });
      return { ok: true, result: "Comparison card displayed." };
    }
    case "show_facts": {
      const p = ToolInputs.show_facts.safeParse(input);
      if (!p.success || !getObject(p.data.object_id)) return { ok: false, result: "Unknown object id." };
      emit({ type: "visual", visual: { type: "facts", objectId: p.data.object_id } });
      return { ok: true, result: "Facts table displayed." };
    }
    case "suggest_followups": {
      const p = ToolInputs.suggest_followups.safeParse(input);
      if (!p.success) return { ok: false, result: "questions must be an array of 1–4 short strings." };
      emit({ type: "followups", questions: p.data.questions.slice(0, 4) });
      return { ok: true, result: "Follow-up chips displayed." };
    }
    case "cite_sources": {
      const p = ToolInputs.cite_sources.safeParse(input);
      if (!p.success) return { ok: false, result: "Invalid sources." };
      const trusted: Source[] = p.data.sources.flatMap((s) => {
        try {
          const u = new URL(s.url);
          if (u.protocol !== "https:" || !TRUSTED_HOSTS.test(u.hostname)) return [];
          const publisher = (["NASA", "ESA", "JPL", "IAU"] as const).find((x) => x === s.publisher) ?? "Other";
          return [{ title: s.title.slice(0, 120), url: u.toString(), publisher }];
        } catch {
          return [];
        }
      });
      if (trusted.length) emit({ type: "sources", sources: trusted });
      return { ok: true, result: trusted.length ? "Sources displayed." : "No sources from trusted domains were provided." };
    }
    default:
      return { ok: false, result: `Unknown tool ${name}.` };
  }
}

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const req = parsed.data as ChatRequest;

  const ctx = retrieve(req.question, req.context.focusedObjectId);
  const userTurn = buildUserTurn(req, contextBlock(ctx));
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: ChatStreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));

      const runOffline = (note?: string) => {
        if (note) emit({ type: "status", message: note });
        offlineAnswer(req.question, ctx, req.level).forEach(emit);
        emit({ type: "done", userContent: userTurn, mode: "offline" });
      };

      if (!hasCredentials()) {
        runOffline();
        controller.close();
        return;
      }

      const client = new Anthropic();
      // Prior turns as plain text (no thinking blocks are replayed), then this turn.
      // Within this request the loop below appends full assistant content, append-only.
      const messages: Anthropic.Beta.BetaMessageParam[] = [
        ...req.history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userTurn },
      ];
      const tools = TOOLS.map((t) => ({ ...t, eager_input_streaming: true }));

      try {
        let jsonRetries = 0;
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const s = client.beta.messages.stream({
            model: MODEL,
            max_tokens: 32_000,
            system: SYSTEM_PROMPT,
            tools,
            messages,
            output_config: { effort: "medium" },
            cache_control: { type: "ephemeral" },
            // On a safety-classifier refusal, re-run on Anthropic's recommended fallback model.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
          });
          s.on("text", (delta) => emit({ type: "text", delta }));

          let message: Anthropic.Beta.BetaMessage;
          try {
            message = await s.finalMessage();
            jsonRetries = 0;
          } catch (err) {
            // Only an unparseable streamed tool input is retried; API errors propagate.
            if (err instanceof Anthropic.APIError || jsonRetries++ >= 2) throw err;
            round--;
            continue;
          }

          if (message.stop_reason === "refusal") {
            emit({ type: "text", delta: "\n\nI can't help with that one — but I'd love to answer another space question!" });
            break;
          }
          const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
          if (toolUses.length === 0 || message.stop_reason !== "tool_use") break;

          messages.push({ role: "assistant", content: message.content });
          const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((tu) => {
            const { ok, result } = handleTool(tu.name, tu.input, emit);
            return { type: "tool_result", tool_use_id: tu.id, content: result, ...(ok ? {} : { is_error: true }) };
          });
          messages.push({ role: "user", content: results });
        }
        emit({ type: "done", userContent: userTurn, mode: "ai" });
      } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) {
          runOffline("The AI guide's API key was rejected, so this answer comes from Orbital's built-in notes.");
        } else if (err instanceof Anthropic.RateLimitError) {
          emit({ type: "error", message: "The guide is a little busy right now. Please try again in a moment." });
        } else if (err instanceof Anthropic.APIError) {
          console.error("Claude API error", err.status, err.message);
          emit({ type: "error", message: "Something went wrong reaching the guide. Please try again." });
        } else {
          console.error(err);
          emit({ type: "error", message: "Something went wrong. Please try again." });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
