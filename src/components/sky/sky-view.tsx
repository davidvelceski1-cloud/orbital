"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, CalendarPlus, Eye, EyeOff, LocateFixed, MapPin, Moon as MoonIcon, Satellite, Sparkles, Sunrise, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Chip, EmptyState, Skeleton, StatusBadge } from "@/components/ui/primitives";
import { PlanetOrb } from "@/components/ui/planet-orb";
import { MoonPhaseShape } from "@/components/learn/diagrams";
import { PRESET_CITIES } from "@/data/cities";
import { getObject } from "@/data/objects";
import { moonInfo, nightWindow, planetsTonight, upcomingEvents, type SkyEvent } from "@/lib/sky";
import { passToEvent, predictIssPasses } from "@/lib/iss";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { usePrefs, useProgress, useUI } from "@/lib/store";
import { useMounted } from "@/lib/hooks";
import * as Astronomy from "astronomy-engine";
import { cn, formatNumber } from "@/lib/utils";

const time = (d: Date | null) => (d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—");
const day = (d: Date) => d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

export function SkyView() {
  const mounted = useMounted();
  const location = usePrefs((s) => s.location);
  const set = usePrefs((s) => s.set);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const locate = () => {
    if (!("geolocation" in navigator)) return setLocError("Location isn't available in this browser.");
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        set({ location: { lat: p.coords.latitude, lon: p.coords.longitude, label: "My location" } });
        setLocating(false);
      },
      () => {
        setLocError("Location permission was denied — choose a city instead.");
        setLocating(false);
      },
      { timeout: 10_000, maximumAge: 3_600_000 },
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Tonight&apos;s Sky</div>
          <h1 className="mt-2 text-3xl sm:text-4xl">What&apos;s up there tonight?</h1>
          <p className="mt-2 max-w-xl text-body">Planets you can see, where to look, the Moon&apos;s phase and what&apos;s coming up — calculated for your sky.</p>
        </div>
        {mounted && location && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm text-ink ring-1 ring-border">
              <MapPin className="size-4 text-primary" /> {location.label} · {formatNumber(location.lat, 1)}°, {formatNumber(location.lon, 1)}°
            </span>
            <Button variant="ghost" size="sm" onClick={() => set({ location: null })}>
              Change
            </Button>
          </div>
        )}
      </header>

      {!mounted ? (
        <Skeleton className="h-72 w-full rounded-3xl" />
      ) : !location ? (
        <EmptyState
          illustration={<div className="text-5xl" aria-hidden>🔭</div>}
          title="Where are you stargazing from?"
          description="Share your location (it stays on this device) or pick a nearby city. We'll work out what's visible from there."
          action={
            <div className="flex flex-col items-center gap-4">
              <Button onClick={locate} disabled={locating}>
                <LocateFixed /> {locating ? "Finding you…" : "Use my location"}
              </Button>
              {locError && <p className="text-sm text-rose-600 dark:text-rose-400">{locError}</p>}
              <div className="flex max-w-xl flex-wrap justify-center gap-2">
                {PRESET_CITIES.map((c) => (
                  <Chip key={c.label} icon={MapPin} onClick={() => set({ location: c })}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>
          }
        />
      ) : (
        <SkyForLocation lat={location.lat} lon={location.lon} />
      )}
    </div>
  );
}

function SkyForLocation({ lat, lon }: { lat: number; lon: number }) {
  const now = useMemo(() => new Date(), []);
  const planets = useMemo(() => planetsTonight(lat, lon, now), [lat, lon, now]);
  const moon = useMemo(() => moonInfo(lat, lon, now), [lat, lon, now]);
  const night = useMemo(() => nightWindow(new Astronomy.Observer(lat, lon, 0), now), [lat, lon, now]);
  const events = useMemo(() => upcomingEvents(lat, lon, now), [lat, lon, now]);
  const iss = useIss(lat, lon);
  const visible = planets.filter((p) => p.visible);
  const ask = useUI((s) => s.ask);

  const allEvents = useMemo(
    () => [...(iss.passes ?? []).slice(0, 3).map(passToEvent), ...events].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [iss.passes, events],
  );

  return (
    <div className="space-y-10">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col items-center p-6 text-center lg:sticky lg:top-24 lg:self-start">
          <svg viewBox="-40 -40 80 80" className="size-32" aria-hidden>
            <MoonPhaseShape angle={moon.phaseAngle} r={36} />
          </svg>
          <h2 className="mt-3 text-2xl">{moon.phaseName}</h2>
          <p className="text-sm text-muted tabular">{Math.round(moon.illumination * 100)}% illuminated</p>
          <div className="mt-5 grid w-full grid-cols-2 gap-2 text-left text-sm">
            <Mini label="Moonrise" value={time(moon.rise)} />
            <Mini label="Moonset" value={time(moon.set)} />
            <Mini label="Next full Moon" value={day(moon.nextFull)} />
            <Mini label="Next new Moon" value={day(moon.nextNew)} />
          </div>
          <p className="mt-4 text-xs text-muted">All times are shown in your device&apos;s time zone.</p>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">Planets tonight</h2>
            <div className="flex gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1"><Sunset className="size-3.5 text-peach" /> Sunset {time(night.sunset)}</span>
              <span className="inline-flex items-center gap-1"><Sunrise className="size-3.5 text-peach" /> Sunrise {time(night.sunrise)}</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted">
            {visible.length > 0
              ? `${visible.filter((p) => p.nakedEye).length} visible to the naked eye. Hold your fist at arm's length — it covers about 10° of sky.`
              : "No planets are well placed tonight. The Moon and stars are still worth a look!"}
          </p>
          <ul className="mt-4 grid gap-2">
            {planets
              .slice()
              .sort((a, b) => Number(b.visible) - Number(a.visible))
              .map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn("flex items-center gap-3 rounded-2xl border border-border p-3", !p.visible && "opacity-60")}
                >
                  <PlanetOrb object={getObject(p.id)!} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{p.name}</span>
                      {p.visible ? (
                        <StatusBadge status="active">
                          <Eye className="size-3" /> {p.nakedEye ? (p.magnitude < -1 ? "Very bright" : "Visible") : "Binoculars"}
                        </StatusBadge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted"><EyeOff className="size-3" /> Not tonight</span>
                      )}
                    </div>
                    <p className="text-sm text-body">{p.summary}</p>
                  </div>
                  {p.visible && <CompassDial azimuth={p.azimuth} altitude={p.altitude} />}
                </motion.li>
              ))}
          </ul>
          {visible[0] && (
            <Button variant="soft" size="sm" className="mt-4" onClick={() => ask(`I can see ${visible[0].name} tonight. What should I look for?`)}>
              <Sparkles /> What should I look for on {visible[0].name}?
            </Button>
          )}
        </Card>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl">Coming up</h2>
            <p className="text-sm text-muted">Eclipses, meteor showers, planet highlights and ISS passes for your location.</p>
          </div>
          {iss.state === "error" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Satellite className="size-3.5" /> ISS predictions unavailable right now</span>
          )}
        </div>
        <EventCalendar events={allEvents} loadingIss={iss.state === "loading"} />
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="font-medium text-ink tabular">{value}</div>
    </div>
  );
}

