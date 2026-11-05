"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Moon, Search, Sun } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { usePrefs, useUI } from "@/lib/store";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const { theme, set, profile } = usePrefs();
  const mounted = useMounted();
  const isDark = mounted && theme === "dark";
  const initials = mounted && profile ? profile.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 rounded-xl" aria-label="Orbital home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-surface shadow-soft ring-1 ring-border"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 items-center gap-2 rounded-full border border-border-strong bg-surface px-3 text-sm text-muted transition-colors hover:border-primary/40 hover:text-ink sm:w-52"
            aria-label="Search or ask (Command K)"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search or ask…</span>
            <kbd className="ml-auto hidden rounded-md border border-border bg-surface-2 px-1.5 text-[11px] font-medium sm:inline">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => set({ theme: isDark ? "light" : "dark" })}
            className="hidden size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:grid"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link
            href="/dashboard"
            className="grid size-9 place-items-center rounded-full bg-signature text-xs font-semibold text-primary-strong ring-1 ring-border transition-transform hover:scale-105"
            aria-label="Your personal space"
          >
            {initials ?? <span className="size-3.5 rounded-full bg-signature-strong" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
