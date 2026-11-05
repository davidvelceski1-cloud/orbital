/**
 * Scene scale mapping for the explorer.
 * - "realistic": 1 AU = 100 scene units, sizes and distances share one true scale.
 * - "readable": distances compressed with a square root and sizes boosted, so everything fits and stays visible.
 */
import { AU_KM, getObject } from "@/data/objects";
import type { CelestialObject } from "@/lib/types";
import type { ScaleMode } from "@/lib/store";
import type { Vec3 } from "@/lib/ephemeris";

export const AU_UNITS = 100; // realistic: scene units per AU

export function mapDistance(au: number, mode: ScaleMode) {
  return mode === "realistic" ? au * AU_UNITS : 8 * Math.sqrt(au);
}

/** Map a heliocentric AU vector into scene space, preserving direction. */
export function mapHelio(v: Vec3, mode: ScaleMode): Vec3 {
  const r = Math.hypot(v[0], v[1], v[2]);
  if (r === 0) return [0, 0, 0];
  const k = mapDistance(r, mode) / r;
  return [v[0] * k, v[1] * k, v[2] * k];
}

export function displayRadius(obj: CelestialObject, mode: ScaleMode) {
  if (mode === "realistic") return (obj.radiusKm / AU_KM) * AU_UNITS;
  if (obj.kind === "star") return 2.4;
  const r = 0.18 * Math.sqrt(obj.radiusKm / 1000);
  return obj.kind === "moon" ? Math.max(0.05, r * 0.6) : Math.max(0.1, r);
}

/** Orbit radius of a moon around its parent in scene units. */
export function moonOrbitRadius(moon: CelestialObject, mode: ScaleMode) {
  const parent = getObject(moon.parentId!)!;
  const km = moon.distanceFromParentKm ?? 0;
  if (mode === "realistic") return (km / AU_KM) * AU_UNITS;
  const k = km / parent.radiusKm;
  return displayRadius(parent, mode) * (1.4 + 0.35 * Math.sqrt(k));
}

/** A comfortable camera distance for viewing an object. */
export function viewDistance(obj: CelestialObject, mode: ScaleMode) {
  const r = displayRadius(obj, mode);
  if (obj.kind === "star") return r * (mode === "realistic" ? 8 : 9);
  return r * (obj.hasRings ? 7 : 6) + (mode === "readable" ? 1.2 : 0);
}
