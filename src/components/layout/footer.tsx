"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { NAV_ITEMS } from "@/components/layout/nav-config";

const HIDE_ON = ["/explore", "/ask"];

export function Footer() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer className="mt-24 border-t border-border bg-surface/60 pb-28 lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Understand the universe, one question at a time. Built on open data from NASA, ESA and JPL.
          </p>
        </div>
        <div>
          <h3 className="text-sm">Explore</h3>
          <ul className="mt-3 grid gap-2 text-sm">
            {NAV_ITEMS.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-muted hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm">Data & credits</h3>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            <li><a className="hover:text-ink" href="https://science.nasa.gov/" target="_blank" rel="noreferrer">NASA Science</a></li>
            <li><a className="hover:text-ink" href="https://ssd.jpl.nasa.gov/horizons/" target="_blank" rel="noreferrer">JPL Horizons</a></li>
            <li><a className="hover:text-ink" href="https://www.esa.int/Science_Exploration" target="_blank" rel="noreferrer">ESA Science & Exploration</a></li>
            <li><a className="hover:text-ink" href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">astronomy-engine</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-muted sm:px-6">
          <span>© {new Date().getFullYear()} Orbital. Not affiliated with NASA, ESA or JPL.</span>
          <span>Positions computed locally · AI answers can make mistakes — check the sources.</span>
        </div>
      </div>
    </footer>
  );
}
