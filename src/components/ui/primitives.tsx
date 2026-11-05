/**
 * Small presentational building blocks shared across the app:
 * Card, Chip, StatusBadge, FactCard, ProgressRing, Skeleton, Segmented, EmptyState, SectionHeader.
 */
"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn("card", hover && "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Chip({
  className,
  active,
  icon: Icon,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; icon?: LucideIcon }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px text-left",
        active
          ? "border-primary/40 bg-primary-soft text-primary-strong"
          : "border-border-strong bg-surface text-body hover:border-primary/30 hover:text-ink",
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
      {children}
    </button>
  );
}

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  completed: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700",
  upcoming: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
  neutral: "bg-primary-soft text-primary-strong border-transparent",
} as const;

export function StatusBadge({ status, children, className }: { status: keyof typeof STATUS_STYLES; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status], className)}>
      {status === "active" && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />}
      {children}
    </span>
  );
}

export function FactCard({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-3.5", className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold text-ink tabular leading-snug">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = `ring-${size}-${stroke}`;
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#F9A8D4" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {label !== undefined && <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-ink tabular">{label}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden />;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; title?: string }[];
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-full border border-border bg-surface-2 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-full font-medium transition-colors whitespace-nowrap",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${label}`}
                className="absolute inset-0 rounded-full bg-surface shadow-soft"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-3xl border border-dashed border-border-strong bg-surface/60 px-6 py-10 text-center", className)}>
      {illustration ?? <EmptyOrbitIllustration />}
      <h3 className="mt-4 text-lg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

/** A soft little planet-and-orbit drawing for friendly empty states. */
export function EmptyOrbitIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={cn("h-20 w-32", className)} aria-hidden>
      <defs>
        <radialGradient id="eo-planet" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#818CF8" />
        </radialGradient>
        <radialGradient id="eo-moon" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="42" rx="52" ry="18" fill="none" stroke="#C7D2FE" strokeDasharray="3 4" />
      <circle cx="60" cy="40" r="18" fill="url(#eo-planet)" />
      <circle cx="104" cy="34" r="6" fill="url(#eo-moon)" />
      <circle cx="18" cy="16" r="1.5" fill="#F9A8D4" />
      <circle cx="96" cy="10" r="1.2" fill="#38BDF8" />
      <circle cx="30" cy="66" r="1" fill="#A5B4FC" />
    </svg>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</div>}
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-body">{description}</p>}
      </div>
      {action}
    </div>
  );
}
