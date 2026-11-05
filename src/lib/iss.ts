/**
 * Visible ISS pass prediction with satellite.js (SGP4).
 * A pass is "visible" when the ISS is above 10°, the sky is dark (Sun < −6°)
 * and the station itself is sunlit (not in Earth's cylindrical shadow).
 */
import * as satellite from "satellite.js";
import { sunAltitude, sunDirection, compass, type SkyEvent } from "@/lib/sky";

const EARTH_RADIUS_KM = 6371;
const DEG = Math.PI / 180;

export interface IssPass {
  start: Date;
  peak: Date;
  end: Date;
  maxElevation: number;
  startDir: string;
  endDir: string;
}

export function predictIssPasses(tle: { line1: string; line2: string }, lat: number, lon: number, hours = 72): IssPass[] {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
  const observer = { latitude: lat * DEG, longitude: lon * DEG, height: 0 };
  const passes: IssPass[] = [];
  let current: { start: Date; peak: Date; max: number; startAz: number; endAz: number; end: Date; visible: boolean } | null = null;

  const now = Date.now();
  for (let t = now; t < now + hours * 3_600_000; t += 20_000) {
    const date = new Date(t);
    const pv = satellite.propagate(satrec, date);
    const pos = pv?.position;
    if (!pos || typeof pos === "boolean") continue;
    const gmst = satellite.gstime(date);
    const look = satellite.ecfToLookAngles(observer, satellite.eciToEcf(pos, gmst));
    const el = look.elevation / DEG;
    const az = look.azimuth / DEG;

    if (el > 10) {
      const dark = sunAltitude(lat, lon, date) < -6;
      const lit = isSunlit([pos.x, pos.y, pos.z], sunDirection(date));
      if (!current) current = { start: date, peak: date, max: el, startAz: az, endAz: az, end: date, visible: false };
      if (el > current.max) {
        current.max = el;
        current.peak = date;
      }
      current.end = date;
      current.endAz = az;
      if (dark && lit) current.visible = true;
    } else if (current) {
      if (current.visible)
        passes.push({
          start: current.start,
          peak: current.peak,
          end: current.end,
          maxElevation: current.max,
          startDir: compass(current.startAz),
          endDir: compass(current.endAz),
        });
      current = null;
      t += 20 * 60_000; // skip ahead — next pass is at least ~90 minutes away
    }
  }
  return passes;
}

function isSunlit(r: [number, number, number], sun: [number, number, number]) {
  const dot = r[0] * sun[0] + r[1] * sun[1] + r[2] * sun[2];
  if (dot > 0) return true; // on the day side
  const perp = Math.sqrt(Math.max(0, r[0] ** 2 + r[1] ** 2 + r[2] ** 2 - dot * dot));
  return perp > EARTH_RADIUS_KM;
}

export function passToEvent(p: IssPass): SkyEvent {
  const mins = Math.max(1, Math.round((p.end.getTime() - p.start.getTime()) / 60_000));
  return {
    id: `iss-${p.start.toISOString()}`,
    title: "ISS pass",
    date: p.start,
    kind: "iss",
    durationMin: mins,
    description: `Appears in the ${p.startDir}, climbs to ${Math.round(p.maxElevation)}° and fades toward the ${p.endDir}. Visible for about ${mins} minute${mins > 1 ? "s" : ""} — a bright, steady, fast-moving light.`,
  };
}
