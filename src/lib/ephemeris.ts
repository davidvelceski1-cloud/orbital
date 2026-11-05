/**
 * Position engine for the 3D explorer.
 * - Planets + Pluto: astronomy-engine heliocentric vectors (≈1 arcminute accuracy).
 * - Other dwarf planets: Keplerian elements solved with Newton's method.
 * - Moons: circular orbits with real periods/radii (positions are illustrative, not ephemeris-grade).
 * - Spacecraft: approximate placements from src/data/missions.ts.
 * All positions are heliocentric ecliptic J2000, in AU, converted to three.js axes (y = up = ecliptic north).
 */
import * as Astronomy from "astronomy-engine";
import { AU_KM, getObject } from "@/data/objects";
import type { CelestialObject, OrbitalElements, Spacecraft } from "@/lib/types";

export type Vec3 = [number, number, number];

const DEG = Math.PI / 180;
const ENGINE_BODIES: Record<string, Astronomy.Body> = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  earth: Astronomy.Body.Earth,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

/** Equatorial J2000 → ecliptic J2000 rotation (obliquity ε). */
const EPS = 23.4392911 * DEG;
function equToEcl(x: number, y: number, z: number): Vec3 {
  return [x, y * Math.cos(EPS) + z * Math.sin(EPS), -y * Math.sin(EPS) + z * Math.cos(EPS)];
}

/** Ecliptic (x, y, z) with z = north → three.js (x, y=up, z). */
function toScene([x, y, z]: Vec3): Vec3 {
  return [x, z, -y];
}

function keplerPosition(el: OrbitalElements, date: Date): Vec3 {
  const days = (date.getTime() - new Date(el.perihelion).getTime()) / 86_400_000;
  const M = ((2 * Math.PI * days) / el.periodDays) % (2 * Math.PI);
  let E = M;
  for (let k = 0; k < 8; k++) E -= (E - el.e * Math.sin(E) - M) / (1 - el.e * Math.cos(E));
  const xv = el.a * (Math.cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);
  const N = el.node * DEG;
  const i = el.i * DEG;
  const w = el.argPeri * DEG;
  const x = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
  const y = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
  const z = r * Math.sin(v + w) * Math.sin(i);
  return [x, y, z];
}

/** Heliocentric ecliptic position in AU (ecliptic axes, z = north). */
export function heliocentricAu(obj: CelestialObject, date: Date): Vec3 {
  const body = ENGINE_BODIES[obj.id];
  if (body !== undefined) {
    const v = Astronomy.HelioVector(body, date);
    return equToEcl(v.x, v.y, v.z);
  }
  if (obj.elements) return keplerPosition(obj.elements, date);
  return [0, 0, 0];
}

/** Moon offset from its parent in km (scene axes), circular orbit in the parent's equator-ish plane. */
export function moonOffsetKm(moon: CelestialObject, date: Date): Vec3 {
  const period = moon.orbitalPeriodDays ?? 1;
  const r = moon.distanceFromParentKm ?? 0;
  const days = date.getTime() / 86_400_000;
  // Phase seeded per moon so siblings don't line up.
  const seed = [...moon.id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const angle = (2 * Math.PI * days) / period + seed;
  const parent = moon.parentId ? getObject(moon.parentId) : undefined;
  const tilt = Math.min(parent?.axialTiltDeg ?? 0, 90) * DEG * 0.35;
  const x = r * Math.cos(angle);
  const z = -r * Math.sin(angle);
  return [x, z * Math.sin(tilt), z * Math.cos(tilt)];
}

/** Scene-space helio position in AU. */
export function sceneHelioAu(obj: CelestialObject, date: Date): Vec3 {
  return toScene(heliocentricAu(obj, date));
}

/** Sample a full orbit path (scene AU) for drawing orbit lines. */
export function orbitPath(obj: CelestialObject, date: Date, samples = 256): Vec3[] {
  const period = obj.orbitalPeriodDays ?? 365;
  const pts: Vec3[] = [];
  for (let k = 0; k <= samples; k++) {
    const t = new Date(date.getTime() + (k / samples) * period * 86_400_000);
    pts.push(sceneHelioAu(obj, t));
  }
  return pts;
}

/** Approximate spacecraft position (scene AU). */
export function spacecraftAu(craft: Spacecraft, date: Date): Vec3 {
  const p = craft.placement;
  if (p.type === "deep-space") {
    const years = (date.getTime() - new Date(p.epoch).getTime()) / (365.25 * 86_400_000);
    const r = p.distanceAu + p.auPerYear * years;
    const lon = p.eclipticLonDeg * DEG;
    const lat = p.eclipticLatDeg * DEG;
    return toScene([r * Math.cos(lat) * Math.cos(lon), r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat)]);
  }
  if (p.type === "near") {
    const host = getObject(p.objectId)!;
    const [x, y, z] = heliocentricAu(host, date);
    const r = Math.hypot(x, y, z);
    const k = 1 + p.offsetKm / AU_KM / r; // push outward, away from the Sun (L2-like)
    return toScene([x * k, y * k, z * k]);
  }
  const a = (p.perihelionAu + p.aphelionAu) / 2;
  const e = (p.aphelionAu - p.perihelionAu) / (p.aphelionAu + p.perihelionAu);
  return toScene(
    keplerPosition({ a, e, i: 3.4, node: 76, argPeri: 0, perihelion: p.epoch, periodDays: p.periodDays }, date),
  );
}

/** Distance in AU between Earth and a body on a date (for "how far right now"). */
export function distanceFromEarthAu(obj: CelestialObject, date: Date) {
  const a = heliocentricAu(obj, date);
  const e = heliocentricAu(getObject("earth")!, date);
  return Math.hypot(a[0] - e[0], a[1] - e[1], a[2] - e[2]);
}
