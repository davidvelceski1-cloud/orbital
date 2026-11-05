"use client";

/**
 * Client state, split by lifetime:
 * - usePrefs / useProgress: persisted to localStorage (the "Personal Space"; no server account needed).
 * - useExplorer / useUI: in-memory session state shared across pages (e.g. the AI guide moving the 3D camera).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ExplanationLevel } from "@/lib/types";
import type { ChatMessage } from "@/lib/chat-types";
import { dayKey } from "@/lib/utils";

const storage = createJSONStorage(() => {
  try {
    return localStorage;
  } catch {
    // Private mode / blocked storage: fall back to an in-memory shim.
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
});

export type ThemePref = "light" | "dark" | "system";

export interface Profile {
  name: string;
  email: string;
  provider: "email" | "google";
  joinedAt: string;
}

export interface SkyLocation {
  lat: number;
  lon: number;
  label: string;
}

interface PrefsState {
  onboarded: boolean;
  level: ExplanationLevel;
  interests: string[];
  location: SkyLocation | null;
  theme: ThemePref;
  /** null = follow the OS setting */
  reducedMotion: boolean | null;
  profile: Profile | null;
  set: (patch: Partial<Omit<PrefsState, "set">>) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      onboarded: false,
      level: "adult",
      interests: [],
      location: null,
      theme: "light",
      reducedMotion: null,
      profile: null,
      set: (patch) => set(patch),
    }),
    { name: "orbital.prefs", storage },
  ),
);

export interface Reminder {
  id: string;
  title: string;
  at: string; // ISO
}

interface ProgressState {
  completedLessons: Record<string, string[]>;
  quizScores: Record<string, number>; // "path/lesson" → correct answers (0–3)
  badges: string[];
  streak: { count: number; lastDay: string | null };
  explored: Record<string, number>; // objectId → visit count
  favorites: string[];
  recentQuestions: { text: string; at: string }[];
  chat: ChatMessage[];
  reminders: Reminder[];
  lastLesson: { pathId: string; lessonId: string } | null;

  completeLesson: (pathId: string, lessonId: string, score: number, totalLessons: number, badgeId: string) => boolean;
  touchStreak: () => void;
  markExplored: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addQuestion: (text: string) => void;
  setChat: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  clearChat: () => void;
  addReminder: (r: Reminder) => void;
  removeReminder: (id: string) => void;
  setLastLesson: (pathId: string, lessonId: string) => void;
  resetAll: () => void;
}

const initialProgress = {
  completedLessons: {},
  quizScores: {},
  badges: [],
  streak: { count: 0, lastDay: null },
  explored: {},
  favorites: [],
  recentQuestions: [],
  chat: [],
  reminders: [],
  lastLesson: null,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialProgress,

      /** Returns true when this completion earned the path's badge. */
      completeLesson: (pathId, lessonId, score, totalLessons, badgeId) => {
        const done = new Set(get().completedLessons[pathId] ?? []);
        done.add(lessonId);
        const earned = done.size >= totalLessons && !get().badges.includes(badgeId);
        set((s) => ({
          completedLessons: { ...s.completedLessons, [pathId]: [...done] },
          quizScores: { ...s.quizScores, [`${pathId}/${lessonId}`]: Math.max(score, s.quizScores[`${pathId}/${lessonId}`] ?? 0) },
          badges: earned ? [...s.badges, badgeId] : s.badges,
        }));
        get().touchStreak();
        return earned;
      },

      touchStreak: () => {
        const today = dayKey();
        const { lastDay, count } = get().streak;
        if (lastDay === today) return;
        const yesterday = dayKey(new Date(Date.now() - 86_400_000));
        set({ streak: { count: lastDay === yesterday ? count + 1 : 1, lastDay: today } });
      },

      markExplored: (id) => set((s) => ({ explored: { ...s.explored, [id]: (s.explored[id] ?? 0) + 1 } })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        })),

      addQuestion: (text) =>
        set((s) => ({
          recentQuestions: [{ text, at: new Date().toISOString() }, ...s.recentQuestions.filter((q) => q.text !== text)].slice(0, 20),
        })),

      setChat: (updater) => set((s) => ({ chat: updater(s.chat).slice(-60) })),
      clearChat: () => set({ chat: [] }),

      addReminder: (r) => set((s) => ({ reminders: [...s.reminders.filter((x) => x.id !== r.id), r] })),
      removeReminder: (id) => set((s) => ({ reminders: s.reminders.filter((x) => x.id !== id) })),

      setLastLesson: (pathId, lessonId) => set({ lastLesson: { pathId, lessonId } }),

      resetAll: () => set(initialProgress),
    }),
    { name: "orbital.progress", storage },
  ),
);

export type ScaleMode = "readable" | "realistic";
export type LayerKey = "orbits" | "labels" | "asteroids" | "kuiper" | "moons" | "spacecraft";

/** Simulation speed in simulated days per real second. */
export const SPEEDS = [
  { id: "pause", label: "Pause", daysPerSec: 0 },
  { id: "realtime", label: "1×", daysPerSec: 1 / 86_400 },
  { id: "day", label: "1 day/s", daysPerSec: 1 },
  { id: "month", label: "1 month/s", daysPerSec: 30.44 },
  { id: "year", label: "1 year/s", daysPerSec: 365.25 },
] as const;
export type SpeedId = (typeof SPEEDS)[number]["id"];

interface ExplorerState {
  focusedId: string | null;
  /** Simulated time, epoch ms */
  time: number;
  speed: SpeedId;
  scale: ScaleMode;
  layers: Record<LayerKey, boolean>;
  view: "3d" | "list";
  focus: (id: string | null) => void;
  setTime: (t: number) => void;
  setSpeed: (s: SpeedId) => void;
  setScale: (s: ScaleMode) => void;
  toggleLayer: (k: LayerKey) => void;
  setView: (v: "3d" | "list") => void;
}

export const useExplorer = create<ExplorerState>()((set) => ({
  focusedId: null,
  time: Date.now(),
  speed: "day",
  scale: "readable",
  layers: { orbits: true, labels: true, asteroids: true, kuiper: false, moons: true, spacecraft: false },
  view: "3d",
  focus: (id) => set({ focusedId: id }),
  setTime: (time) => set({ time }),
  setSpeed: (speed) => set({ speed }),
  setScale: (scale) => set({ scale }),
  toggleLayer: (k) => set((s) => ({ layers: { ...s.layers, [k]: !s.layers[k] } })),
  setView: (view) => set({ view }),
}));

interface UIState {
  chatOpen: boolean;
  paletteOpen: boolean;
  onboardingOpen: boolean;
  /** A question queued for the chat (from chips, palette, "Ask about this") */
  pendingQuestion: string | null;
  setChatOpen: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setOnboardingOpen: (v: boolean) => void;
  ask: (q: string) => void;
  consumePending: () => string | null;
}

export const useUI = create<UIState>()((set, get) => ({
  chatOpen: false,
  paletteOpen: false,
  onboardingOpen: false,
  pendingQuestion: null,
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setOnboardingOpen: (onboardingOpen) => set({ onboardingOpen }),
  ask: (q) => set({ pendingQuestion: q, chatOpen: true }),
  consumePending: () => {
    const q = get().pendingQuestion;
    if (q) set({ pendingQuestion: null });
    return q;
  },
}));
