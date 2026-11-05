"use client";

/**
 * Scene labels rendered as one plain DOM overlay instead of drei <Html>.
 * <Html> mounts a separate React root per label and unmounts it synchronously,
 * which races React's own rendering ("Attempted to synchronously unmount a root…").
 * Here the 3D scene only registers anchor objects; a projector inside the Canvas
 * moves the overlay's buttons every frame by writing transforms directly.
 */
import { useSyncExternalStore } from "react";
import type * as THREE from "three";
import { useExplorer } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface LabelSpec {
  id: string;
  name: string;
  show: boolean;
  dot: boolean;
  small: boolean;
  /** Object whose world position the label sits on */
  anchor: THREE.Object3D;
}

const specs = new Map<string, LabelSpec>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export function upsertLabel(spec: LabelSpec) {
  specs.set(spec.id, spec);
  emit();
}

export function removeLabel(id: string, anchor: THREE.Object3D) {
  // Only remove if this anchor still owns the label (StrictMode re-mounts may have replaced it).
  if (specs.get(id)?.anchor === anchor && specs.delete(id)) emit();
}

export function labelSpecs() {
  return specs;
}

/** DOM nodes of the rendered labels, positioned imperatively by the projector. */
export const labelElements = new Map<string, HTMLElement>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function useLabelSpecs() {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  return [...specs.values()];
}

export function SceneLabels() {
  const all = useLabelSpecs();
  const focusedId = useExplorer((s) => s.focusedId);
  const focus = useExplorer((s) => s.focus);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden>
      {all.map((s) => (
        <button
          key={s.id}
          type="button"
          tabIndex={-1}
          ref={(el) => {
            if (el) labelElements.set(s.id, el);
            else labelElements.delete(s.id);
          }}
          onClick={() => focus(s.id)}
          className="pointer-events-auto invisible absolute left-0 top-0 flex flex-col items-center gap-1 whitespace-nowrap will-change-transform"
        >
          {s.show && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-medium shadow-sm backdrop-blur-md transition-colors",
                s.small ? "text-[10px]" : "text-[11px]",
                focusedId === s.id
                  ? "border-primary/40 bg-primary text-white"
                  : "border-white/60 bg-white/70 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200",
              )}
            >
              {s.name}
            </span>
          )}
          {s.dot && <span className="size-2 rounded-full bg-primary ring-2 ring-white/80" />}
        </button>
      ))}
    </div>
  );
}
