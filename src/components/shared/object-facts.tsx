import { Clock, Globe2, Moon, Orbit, Ruler, Thermometer, Weight } from "lucide-react";
import { FactCard } from "@/components/ui/primitives";
import { getObject } from "@/data/objects";
import type { CelestialObject } from "@/lib/types";
import { cn, formatDayLength, formatKm, formatNumber, formatTemp, formatYearLength } from "@/lib/utils";

/** Key-facts grid for one object (explorer side panel, AI answers, list view). */
export function ObjectFacts({ object, compact = false, className }: { object: CelestialObject; compact?: boolean; className?: string }) {
  const parent = object.parentId ? getObject(object.parentId) : undefined;
  const distance = object.distanceFromSunKm
    ? { label: "From the Sun", value: formatKm(object.distanceFromSunKm) }
    : object.distanceFromParentKm
      ? { label: `From ${parent?.name ?? "parent"}`, value: formatKm(object.distanceFromParentKm) }
      : null;

  const vsEarth = (ratio: number) => (ratio >= 1.5 ? `${formatNumber(ratio, ratio < 10 ? 1 : 0)}× Earth` : `${formatNumber(ratio * 100, ratio < 0.1 ? 1 : 0)}% of Earth`);
  const facts = [
    { icon: Ruler, label: "Diameter", value: `${formatNumber(object.radiusKm * 2)} km`, hint: object.id !== "earth" ? vsEarth(object.radiusKm / 6371) : undefined },
    distance && { icon: Globe2, label: distance.label, value: distance.value },
    { icon: Clock, label: "Day length", value: formatDayLength(object.dayLengthHours) },
    object.orbitalPeriodDays && { icon: Orbit, label: object.kind === "moon" ? "Orbit" : "Year length", value: formatYearLength(object.orbitalPeriodDays) },
    { icon: Weight, label: "Gravity", value: `${formatNumber(object.gravity, object.gravity < 1 ? 3 : 2)} m/s²`, hint: object.id !== "earth" ? vsEarth(object.gravity / 9.81) : undefined },
    { icon: Thermometer, label: "Temperature", value: formatTemp(object.temperatureC) },
    object.moonCount !== undefined && { icon: Moon, label: "Known moons", value: formatNumber(object.moonCount) },
  ].filter(Boolean) as { icon: typeof Ruler; label: string; value: string; hint?: string }[];

  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2", className)}>
      {facts.map((f) => (
        <FactCard key={f.label} icon={f.icon} label={f.label} value={f.value} hint={f.hint} />
      ))}
    </div>
  );
}
