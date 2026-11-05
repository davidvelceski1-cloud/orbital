/**
 * Tonight's Sky calculations, all done locally with astronomy-engine.
 * Altitudes are translated to "fists above the horizon" (a fist at arm's length ≈ 10°).
 */
import * as Astronomy from "astronomy-engine";
import { METEOR_SHOWERS } from "@/data/extras";

export interface PlanetVisibility {
  id: string;
  name: string;
  visible: boolean;
  /** Best viewing moment tonight */
  bestTime: Date | null;
  altitude: number;
  azimuth: number;
  direction: string;
  altitudeHint: string;
  magnitude: number;
  rise: Date | null;
  set: Date | null;
  nakedEye: boolean;
  summary: string;
}

export interface SkyEvent {
  id: string;
  title: string;
  date: Date;
  kind: "eclipse" | "meteor" | "planet" | "moon" | "iss";
  description: string;
  /** Event duration in minutes for calendar export */
  durationMin?: number;
}

const PLANETS: { id: string; name: string; body: Astronomy.Body; nakedEye: boolean }[] = [
  { id: "mercury", name: "Mercury", body: Astronomy.Body.Mercury, nakedEye: true },
  { id: "venus", name: "Venus", body: Astronomy.Body.Venus, nakedEye: true },
  { id: "mars", name: "Mars", body: Astronomy.Body.Mars, nakedEye: true },
  { id: "jupiter", name: "Jupiter", body: Astronomy.Body.Jupiter, nakedEye: true },
  { id: "saturn", name: "Saturn", body: Astronomy.Body.Saturn, nakedEye: true },
  { id: "uranus", name: "Uranus", body: Astronomy.Body.Uranus, nakedEye: false },
  { id: "neptune", name: "Neptune", body: Astronomy.Body.Neptune, nakedEye: false },
];

const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
export function compass(az: number) {
  return COMPASS[Math.round((((az % 360) + 360) % 360) / 45) % 8];
}

export function altitudeHint(alt: number) {
  if (alt < 5) return "right on the horizon";
  const fists = Math.max(1, Math.round(alt / 10));
  if (alt > 75) return "almost straight overhead";
  return `about ${fists} fist${fists > 1 ? "s" : ""} above the horizon`;
}

function horizontal(body: Astronomy.Body, date: Date, obs: Astronomy.Observer) {
  const eq = Astronomy.Equator(body, date, obs, true, true);
  return Astronomy.Horizon(date, obs, eq.ra, eq.dec, "normal");
}

/** Tonight = from sunset (or now, if later) to next sunrise. Handles polar day/night. */
export function nightWindow(obs: Astronomy.Observer, now = new Date()) {
  const startOfDay = new Date(now);
  startOfDay.setHours(12, 0, 0, 0);
  if (now.getHours() < 6) startOfDay.setDate(startOfDay.getDate() - 1);
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, startOfDay, 1)?.date ?? null;
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, sunset ?? startOfDay, 1)?.date ?? null;
  const start = sunset && sunset > now ? sunset : now;
  const end = sunrise ?? new Date(start.getTime() + 10 * 3_600_000);
  return { sunset, sunrise, start, end };
}

export function planetsTonight(lat: number, lon: number, now = new Date()): PlanetVisibility[] {
  const obs = new Astronomy.Observer(lat, lon, 0);
  const { start, end } = nightWindow(obs, now);
  // Look from 40 min after sunset (twilight fading) until 40 min before sunrise.
  const from = new Date(start.getTime() + 40 * 60_000);
  const to = new Date(Math.max(from.getTime() + 60 * 60_000, end.getTime() - 40 * 60_000));

  return PLANETS.map((p) => {
    let best = { alt: -90, az: 0, t: from };
    for (let t = from.getTime(); t <= to.getTime(); t += 15 * 60_000) {
      const d = new Date(t);
      const sunAlt = horizontal(Astronomy.Body.Sun, d, obs).altitude;
      if (sunAlt > -8) continue;
      const h = horizontal(p.body, d, obs);
      if (h.altitude > best.alt) best = { alt: h.altitude, az: h.azimuth, t: d };
    }
    const mag = Astronomy.Illumination(p.body, best.t).mag;
    const rise = Astronomy.SearchRiseSet(p.body, obs, +1, start, 1)?.date ?? null;
    const set = Astronomy.SearchRiseSet(p.body, obs, -1, start, 1)?.date ?? null;
    const visible = best.alt > 8;
    const dir = compass(best.az);
    const time = best.t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const summary = visible
      ? `Look ${dir}, ${altitudeHint(best.alt)}, around ${time}.${p.nakedEye ? "" : " You'll need binoculars or a telescope."}`
      : "Not well placed tonight — it's below the horizon or lost in twilight.";
    return {
      id: p.id,
      name: p.name,
      visible,
      bestTime: visible ? best.t : null,
      altitude: best.alt,
      azimuth: best.az,
      direction: dir,
      altitudeHint: altitudeHint(best.alt),
      magnitude: mag,
      rise,
      set,
      nakedEye: p.nakedEye,
      summary,
    };
  });
}

export interface MoonInfo {
  phaseName: string;
  illumination: number;
  /** 0–360°, 0 = new, 180 = full */
  phaseAngle: number;
  nextFull: Date;
  nextNew: Date;
  rise: Date | null;
  set: Date | null;
}

export function phaseName(angle: number) {
  if (angle < 10 || angle > 350) return "New Moon";
  if (angle < 80) return "Waxing Crescent";
  if (angle < 100) return "First Quarter";
  if (angle < 170) return "Waxing Gibbous";
  if (angle < 190) return "Full Moon";
  if (angle < 260) return "Waning Gibbous";
  if (angle < 280) return "Last Quarter";
  return "Waning Crescent";
}

