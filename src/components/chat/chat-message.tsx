"use client";

import { useRouter, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Navigation, Sparkles, WifiOff } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { SizeComparison } from "@/components/shared/size-comparison";
import { ObjectFacts } from "@/components/shared/object-facts";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { getObject } from "@/data/objects";
import { useExplorer, useUI } from "@/lib/store";
import type { ChatMessage, ChatVisual } from "@/lib/chat-types";
import { cn } from "@/lib/utils";

export function ChatMessageView({
  message,
  streaming,
  onFollowup,
}: {
  message: ChatMessage;
  streaming: boolean;
  onFollowup: (q: string) => void;
}) {
  if (message.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-primary-soft px-4 py-2.5 text-ink">{message.text}</div>
      </motion.div>
    );
  }

  const thinking = streaming && !message.text && !message.visuals?.length;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-signature ring-1 ring-border">
        <LogoMark className="size-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {thinking ? (
          <ThinkingDots />
        ) : (
          <div className={cn("prose-orbital text-[15px] leading-relaxed text-body", message.error && "text-rose-600 dark:text-rose-400")}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            {streaming && message.text && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary/60 align-middle" aria-hidden />}
          </div>
        )}

        {message.visuals?.map((v, i) => <Visual key={i} visual={v} />)}

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <BookOpen className="size-3.5 text-faint" aria-hidden />
            {dedupe(message.sources).map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-primary/40 hover:text-ink"
              >
                <span className="font-semibold text-primary">{s.publisher}</span>
                <span className="max-w-[16rem] truncate">{s.title}</span>
                <ArrowUpRight className="size-3" aria-hidden />
              </a>
            ))}
          </div>
        )}

        {message.mode === "offline" && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
            <WifiOff className="size-3" aria-hidden /> From Orbital&apos;s built-in notes (AI guide not connected)
          </div>
        )}

        {!streaming && message.followups && message.followups.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1" aria-label="Suggested follow-up questions">
            {message.followups.map((q) => (
              <Chip key={q} icon={Sparkles} onClick={() => onFollowup(q)}>
                {q}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function dedupe<T extends { url: string }>(xs: T[]) {
  return [...new Map(xs.map((x) => [x.url, x])).values()];
}

function ThinkingDots() {
  return (
    <div className="flex h-6 items-center gap-1" role="status" aria-label="Orbital is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-primary/50"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function Visual({ visual }: { visual: ChatVisual }) {
  switch (visual.type) {
    case "focus":
      return <ShowMeButton objectId={visual.objectId} label={visual.label} />;
    case "comparison":
      return <SizeComparison a={visual.a} b={visual.b} maxPx={140} />;
    case "facts": {
      const o = getObject(visual.objectId);
      return o ? <ObjectFacts object={o} compact /> : null;
    }
    case "scale":
      return null;
  }
}

export function ShowMeButton({ objectId, label }: { objectId: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const focus = useExplorer((s) => s.focus);
  const setChatOpen = useUI((s) => s.setChatOpen);
  return (
    <Button
      variant="soft"
      size="sm"
      onClick={() => {
        focus(objectId);
        if (!pathname.startsWith("/explore")) router.push(`/explore?focus=${objectId}`);
        if (window.matchMedia("(max-width: 1023px)").matches || !pathname.startsWith("/explore")) setChatOpen(false);
      }}
    >
      <Navigation /> Show me {label}
    </Button>
  );
}
