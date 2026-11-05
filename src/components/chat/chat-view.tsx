"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Eraser, Sparkles, Square } from "lucide-react";
import { ChatMessageView } from "@/components/chat/chat-message";
import { Button } from "@/components/ui/button";
import { Chip, EmptyState, Segmented } from "@/components/ui/primitives";
import { getObject } from "@/data/objects";
import { useExplorer, usePrefs, useUI } from "@/lib/store";
import { useMounted } from "@/lib/hooks";
import { useChat } from "@/lib/use-chat";
import type { ExplanationLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const STARTERS = [
  "Why does Saturn have rings?",
  "How big is the Sun compared to Earth?",
  "Could there be life on Europa?",
  "What happens inside a black hole?",
  "Why do we have seasons?",
  "Which planets can I see tonight?",
];

const LEVELS: { value: ExplanationLevel; label: string }[] = [
  { value: "kid", label: "Like I'm 10" },
  { value: "adult", label: "Curious adult" },
  { value: "nerd", label: "Science nerd" },
];

/** The full conversational UI, used both in the floating drawer and on /ask. */
export function ChatView({ variant = "page" }: { variant?: "page" | "drawer" }) {
  const { messages, send, stop, streaming, clear } = useChat();
  const { level, set } = usePrefs();
  const focusedId = useExplorer((s) => s.focusedId);
  const consumePending = useUI((s) => s.consumePending);
  const pending = useUI((s) => s.pendingQuestion);
  const mounted = useMounted();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const focused = focusedId ? getObject(focusedId) : undefined;

  // Questions queued from elsewhere (palette, chips, "Ask about this").
  useEffect(() => {
    if (!pending || streaming) return;
    const q = consumePending();
    if (q) void send(q);
  }, [pending, streaming, consumePending, send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!input.trim()) return;
    void send(input);
    setInput("");
    inputRef.current?.focus();
  };

  const suggestions = focused ? focused.suggestedQuestions : STARTERS;
  const visible = mounted ? messages : [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3", variant === "drawer" && "pr-14")}>
        <Segmented
          label="Explanation level"
          size="sm"
          value={mounted ? level : "adult"}
          onChange={(v) => set({ level: v })}
          options={LEVELS}
        />
        {visible.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} aria-label="Clear conversation">
            <Eraser /> Clear
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {visible.length === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center pt-4">
            <EmptyState
              className="w-full border-none bg-transparent"
              title={focused ? `Curious about ${focused.name}?` : "Ask Orbital anything about space"}
              description={
                focused
                  ? `You're viewing ${focused.name} in the explorer. Here are a few places to start.`
                  : "Plain-language answers, true-to-scale visuals and sources from NASA, ESA and JPL."
              }
            />
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {suggestions.map((q) => (
                <Chip key={q} icon={Sparkles} onClick={() => void send(q)}>
                  {q}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {visible.map((m, i) => (
              <ChatMessageView key={m.id} message={m} streaming={streaming && i === visible.length - 1} onFollowup={(q) => void send(q)} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface/80 p-3">
        {focused && (
          <div className="mx-auto mb-2 flex max-w-2xl items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden /> Context: viewing {focused.name}
          </div>
        )}
        <form
          className="mx-auto flex max-w-2xl items-end gap-2 rounded-3xl border border-border-strong bg-surface p-1.5 pl-4 shadow-soft transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label htmlFor={`chat-input-${variant}`} className="sr-only">
            Ask a question
          </label>
          <textarea
            id={`chat-input-${variant}`}
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={focused ? `Ask about ${focused.name}…` : "Ask anything about space…"}
            className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-faint"
          />
          {streaming ? (
            <Button size="icon" variant="secondary" onClick={stop} aria-label="Stop generating">
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button size="icon" type="submit" disabled={!input.trim()} aria-label="Send question">
              <ArrowUp />
            </Button>
          )}
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-muted">AI answers can make mistakes. Check the linked sources for anything important.</p>
      </div>
    </div>
  );
}
