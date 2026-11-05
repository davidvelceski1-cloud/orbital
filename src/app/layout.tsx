import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { MobileTabBar } from "@/components/layout/mobile-tabbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";
import { Onboarding } from "@/components/layout/onboarding";
import { AskDrawer } from "@/components/chat/ask-drawer";
import { ReminderRunner } from "@/components/sky/reminder-runner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Orbital — Understand the universe, one question at a time", template: "%s · Orbital" },
  description:
    "Explore the solar system in 3D, ask an AI guide anything about space, compare worlds to scale, learn with bite-sized lessons and see what's in your sky tonight.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFBFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1020" },
  ],
};

// Applies the saved theme before first paint to avoid a light→dark flash.
const themeScript = `try{var p=JSON.parse(localStorage.getItem('orbital.prefs')||'{}').state||{};var t=p.theme||'light';if(t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');if(p.reducedMotion)document.documentElement.classList.add('reduce-motion')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-[60] rounded-full bg-surface px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <Providers>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <MobileTabBar />
          <AskDrawer />
          <CommandPalette />
          <Onboarding />
          <ReminderRunner />
        </Providers>
      </body>
    </html>
  );
}
