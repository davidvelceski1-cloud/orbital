import { CircleDot, Moon, Orbit, Sparkles, Sun } from "lucide-react";
import type { LearningPath } from "@/lib/types";

const ICONS = { Orbit, Sparkles, Sun, CircleDot, Moon };

export function PathIcon({ name, className }: { name: LearningPath["icon"]; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden />;
}