function CompassDial({ azimuth, altitude }: { azimuth: number; altitude: number }) {
  return (
    <svg viewBox="-22 -22 44 44" className="size-12 shrink-0" role="img" aria-label={`Azimuth ${Math.round(azimuth)} degrees, altitude ${Math.round(altitude)} degrees`}>
      <circle r={20} fill="var(--surface-2)" stroke="var(--border-strong)" />
      <circle r={20 * (1 - altitude / 90)} fill="none" stroke="var(--border-strong)" strokeDasharray="2 2" />
      <text y={-13} fontSize={6} textAnchor="middle" fill="var(--muted)">N</text>
      <g transform={`rotate(${azimuth})`}>
        <line y1={0} y2={-17} stroke="#6366F1" strokeWidth={2} strokeLinecap="round" />
        <circle cy={-20 * (1 - altitude / 90)} r={3} fill="#F9A8D4" />
      </g>
    </svg>
  );
}

function useIss(lat: number, lon: number) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [passes, setPasses] = useState<ReturnType<typeof predictIssPasses> | null>(null);
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch("/api/iss")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((tle) => {
        if (cancelled) return;
        setPasses(predictIssPasses(tle, lat, lon, 72));
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);
  return { state, passes };
}

const KIND_STYLE: Record<SkyEvent["kind"], { emoji: string; label: string }> = {
  eclipse: { emoji: "🌘", label: "Eclipse" },
  meteor: { emoji: "☄️", label: "Meteor shower" },
  planet: { emoji: "🪐", label: "Planet" },
  moon: { emoji: "🌕", label: "Moon" },
  iss: { emoji: "🛰️", label: "ISS pass" },
};