export function moonInfo(lat: number, lon: number, now = new Date()): MoonInfo {
  const obs = new Astronomy.Observer(lat, lon, 0);
  const angle = Astronomy.MoonPhase(now);
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, now).phase_fraction;
  return {
    phaseName: phaseName(angle),
    illumination: illum,
    phaseAngle: angle,
    nextFull: Astronomy.SearchMoonPhase(180, now, 40)!.date,
    nextNew: Astronomy.SearchMoonPhase(0, now, 40)!.date,
    rise: Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, +1, now, 1)?.date ?? null,
    set: Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, now, 1)?.date ?? null,
  };
}

/** Upcoming notable events over the next ~year. */
export function upcomingEvents(lat: number, lon: number, now = new Date()): SkyEvent[] {
  const obs = new Astronomy.Observer(lat, lon, 0);
  const events: SkyEvent[] = [];
  const horizon = new Date(now.getTime() + 400 * 86_400_000);

  // Lunar eclipses (visible from the night side of Earth)
  let le = Astronomy.SearchLunarEclipse(now);
  for (let k = 0; k < 3 && le.peak.date < horizon; k++) {
    const moonAlt = horizontal(Astronomy.Body.Moon, le.peak.date, obs).altitude;
    events.push({
      id: `lunar-${le.peak.date.toISOString()}`,
      title: `${cap(le.kind)} lunar eclipse`,
      date: le.peak.date,
      kind: "eclipse",
      durationMin: Math.round(le.sd_partial * 2) || 60,
      description:
        moonAlt > 0
          ? "Visible from your location — the Moon will be above the horizon at peak."
          : "The Moon will be below your horizon at peak, so you'll likely miss this one.",
    });
    le = Astronomy.NextLunarEclipse(le.peak.date);
  }

  // Solar eclipses as seen from this location
  let se = Astronomy.SearchLocalSolarEclipse(now, obs);
  for (let k = 0; k < 2 && se.peak.time.date < horizon; k++) {
    events.push({
      id: `solar-${se.peak.time.date.toISOString()}`,
      title: `${cap(se.kind)} solar eclipse`,
      date: se.peak.time.date,
      kind: "eclipse",
      durationMin: 120,
      description: `About ${Math.round(se.obscuration * 100)}% of the Sun covered from your location. Never look without certified eclipse glasses.`,
    });
    se = Astronomy.NextLocalSolarEclipse(se.peak.time.date, obs);
  }

  // Oppositions: outer planets at their biggest and brightest
  for (const [name, body] of [
    ["Mars", Astronomy.Body.Mars],
    ["Jupiter", Astronomy.Body.Jupiter],
    ["Saturn", Astronomy.Body.Saturn],
  ] as const) {
    const t = Astronomy.SearchRelativeLongitude(body, 0, now);
    if (t.date < horizon)
      events.push({
        id: `opp-${name}`,
        title: `${name} at opposition`,
        date: t.date,
        kind: "planet",
        description: `${name} is opposite the Sun: up all night, and at its brightest for the year.`,
      });
  }

  // Greatest elongations of Venus and Mercury (best times to spot them)
  for (const [name, body] of [
    ["Venus", Astronomy.Body.Venus],
    ["Mercury", Astronomy.Body.Mercury],
  ] as const) {
    const el = Astronomy.SearchMaxElongation(body, now);
    if (el.time.date < horizon)
      events.push({
        id: `elong-${name}`,
        title: `${name} at greatest ${el.visibility} elongation`,
        date: el.time.date,
        kind: "planet",
        description: `${name} is ${Math.round(el.elongation)}° from the Sun — look ${el.visibility === "evening" ? "west after sunset" : "east before sunrise"}.`,
      });
  }

  // Next full and new moons
  for (const [angle, label] of [
    [180, "Full Moon"],
    [0, "New Moon — best for stargazing"],
  ] as const) {
    const t = Astronomy.SearchMoonPhase(angle, now, 40);
    if (t) events.push({ id: `moon-${angle}`, title: label, date: t.date, kind: "moon", description: angle === 0 ? "Dark skies: ideal for faint galaxies and meteor watching." : "The whole near side is lit." });
  }

  // Meteor shower peaks (next occurrence of each)
  for (const m of METEOR_SHOWERS) {
    let d = new Date(now.getFullYear(), m.peakMonth - 1, m.peakDay, 2);
    if (d.getTime() < now.getTime() - 86_400_000) d = new Date(now.getFullYear() + 1, m.peakMonth - 1, m.peakDay, 2);
    const illum = Astronomy.Illumination(Astronomy.Body.Moon, d).phase_fraction;
    events.push({
      id: `meteor-${m.name}`,
      title: `${m.name} meteor shower peak`,
      date: d,
      kind: "meteor",
      durationMin: 240,
      description: `Up to ~${m.zhr} meteors/hour under ideal dark skies (from ${m.parent}). Moon ${Math.round(illum * 100)}% lit${illum > 0.6 ? " — moonlight will hide fainter meteors" : ""}. Best after midnight.`,
    });
  }

  return events.filter((e) => e.date >= new Date(now.getTime() - 86_400_000)).sort((a, b) => a.date.getTime() - b.date.getTime());
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Sun's geocentric direction (unit vector, J2000 equatorial ≈ ECI) — used for ISS sunlit checks. */
export function sunDirection(date: Date): [number, number, number] {
  const v = Astronomy.GeoVector(Astronomy.Body.Sun, date, true);
  const r = Math.hypot(v.x, v.y, v.z);
  return [v.x / r, v.y / r, v.z / r];
}

export function sunAltitude(lat: number, lon: number, date: Date) {
  return horizontal(Astronomy.Body.Sun, date, new Astronomy.Observer(lat, lon, 0)).altitude;
}
