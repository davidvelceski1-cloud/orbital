"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Compass, GraduationCap, LayoutDashboard, Menu, MessageCircle, Moon, Rocket, Scale, Sun, X } from "lucide-react";
import { usePrefs } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/ask", label: "Ask", icon: MessageCircle, accent: true },
  { href: "/learn", label: "Learn", icon: GraduationCap },
];

const MORE = [
  { href: "/sky", label: "Tonight's Sky", icon: CalendarClock },
  { href: "/missions", label: "Missions", icon: Rocket },
  { href: "/dashboard", label: "My space", icon: LayoutDashboard },
];

/** Bottom tab bar for phones; secondary destinations live in a "More" bottom sheet. */
export function MobileTabBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, set } = usePrefs();

  return (
    <>
      <nav
        aria-label="Main"
        className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-3xl px-2 py-1.5 shadow-lift lg:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-primary-strong" : "text-muted",
              )}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full transition-all",
                  t.accent && "text-white [background:var(--gradient-button)] shadow-[0_6px_16px_-6px_rgba(99,102,241,0.6)]",
                  active && !t.accent && "bg-primary-soft",
                )}
              >
                <t.icon className="size-[18px]" aria-hidden />
              </span>
              {t.label}
            </Link>
          );
        })}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium text-muted">
            <span className="grid size-8 place-items-center rounded-full">
              <Menu className="size-[18px]" aria-hidden />
            </span>
            More
          </Dialog.Trigger>
          <AnimatePresence>
            {open && (
              <Dialog.Portal forceMount>
                <Dialog.Overlay asChild>
                  <motion.div className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                </Dialog.Overlay>
                <Dialog.Content asChild>
                  <motion.div
                    className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-surface p-5 pb-8 shadow-lift"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 32, stiffness: 320 }}
                  >
                    <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border-strong" aria-hidden />
                    <div className="mb-3 flex items-center justify-between">
                      <Dialog.Title className="font-display text-lg font-semibold text-ink">More</Dialog.Title>
                      <Dialog.Close className="grid size-9 place-items-center rounded-full hover:bg-surface-2" aria-label="Close">
                        <X className="size-4" />
                      </Dialog.Close>
                    </div>
                    <Dialog.Description className="sr-only">More destinations and settings</Dialog.Description>
                    <div className="grid gap-1">
                      {MORE.map((m) => (
                        <Link
                          key={m.href}
                          href={m.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-3 py-3 text-ink hover:bg-surface-2"
                        >
                          <m.icon className="size-5 text-primary" aria-hidden />
                          {m.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => set({ theme: theme === "dark" ? "light" : "dark" })}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-ink hover:bg-surface-2"
                      >
                        {theme === "dark" ? <Sun className="size-5 text-primary" /> : <Moon className="size-5 text-primary" />}
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                      </button>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>
        </Dialog.Root>
      </nav>
    </>
  );
}
