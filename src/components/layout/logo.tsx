import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="55%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#F9A8D4" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="7" fill="url(#logo-g)" />
      <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="url(#logo-g)" strokeWidth="1.6" transform="rotate(-24 16 16)" opacity="0.85" />
      <circle cx="28" cy="10.5" r="2" fill="#FDBA74" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight text-ink">Orbital</span>
    </span>
  );
}
