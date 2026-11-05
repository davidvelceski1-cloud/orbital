import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const nf = new Intl.NumberFormat("en-US");

/** 1234567 → "1,234,567"; rounds to `digits` decimals. */
export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

/** Large km values → "149.6 million km" style. */
export function formatKm(km: number) {
  const abs = Math.abs(km);
  if (abs >= 1e9) return `${(km / 1e9).toFixed(2)} billion km`;
  if (abs >= 1e6) return `${(km / 1e6).toFixed(1)} million km`;
  return `${nf.format(Math.round(km))} km`;
}

/** Hours → friendly duration ("23.9 hours", "58.6 days", "-243 days (retrograde)"). */
export function formatDayLength(hours: number) {
  const retro = hours < 0;
  const h = Math.abs(hours);
  const text = h >= 72 ? `${formatNumber(h / 24, 1)} Earth days` : `${formatNumber(h, 1)} hours`;
  return retro ? `${text} (retrograde)` : text;
}

export function formatYearLength(days: number) {
  const d = Math.abs(days);
  const retro = days < 0 ? " (retrograde)" : "";
  if (d >= 730) return `${formatNumber(d / 365.25, 1)} Earth years${retro}`;
  if (d < 2) return `${formatNumber(d * 24, 1)} hours${retro}`;
  return `${formatNumber(d, 1)} Earth days${retro}`;
}

export function formatTemp(t: { min?: number; mean: number; max?: number }) {
  if (t.min !== undefined && t.max !== undefined) return `${formatNumber(t.min)} to ${formatNumber(t.max)} °C`;
  return `${formatNumber(t.mean)} °C`;
}

/** Duration in hours → the largest sensible unit. */
export function formatDuration(hours: number) {
  if (!isFinite(hours)) return "—";
  const seconds = hours * 3600;
  if (seconds < 60) return `${formatNumber(seconds, 1)} seconds`;
  if (hours < 1) return `${formatNumber(hours * 60, 1)} minutes`;
  if (hours < 48) return `${formatNumber(hours, 1)} hours`;
  const days = hours / 24;
  if (days < 365 * 2) return `${formatNumber(days, 0)} days`;
  const years = days / 365.25;
  if (years < 1e6) return `${formatNumber(years, years < 100 ? 1 : 0)} years`;
  return `${formatNumber(years / 1e6, 1)} million years`;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
