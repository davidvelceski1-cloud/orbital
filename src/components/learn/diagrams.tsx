"use client";

/**
 * Interactive lesson diagrams. Each is a small, self-contained SVG with one or two controls,
 * designed to make a single idea click. All are keyboard-operable via the sliders/buttons.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Slider, Switch } from "@/components/ui/controls";
import { Segmented } from "@/components/ui/primitives";
import { PLANETS, SUN } from "@/data/objects";
import type { DiagramKind } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function LessonDiagram({ kind }: { kind: DiagramKind }) {
  switch (kind) {
    case "planet-order":
      return <PlanetOrder />;
    case "scale-walk":
      return <ScaleWalk />;
    case "star-lifecycle":
      return <StarLifecycle />;
    case "nebula-collapse":
      return <NebulaCollapse />;
    case "seasons":
      return <Seasons />;
    case "day-length":
      return <DayLength />;
    case "black-hole":
      return <BlackHole />;
    case "light-bending":
      return <LightBending />;
    case "moon-phases":
      return <MoonPhases />;
    case "tides":
      return <Tides />;
  }
}

function Frame({ children, controls }: { children: React.ReactNode; controls?: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-signature">
      <div className="px-2 pt-2">{children}</div>
      {controls && <div className="space-y-3 border-t border-border/60 bg-surface/70 p-4">{controls}</div>}
    </div>
  );
}

function Labeled({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        {value && <span className="text-ink tabular">{value}</span>}
      </div>
      {children}
    </div>
  );
}

/* ---------- Planet order ---------- */
function PlanetOrder() {
  const [selected, setSelected] = useState("earth");
  const [belts, setBelts] = useState(true);
  const sel = PLANETS.find((p) => p.id === selected)!;
  return (
    <Frame
      controls={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-body">
            <span className="font-semibold text-ink">{sel.name}</span> · {formatNumber((sel.distanceFromSunKm ?? 0) / 149.6e6, 2)} AU from the Sun · {sel.tagline}
          </p>
          <label className="flex items-center gap-2 text-sm text-ink">
            Show belts <Switch checked={belts} onCheckedChange={setBelts} label="Show belts" />
          </label>
        </div>
      }
    >
      <svg viewBox="0 0 640 160" className="w-full" role="img" aria-label="The eight planets in order from the Sun">
        <circle cx={-40} cy={80} r={90} fill="#FDBA74" opacity={0.9} />
        {belts && (
          <>
            <g opacity={0.6}>
              {Array.from({ length: 40 }).map((_, i) => (
                <circle key={i} cx={262 + ((i * 37) % 30)} cy={30 + ((i * 53) % 100)} r={1.3} fill="#B8A99A" />
              ))}
            </g>
            <text x={250} y={150} fontSize={10} fill="#64748B">Asteroid belt</text>
            <g opacity={0.6}>
              {Array.from({ length: 40 }).map((_, i) => (
                <circle key={i} cx={605 + ((i * 29) % 30)} cy={30 + ((i * 47) % 100)} r={1.3} fill="#A5B4FC" />
              ))}
            </g>
            <text x={585} y={150} fontSize={10} fill="#64748B">Kuiper</text>
          </>
        )}
        {PLANETS.map((p, i) => {
          const x = [95, 130, 170, 215, 340, 420, 495, 560][i];
          const r = Math.max(4, Math.sqrt(p.radiusKm) / 9);
          const active = p.id === selected;
          return (
            <g key={p.id} role="button" tabIndex={0} aria-label={p.name} onClick={() => setSelected(p.id)} onKeyDown={(e) => e.key === "Enter" && setSelected(p.id)} className="cursor-pointer outline-none">
              {p.hasRings && <ellipse cx={x} cy={80} rx={r * 1.9} ry={r * 0.45} fill="none" stroke="#E7D3A8" strokeWidth={2} />}
              <motion.circle cx={x} cy={80} r={r} fill={p.color} animate={{ scale: active ? 1.18 : 1 }} style={{ transformOrigin: `${x}px 80px` }} stroke={active ? "#6366F1" : "none"} strokeWidth={2} />
              <text x={x} y={80 + r + 16} fontSize={10} textAnchor="middle" fill={active ? "#4F46E5" : "#64748B"}>
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

/* ---------- Scale walk ---------- */
function ScaleWalk() {
  const [meters, setMeters] = useState(26);
  const k = 0.24 / (SUN.radiusKm * 2);
  const passed = PLANETS.filter((p) => (p.distanceFromSunKm ?? 0) * k <= meters);
  const next = PLANETS.find((p) => (p.distanceFromSunKm ?? 0) * k > meters);
  return (
    <Frame
      controls={
        <Labeled label="Walk outward from a basketball-sized Sun" value={`${formatNumber(meters)} m`}>
          <Slider value={meters} onValueChange={setMeters} min={0} max={800} label="Distance walked" />
        </Labeled>
      }
    >
      <div className="grid place-items-center gap-2 px-4 py-6 text-center">
        <div className="text-4xl" aria-hidden>🏀</div>
        <p className="text-sm text-body">
          You&apos;ve passed <span className="font-semibold text-ink">{passed.length}</span> planet{passed.length === 1 ? "" : "s"}
          {passed.length > 0 && <>: {passed.map((p) => p.name).join(", ")}</>}.
        </p>
        {next && (
          <p className="text-sm text-muted">
            Next: {next.name}, {formatNumber((next.distanceFromSunKm ?? 0) * k - meters)} m further — and only {formatNumber(next.radiusKm * 2 * k * 1000, 1)} mm wide.
          </p>
        )}
        {!next && <p className="text-sm font-medium text-primary">You&apos;ve walked past Neptune! The nearest star would be another ~7,000 km away.</p>}
      </div>
    </Frame>
  );
}

/* ---------- Star lifecycle ---------- */
const STAGES = {
  sun: [
    { name: "Nebula", r: 40, c: "#C7D2FE", note: "A cold cloud of gas and dust." },
    { name: "Protostar", r: 18, c: "#FDBA74", note: "Collapsing and heating up." },
    { name: "Main sequence", r: 22, c: "#FDE68A", note: "Fusing hydrogen for ~10 billion years." },
    { name: "Red giant", r: 46, c: "#FB923C", note: "Swells up as core hydrogen runs out." },
    { name: "Planetary nebula", r: 40, c: "#F9A8D4", note: "Outer layers drift away gently." },
    { name: "White dwarf", r: 7, c: "#E0F2FE", note: "An Earth-sized ember that slowly cools." },
  ],
  massive: [
    { name: "Nebula", r: 44, c: "#C7D2FE", note: "A large, dense cloud." },
    { name: "Protostar", r: 22, c: "#93C5FD", note: "Grows fast and hot." },
    { name: "Blue main sequence", r: 30, c: "#BFDBFE", note: "Burns blue-white for only millions of years." },
    { name: "Red supergiant", r: 52, c: "#F87171", note: "Hundreds of times wider than the Sun." },
    { name: "Supernova", r: 56, c: "#FDE68A", note: "The core collapses and the star explodes." },
    { name: "Neutron star or black hole", r: 5, c: "#334155", note: "A city-sized remnant — or a black hole." },
  ],
};

function StarLifecycle() {
  const [mass, setMass] = useState<"sun" | "massive">("sun");
  const [step, setStep] = useState(2);
  const stage = STAGES[mass][step];
  return (
    <Frame
      controls={
        <div className="space-y-3">
          <Segmented
            label="Star mass"
            size="sm"
            value={mass}
            onChange={setMass}
            options={[
              { value: "sun", label: "Sun-like star" },
              { value: "massive", label: "Massive star (8+ Suns)" },
            ]}
          />
          <Labeled label="Life stage" value={stage.name}>
            <Slider value={step} onValueChange={setStep} min={0} max={5} label="Life stage" />
          </Labeled>
        </div>
      }
    >
      <div className="grid place-items-center py-6">
        <svg viewBox="0 0 160 140" className="h-40" aria-hidden>
          <defs>
            <radialGradient id="star-g">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor={stage.c} />
            </radialGradient>
          </defs>
          {stage.name.includes("nebula") || stage.name === "Nebula" ? (
            Array.from({ length: 50 }).map((_, i) => (
              <motion.circle key={i} cx={80 + Math.cos(i * 2.4) * (10 + ((i * 7) % 40))} cy={70 + Math.sin(i * 2.4) * (8 + ((i * 11) % 34))} r={2.5} fill={stage.c} animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.05 }} />
            ))
          ) : (
            <motion.circle cx={80} cy={70} fill="url(#star-g)" animate={{ r: stage.r }} transition={{ type: "spring", stiffness: 80, damping: 14 }} />
          )}
        </svg>
        <p className="px-4 text-center text-sm text-body">{stage.note}</p>
      </div>
    </Frame>
  );
}

/* ---------- Nebula collapse ---------- */
function NebulaCollapse() {
  const [t, setT] = useState(0);
  const p = t / 100;
  return (
    <Frame
      controls={
        <Labeled label="Let gravity work" value={p < 0.4 ? "Cloud" : p < 0.8 ? "Collapsing disk" : "Protostar ignites"}>
          <Slider value={t} onValueChange={setT} min={0} max={100} label="Collapse progress" />
        </Labeled>
      }
    >
      <svg viewBox="0 0 300 160" className="w-full" aria-hidden>
        {Array.from({ length: 90 }).map((_, i) => {
          const a = i * 2.399;
          const r0 = 20 + ((i * 13) % 60);
          const r = r0 * (1 - p * 0.75);
          const flatten = 1 - p * 0.8;
          return <circle key={i} cx={150 + Math.cos(a + p * 3) * r * 1.6} cy={80 + Math.sin(a + p * 3) * r * flatten} r={1.8} fill="#A5B4FC" opacity={0.75} />;
        })}
        <circle cx={150} cy={80} r={3 + p * 10} fill="#FDBA74" opacity={0.3 + p * 0.7} />
        {p > 0.8 && <circle cx={150} cy={80} r={26} fill="#FDE68A" opacity={(p - 0.8) * 2} />}
      </svg>
    </Frame>
  );
}

/* ---------- Seasons ---------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Seasons() {
  const [month, setMonth] = useState(5);
  const [tilt, setTilt] = useState(23.4);
  // Angle around the orbit: June solstice = Earth on the side where the N pole leans toward the Sun.
  const theta = ((month - 5.7) / 12) * Math.PI * 2;
  const ex = 160 + Math.cos(theta) * 120;
  const ey = 85 + Math.sin(theta) * 50;
  // Subsolar latitude (approx.)
  const subsolar = tilt * Math.cos(theta);
  const north = subsolar > 3 ? "Summer" : subsolar < -3 ? "Winter" : month < 6 ? "Spring" : "Autumn";
  const south = subsolar > 3 ? "Winter" : subsolar < -3 ? "Summer" : month < 6 ? "Autumn" : "Spring";
  const distanceAu = 1 - 0.0167 * Math.cos(((month + 0.1) / 12) * Math.PI * 2);
  return (
    <Frame
      controls={
        <div className="grid gap-3 sm:grid-cols-2">
          <Labeled label="Month" value={MONTHS[month]}>
            <Slider value={month} onValueChange={setMonth} min={0} max={11} label="Month" />
          </Labeled>
          <Labeled label="Axial tilt" value={`${formatNumber(tilt, 1)}°`}>
            <Slider value={tilt} onValueChange={setTilt} min={0} max={45} step={0.1} label="Axial tilt" />
          </Labeled>
        </div>
      }
    >
      <svg viewBox="0 0 320 170" className="w-full" aria-hidden>
        <ellipse cx={160} cy={85} rx={120} ry={50} fill="none" stroke="#C7D2FE" strokeDasharray="4 4" />
        <circle cx={160} cy={85} r={16} fill="#FDBA74" />
        <g transform={`translate(${ex} ${ey})`}>
          <circle r={11} fill="#60A5FA" />
          <line x1={0} y1={-17} x2={0} y2={17} stroke="#334155" strokeWidth={1.5} transform={`rotate(${tilt})`} />
          <path d="M -11 0 A 11 11 0 0 1 11 0" fill="#0F172A" opacity={0.25} transform={`rotate(${(Math.atan2(85 - ey, 160 - ex) * 180) / Math.PI + 90})`} />
        </g>
        <text x={10} y={160} fontSize={11} fill="#475569">North: <tspan fontWeight={600} fill="#0F172A">{tilt < 1 ? "No seasons" : north}</tspan></text>
        <text x={180} y={160} fontSize={11} fill="#475569">South: <tspan fontWeight={600} fill="#0F172A">{tilt < 1 ? "No seasons" : south}</tspan></text>
        <text x={10} y={18} fontSize={10} fill="#64748B">Distance from Sun: {formatNumber(distanceAu, 3)} AU</text>
      </svg>
    </Frame>
  );
}

/* ---------- Day length ---------- */
function daylightHours(latDeg: number, dayOfYear: number) {
  const decl = 23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  const x = -Math.tan((latDeg * Math.PI) / 180) * Math.tan((decl * Math.PI) / 180);
  if (x <= -1) return 24;
  if (x >= 1) return 0;
  return (2 * Math.acos(x) * 180) / Math.PI / 15;
}

function DayLength() {
  const [lat, setLat] = useState(45);
  const [day, setDay] = useState(172);
  const hours = daylightHours(lat, day);
  const date = new Date(2026, 0, day);
  return (
    <Frame
      controls={
        <div className="grid gap-3 sm:grid-cols-2">
          <Labeled label="Latitude" value={`${Math.abs(lat)}° ${lat >= 0 ? "N" : "S"}`}>
            <Slider value={lat} onValueChange={setLat} min={-89} max={89} label="Latitude" />
          </Labeled>
          <Labeled label="Date" value={date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}>
            <Slider value={day} onValueChange={setDay} min={1} max={365} label="Day of year" />
          </Labeled>
        </div>
      }
    >
      <div className="px-4 py-6">
        <div className="mb-2 text-center font-display text-3xl font-semibold text-ink tabular">{formatNumber(hours, 1)} hours of daylight</div>
        <div className="mx-auto flex h-6 max-w-md overflow-hidden rounded-full bg-indigo-950/80">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300" animate={{ width: `${(hours / 24) * 100}%`, marginLeft: `${((24 - hours) / 48) * 100}%` }} />
        </div>
        <div className="mx-auto mt-1 flex max-w-md justify-between text-[11px] text-muted">
          <span>midnight</span>
          <span>noon</span>
          <span>midnight</span>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- Black hole ---------- */
function BlackHole() {
  const [massSuns, setMassSuns] = useState(10);
  const [radiusKm, setRadiusKm] = useState(100);
  const G = 6.674e-11;
  const M = massSuns * 1.989e30;
  const rs = (2 * G * M) / (3e8 * 3e8) / 1000; // km
  const r = Math.max(radiusKm, 0.001);
  const vEsc = Math.min(Math.sqrt((2 * G * M) / (r * 1000)), 3e8 * 10);
  const isBH = r <= rs;
  const pct = Math.min(1, vEsc / 3e8);
  return (
    <Frame
      controls={
        <div className="grid gap-3 sm:grid-cols-2">
          <Labeled label="Mass" value={`${formatNumber(massSuns)} Suns`}>
            <Slider value={massSuns} onValueChange={setMassSuns} min={1} max={100} label="Mass in solar masses" />
          </Labeled>
          <Labeled label="Squeeze it to a radius of" value={`${formatNumber(radiusKm)} km`}>
            <Slider value={radiusKm} onValueChange={setRadiusKm} min={1} max={1000} label="Radius in km" />
          </Labeled>
        </div>
      }
    >
      <div className="grid gap-4 px-4 py-6 sm:grid-cols-[160px_1fr] sm:items-center">
        <svg viewBox="0 0 160 160" className="mx-auto h-36" aria-hidden>
          <circle cx={80} cy={80} r={Math.min(70, (rs / 1000) * 70 * 3 + 6)} fill="none" stroke="#6366F1" strokeDasharray="3 3" />
          <motion.circle cx={80} cy={80} fill={isBH ? "#0F172A" : "#FDBA74"} animate={{ r: Math.max(3, Math.min(70, (radiusKm / 1000) * 70)) }} />
          {isBH && <circle cx={80} cy={80} r={Math.min(70, (rs / 1000) * 70 * 3 + 6) + 4} fill="none" stroke="#F9A8D4" strokeWidth={3} opacity={0.6} />}
        </svg>
        <div className="space-y-2 text-sm">
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Escape velocity</span>
              <span className="tabular">{isBH ? "≥ speed of light" : `${formatNumber(vEsc / 1000)} km/s`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border-strong">
              <motion.div className="h-full rounded-full [background:var(--gradient-button)]" animate={{ width: `${pct * 100}%` }} />
            </div>
          </div>
          <p className="text-body">
            Event horizon radius for this mass: <span className="font-semibold text-ink tabular">{formatNumber(rs, 1)} km</span> (dashed circle).
          </p>
          <p className={isBH ? "font-medium text-primary" : "text-muted"}>
            {isBH ? "Squeezed inside its event horizon — not even light can escape. It's a black hole!" : "Light can still escape. Keep squeezing…"}
          </p>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- Light bending ---------- */
function LightBending() {
  const [b, setB] = useState(60);
  const bend = Math.min(60, 1400 / (b * b)) * 3;
  const captured = b < 22;
  const path = captured ? `M 0 ${100 - b} C 120 ${100 - b}, 160 ${100 - b * 0.5}, 170 100` : `M 0 ${100 - b} C 120 ${100 - b}, 180 ${100 - b + bend * 0.2}, 320 ${100 - b + bend}`;
  return (
    <Frame
      controls={
        <Labeled label="How close the light passes" value={captured ? "Captured!" : `${b} units`}>
          <Slider value={b} onValueChange={setB} min={10} max={90} label="Impact distance" />
        </Labeled>
      }
    >
      <svg viewBox="0 0 320 200" className="w-full" aria-hidden>
        {[30, 50, 70].map((r) => (
          <circle key={r} cx={170} cy={100} r={r} fill="none" stroke="#C7D2FE" strokeDasharray="2 5" />
        ))}
        <circle cx={170} cy={100} r={22} fill="#0F172A" />
        <circle cx={170} cy={100} r={26} fill="none" stroke="#FDBA74" strokeWidth={3} opacity={0.6} />
        <motion.path d={path} fill="none" stroke="#6366F1" strokeWidth={2.5} animate={{ d: path }} />
      </svg>
    </Frame>
  );
}

/* ---------- Moon phases ---------- */
export function MoonPhaseShape({ angle, r = 34 }: { angle: number; r?: number }) {
  // angle 0 = new, 180 = full. Waxing lit on the right (Northern Hemisphere view).
  const a = ((angle % 360) + 360) % 360;
  const k = Math.cos((a * Math.PI) / 180);
  const waxing = a <= 180;
  const rx = Math.abs(k) * r;
  const sweepOuter = waxing ? 1 : 0;
  const gibbous = a > 90 && a < 270;
  const sweepInner = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1;
  const d = `M 0 ${-r} A ${r} ${r} 0 0 ${sweepOuter} 0 ${r} A ${rx} ${r} 0 0 ${sweepInner} 0 ${-r} Z`;
  return (
    <g>
      <circle r={r} fill="#334155" />
      <path d={d} fill="#F1F5F9" />
    </g>
  );
}

function phaseLabel(a: number) {
  const names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  return names[Math.round(a / 45) % 8];
}

function MoonPhases() {
  const [angle, setAngle] = useState(90);
  const [spin, setSpin] = useState(false);
  const rad = (angle * Math.PI) / 180;
  // Sun is to the left. Moon at angle 0 sits between Earth and Sun.
  const mx = 110 - Math.cos(rad) * 70;
  const my = 95 + Math.sin(rad) * 70;
  return (
    <Frame
      controls={
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1">
            <Labeled label="Moon's position in its orbit" value={phaseLabel(angle)}>
              <Slider value={angle} onValueChange={setAngle} min={0} max={359} label="Moon orbit angle" />
            </Labeled>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            Show the Moon&apos;s spin <Switch checked={spin} onCheckedChange={setSpin} label="Show the Moon's spin" />
          </label>
        </div>
      }
    >
      <svg viewBox="0 0 320 190" className="w-full" aria-hidden>
        <text x={6} y={16} fontSize={10} fill="#64748B">☀️ Sunlight →</text>
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1={0} x2={24} y1={y} y2={y} stroke="#FDBA74" strokeWidth={2} />
        ))}
        <circle cx={110} cy={95} r={70} fill="none" stroke="#C7D2FE" strokeDasharray="3 4" />
        <circle cx={110} cy={95} r={14} fill="#60A5FA" />
        <g transform={`translate(${mx} ${my})`}>
          <circle r={9} fill="#334155" />
          <path d="M 0 -9 A 9 9 0 0 0 0 9 Z" fill="#F1F5F9" />
          {spin && <line x1={0} y1={0} x2={(110 - mx) / 7} y2={(95 - my) / 7} stroke="#F43F5E" strokeWidth={2} />}
        </g>
        <text x={235} y={36} fontSize={10} fill="#64748B" textAnchor="middle">Seen from Earth</text>
        <g transform="translate(235 100)">
          <MoonPhaseShape angle={angle} />
        </g>
        <text x={235} y={160} fontSize={11} fill="#0F172A" textAnchor="middle" fontWeight={600}>{phaseLabel(angle)}</text>
      </svg>
    </Frame>
  );
}

/* ---------- Tides ---------- */
function Tides() {
  const [moon, setMoon] = useState(0);
  const sun = 0;
  const diff = Math.abs(((moon - sun + 540) % 360) - 180);
  const aligned = diff > 150 || diff < 30;
  const quarter = Math.abs(diff - 90) < 25;
  const stretch = aligned ? 1.32 : quarter ? 1.1 : 1.2;
  const mx = 160 - Math.cos((moon * Math.PI) / 180) * 120;
  const my = 90 - Math.sin((moon * Math.PI) / 180) * 70;
  const bulgeAngle = (Math.atan2(my - 90, mx - 160) * 180) / Math.PI;
  return (
    <Frame
      controls={
        <Labeled label="Moon's position around Earth" value={aligned ? "Spring tide" : quarter ? "Neap tide" : "In between"}>
          <Slider value={moon} onValueChange={setMoon} min={0} max={359} label="Moon angle" />
        </Labeled>
      }
    >
      <svg viewBox="0 0 320 180" className="w-full" aria-hidden>
        <text x={6} y={16} fontSize={10} fill="#64748B">← ☀️ Sun this way</text>
        <motion.ellipse cx={160} cy={90} fill="#BAE6FD" opacity={0.85} animate={{ rx: 46 * stretch, ry: 46 / stretch, rotate: bulgeAngle }} style={{ transformOrigin: "160px 90px" }} />
        <circle cx={160} cy={90} r={38} fill="#60A5FA" />
        <circle cx={mx} cy={my} r={10} fill="#CBD5E1" />
        <text x={160} y={172} fontSize={11} textAnchor="middle" fill="#0F172A" fontWeight={600}>
          {aligned ? "Sun and Moon aligned: big spring tides" : quarter ? "At right angles: gentle neap tides" : "Two bulges follow the Moon"}
        </text>
      </svg>
    </Frame>
  );
}
