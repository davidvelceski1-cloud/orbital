"use client";

import { useState } from "react";
import { LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { usePrefs } from "@/lib/store";

/**
 * Optional account. Progress always lives on this device (localStorage); this card lets people
 * attach a name/email to it. Server-side accounts (Supabase/Clerk) plug in here — see README.
 */
export function AccountCard() {
  const { profile, set } = usePrefs();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<string | null>(null);

  if (profile) {
    return (
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <div className="grid size-12 place-items-center rounded-full bg-signature font-display text-lg font-semibold text-primary-strong">
          {profile.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-ink">{profile.name}</div>
          <div className="truncate text-sm text-muted">{profile.email} · progress saved on this device</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => set({ profile: null })}>
          <LogOut /> Sign out
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-lg">Save your space</h2>
      <p className="mt-1 text-sm text-muted">Your progress, badges and chats are already saved in this browser. Add your name to personalize Orbital.</p>
      <form
        className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setNote("Please enter your name and a valid email.");
          set({ profile: { name: name.trim(), email: email.trim(), provider: "email", joinedAt: new Date().toISOString() } });
        }}
      >
        <label className="sr-only" htmlFor="acc-name">Name</label>
        <input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-10 rounded-full border border-border-strong bg-surface px-4 text-sm text-ink outline-none focus:border-primary/50" />
        <label className="sr-only" htmlFor="acc-email">Email</label>
        <input id="acc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-10 rounded-full border border-border-strong bg-surface px-4 text-sm text-ink outline-none focus:border-primary/50" />
        <Button type="submit">
          <Mail /> Continue
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => setNote("Google sign-in and cloud sync turn on once an auth provider (Supabase or Clerk) is configured — see the README.")}>
          <GoogleG /> Continue with Google
        </Button>
        {note && <p className="text-xs text-muted">{note}</p>}
      </div>
    </Card>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.5 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9l3.6-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1C17.5 2.2 15 1 12 1 7.7 1 3.9 3.5 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}
