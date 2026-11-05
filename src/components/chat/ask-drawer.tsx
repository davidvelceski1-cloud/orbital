"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatView } from "@/components/chat/chat-view";
import { useExplorer, useUI } from "@/lib/store";
import { useIsMobile, useMediaQuery } from "@/lib/hooks";

/**
 * "Ask Orbital" floating button + drawer. Present on every page (except /ask itself),
 * so the guide is always one click away. Side panel on desktop, bottom sheet on mobile.
 */
export function AskDrawer() {
  const pathname = usePathname();
  const open = useUI((s) => s.chatOpen);
  const setOpen = useUI((s) => s.setChatOpen);
  const mobile = useIsMobile();
  const wide = useMediaQuery("(min-width: 1024px)");
  const explorerPanelOpen = useExplorer((s) => s.focusedId !== null) && pathname.startsWith("/explore");
  const onAskPage = pathname.startsWith("/ask");
  // On smaller screens the explorer's info panel has its own "Ask Orbital" button; don't cover it.
  const showFab = !onAskPage && !(explorerPanelOpen && !wide);

  // On /ask the page itself is the chat; don't leave the drawer "open" for the next page.
  useEffect(() => {
    if (onAskPage && open) setOpen(false);
  }, [onAskPage, open, setOpen]);

  return (
    <Dialog.Root open={open && !onAskPage} onOpenChange={setOpen}>
      {showFab && (
        <Dialog.Trigger asChild>
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ y: -2 }}
            className="fixed bottom-24 right-4 z-30 flex h-12 items-center gap-2 rounded-full pl-4 pr-5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(99,102,241,0.6)] [background:var(--gradient-button)] lg:bottom-6 lg:right-6"
            aria-label="Ask Orbital, the AI space guide"
          >
            <MessageCircle className="size-5" aria-hidden />
            Ask Orbital
          </motion.button>
        </Dialog.Trigger>
      )}
      <AnimatePresence>
        {open && !onAskPage && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-ink/15 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className={
                  mobile
                    ? "fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border-t border-border bg-surface shadow-lift"
                    : "fixed bottom-4 right-4 top-4 z-50 flex w-[min(460px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-lift"
                }
                initial={mobile ? { y: "100%" } : { x: 40, opacity: 0 }}
                animate={mobile ? { y: 0 } : { x: 0, opacity: 1 }}
                exit={mobile ? { y: "100%" } : { x: 40, opacity: 0 }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
              >
                {mobile && <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border-strong" aria-hidden />}
                <div className="flex items-center gap-2 px-4 pt-3">
                  <Dialog.Title className="font-display text-base font-semibold text-ink">Ask Orbital</Dialog.Title>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-strong">AI guide</span>
                </div>
                <Dialog.Close className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label="Close chat">
                  <X className="size-4" />
                </Dialog.Close>
                <div className="min-h-0 flex-1">
                  <ChatView variant="drawer" />
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
