/**
 * Core data models for Orbital.
 * Everything the UI renders — objects, missions, lessons, sky events — is typed here
 * so seed data, the AI guide and the components all share one vocabulary.
 */

export type ObjectKind = "star" | "planet" | "dwarf" | "moon";

export interface Source {
  title: string;
  url: string;
  publisher: "NASA" | "ESA" | "JPL" | "IAU" | "Other";
}

/** Keplerian elements for bodies astronomy-engine doesn't cover (most dwarf planets). */
export interface OrbitalElements {
  /** Semi-major axis in AU */
  a: number;
  /** Eccentricity */
  e: number;
  /** Inclination to the ecliptic, degrees */
  i: number;
  /** Longitude of ascending node, degrees */
  node: number;
  /** Argument of perihelion, degrees */
  argPeri: number;
  /** Time of perihelion passage (ISO date) */
  perihelion: string;
  /** Orbital period in days */
  periodDays: number;
}

export interface CelestialObject {
  id: string;
  name: string;
  kind: ObjectKind;
  /** For moons: the id of the body they orbit */
  parentId?: string;
  tagline: string;
  description: string;
  /** Mean radius, km */
  radiusKm: number;
  /** Mean distance from the Sun (planets/dwarfs) in km */
  distanceFromSunKm?: number;
  /** Mean distance from parent (moons) in km */
  distanceFromParentKm?: number;
  /** Sidereal rotation period in hours; negative = retrograde */
  dayLengthHours: number;
  /** Orbital period in Earth days (around the Sun, or around the parent for moons); negative = retrograde */
  orbitalPeriodDays?: number;
  /** Surface gravity in m/s² (cloud-top for giants) */
  gravity: number;
  temperatureC: { min?: number; mean: number; max?: number };
  moonCount?: number;
  composition: string[];
  axialTiltDeg?: number;
  /** Base and secondary colors used by the 3D renderer and illustrations */
  color: string;
  colorAlt?: string;
  hasRings?: boolean;
  /** Only for bodies astronomy-engine can't compute */
  elements?: OrbitalElements;
  funFact: string;
  suggestedQuestions: string[];
  sources: Source[];
}

/** Non-celestial "objects" used for scale comparisons (countries, everyday items). */
export interface ComparisonPlace {
  id: string;
  name: string;
  /** Characteristic width, km (treated as a diameter for side-by-side display) */
  widthKm: number;
  note: string;
  emoji: string;
}

export type MissionStatus = "active" | "completed" | "upcoming";

export interface Mission {
  id: string;
  name: string;
  agency: string;
  launchYear: number;
  /** Optional finer launch date (ISO) for sorting/labels */
  launchDate?: string;
  endYear?: number;
  status: MissionStatus;
  /** Extra nuance on status (e.g. extended missions, schedule changes) */
  statusNote?: string;
  destination: string;
  goal: string;
  discoveries: string[];
  /** Object id in the 3D explorer to fly to for "Where is it now?" */
  explorerTarget?: string;
  /** Spacecraft id when the explorer shows the craft itself */
  spacecraftId?: string;
  crewed?: boolean;
  source: Source;
}

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type DiagramKind =
  | "planet-order"
  | "scale-walk"
  | "star-lifecycle"
  | "nebula-collapse"
  | "seasons"
  | "day-length"
  | "black-hole"
  | "light-bending"
  | "moon-phases"
  | "tides";

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  /** Short paragraphs; **bold** markdown is supported */
  body: string[];
  diagram: DiagramKind;
  diagramCaption: string;
  quiz: QuizQuestion[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate";
  /** Lucide icon name */
  icon: "Orbit" | "Sparkles" | "Sun" | "CircleDot" | "Moon";
  gradient: string;
  badge: { id: string; name: string; description: string };
  lessons: Lesson[];
}

export type ExplanationLevel = "kid" | "adult" | "nerd";

export interface KnowledgeNote {
  id: string;
  title: string;
  tags: string[];
  text: string;
  source: Source;
}

export interface Spacecraft {
  id: string;
  name: string;
  /** How the explorer places it */
  placement:
    | { type: "deep-space"; eclipticLonDeg: number; eclipticLatDeg: number; distanceAu: number; epoch: string; auPerYear: number }
    | { type: "near"; objectId: string; offsetKm: number; note: string }
    | { type: "orbit"; perihelionAu: number; aphelionAu: number; periodDays: number; epoch: string };
  description: string;
  missionId: string;
}
