"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useExplorer, usePrefs, useProgress } from "@/lib/store";
import type { ChatMessage, ChatRequest, ChatStreamEvent } from "@/lib/chat-types";

const uid = () => Math.random().toString(36).slice(2, 10);

/** Rebuild the text-only history the API expects: completed user→assistant pairs, oldest first. */
function toHistory(messages: ChatMessage[]): ChatRequest["history"] {
  const history: ChatRequest["history"] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    const u = messages[i];
    const a = messages[i + 1];
    if (u.role === "user" && a.role === "assistant" && !a.error && a.text.trim()) {
      history.push({ role: "user", content: u.sentContent ?? u.text }, { role: "assistant", content: a.text });
      i++;
    }
  }
  return history.slice(-20);
}

/** Streams answers from /api/chat into the persisted chat history. */
export function useChat() {
  const messages = useProgress((s) => s.chat);
  const setChat = useProgress((s) => s.setChat);
  const addQuestion = useProgress((s) => s.addQuestion);
  const clearChat = useProgress((s) => s.clearChat);
  const level = usePrefs((s) => s.level);
  const pathname = usePathname();
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || streaming) return;
      addQuestion(q);
      const history = toHistory(useProgress.getState().chat);
      const userId = uid();
      const asstId = uid();
      const now = new Date().toISOString();
      setChat((prev) => [
        ...prev,
        { id: userId, role: "user", text: q, createdAt: now },
        { id: asstId, role: "assistant", text: "", createdAt: now, visuals: [] },
      ]);
      const patch = (fn: (m: ChatMessage) => ChatMessage) => setChat((prev) => prev.map((m) => (m.id === asstId ? fn(m) : m)));

      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;
      const body: ChatRequest = {
        history,
        question: q,
        level,
        context: { page: pathname, focusedObjectId: useExplorer.getState().focusedId },
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as ChatStreamEvent;
            switch (event.type) {
              case "text":
                patch((m) => ({ ...m, text: m.text + event.delta }));
                break;
              case "visual":
                patch((m) => ({ ...m, visuals: [...(m.visuals ?? []), event.visual] }));
                break;
              case "followups":
                patch((m) => ({ ...m, followups: event.questions }));
                break;
              case "sources":
                patch((m) => ({ ...m, sources: [...(m.sources ?? []), ...event.sources] }));
                break;
              case "status":
                break;
              case "done":
                patch((m) => ({ ...m, mode: event.mode }));
                setChat((prev) => prev.map((m) => (m.id === userId ? { ...m, sentContent: event.userContent } : m)));
                break;
              case "error":
                patch((m) => ({ ...m, error: true, text: m.text || event.message }));
                break;
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          patch((m) => ({ ...m, error: true, text: m.text || "I couldn't reach the guide. Check your connection and try again." }));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [addQuestion, level, pathname, setChat, streaming],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { messages, send, stop, streaming, clear: clearChat };
}
