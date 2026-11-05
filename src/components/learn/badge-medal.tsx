import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

/** Collectible mission badge: gradient medal when earned, outlined when locked. */
export function BadgeMedal({ name, earned, size = 56, className }: { name: string; earned: boolean; size?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-1.5 text-center", className)} title={name}>
      <div
        className={cn(
          "grid place-items-center rounded-full transition-all",
          earned ? "text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] [background:var(--gradient-strong)]" : "border-2 border-dashed border-border-strong text-faint",
        )}
        style={{ width: size, height: size }}
      >
        <Award style={{ width: size * 0.45, height: size * 0.45 }} aria-hidden />
      </div>
      <span className={cn("text-xs font-medium", earned ? "text-ink" : "text-muted")}>{name}</span>
    </div>
  );
}
