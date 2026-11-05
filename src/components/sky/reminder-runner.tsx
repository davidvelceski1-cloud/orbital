"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/store";

/** Fires browser notifications for saved sky reminders while the app is open. */
export function ReminderRunner() {
  const reminders = useProgress((s) => s.reminders);
  const removeReminder = useProgress((s) => s.removeReminder);

  useEffect(() => {
    if (!("Notification" in window)) return;
    const timers = reminders.map((r) => {
      const ms = new Date(r.at).getTime() - Date.now();
      if (ms < -3_600_000) {
        removeReminder(r.id);
        return null;
      }
      if (ms > 2_147_000_000) return null; // beyond setTimeout's range; rescheduled on a later visit
      return setTimeout(() => {
        if (Notification.permission === "granted") new Notification("Orbital sky reminder", { body: `${r.title} starts in about 30 minutes.` });
        removeReminder(r.id);
      }, Math.max(0, ms));
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [reminders, removeReminder]);

  return null;
}
