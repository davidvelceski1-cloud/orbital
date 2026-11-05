/** Pure size-comparison helpers shared by the UI and the server-side offline guide. */
import { getObject } from "@/data/objects";
import { PLACES } from "@/data/extras";
import { formatNumber } from "@/lib/utils";

export interface Comparable {
  id: string;
  name: string;
  diameterKm: number;
  kind: "body" | "place";
}

export function resolveComparable(id: string): Comparable | undefined {
  const o = getObject(id);
  if (o) return { id, name: o.name, diameterKm: o.radiusKm * 2, kind: "body" };
  const p = PLACES.find((x) => x.id === id);
  if (p) return { id, name: p.name, diameterKm: p.widthKm, kind: "place" };
  return undefined;
}

export function comparisonSentence(a: Comparable, b: Comparable) {
  const [big, small] = a.diameterKm >= b.diameterKm ? [a, b] : [b, a];
  const ratio = big.diameterKm / small.diameterKm;
  if (ratio < 1.05) return `${a.name} and ${b.name} are almost the same size.`;
  const wider = `${big.name} is about ${formatNumber(ratio, ratio < 10 ? 1 : 0)}× wider than ${small.name}.`;
  if (big.kind === "body" && small.kind === "body") {
    const volume = ratio ** 3;
    return `${wider} About ${formatNumber(volume, volume < 10 ? 1 : 0)} ${small.name}${volume >= 2 ? "s" : ""} could fit inside it.`;
  }
  return wider;
}