function EventCalendar({ events, loadingIss }: { events: SkyEvent[]; loadingIss: boolean }) {
  const reminders = useProgress((s) => s.reminders);
  const addReminder = useProgress((s) => s.addReminder);
  const removeReminder = useProgress((s) => s.removeReminder);
  const [filter, setFilter] = useState<SkyEvent["kind"] | "all">("all");

  const toggleReminder = async (e: SkyEvent) => {
    if (reminders.some((r) => r.id === e.id)) return removeReminder(e.id);
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    addReminder({ id: e.id, title: e.title, at: new Date(e.date.getTime() - 30 * 60_000).toISOString() });
  };

  const shown = events.filter((e) => filter === "all" || e.kind === filter);
  const groups = shown.reduce<Record<string, SkyEvent[]>>((acc, e) => {
    const key = e.date.toLocaleDateString([], { month: "long", year: "numeric" });
    (acc[key] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {(Object.keys(KIND_STYLE) as SkyEvent["kind"][]).map((k) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>
            <span aria-hidden>{KIND_STYLE[k].emoji}</span> {KIND_STYLE[k].label}
          </Chip>
        ))}
      </div>
      {loadingIss && filter === "iss" && <Skeleton className="h-20 w-full" />}
      {Object.entries(groups).map(([month, list]) => (
        <div key={month}>
          <h3 className="mb-2 text-sm text-muted">{month}</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {list.map((e) => {
              const reminded = reminders.some((r) => r.id === e.id);
              return (
                <Card key={e.id} className="flex gap-4 p-4">
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-signature py-2">
                    <span className="text-xs font-medium uppercase text-muted">{e.date.toLocaleDateString([], { month: "short" })}</span>
                    <span className="font-display text-xl font-semibold text-ink tabular">{e.date.getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden>{KIND_STYLE[e.kind].emoji}</span>
                      <h4 className="font-medium text-ink">{e.title}</h4>
                    </div>
                    <div className="text-xs text-muted">{e.date.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}</div>
                    <p className="mt-1 text-sm text-body">{e.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Button variant="ghost" size="sm" onClick={() => downloadIcs(e)}>
                        <CalendarPlus /> Add to calendar
                      </Button>
                      <a href={googleCalendarUrl(e)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center rounded-full px-3 text-sm text-muted hover:bg-surface-2 hover:text-ink">
                        Google
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => toggleReminder(e)} aria-pressed={reminded}>
                        {reminded ? <BellOff /> : <Bell />} {reminded ? "Reminder set" : "Remind me"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      {shown.length === 0 && !loadingIss && (
        <EmptyState title="Nothing in this category soon" description="Try another filter — the sky is never empty for long." illustration={<MoonIcon className="size-10 text-primary" />} />
      )}
      <p className="text-xs text-muted">Reminders appear as notifications while Orbital is open in a tab. For guaranteed alerts, add the event to your calendar.</p>
    </div>
  );
}
