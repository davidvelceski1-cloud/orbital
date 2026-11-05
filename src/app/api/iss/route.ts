/**
 * GET /api/iss — latest ISS two-line element set from CelesTrak.
 * Dynamic route (errors aren't cached); the upstream fetch is cached for 6 hours.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE", {
      next: { revalidate: 21600 },
    });
    if (!res.ok) return Response.json({ error: "unavailable" }, { status: 502 });
    const lines = (await res.text()).trim().split(/\r?\n/).map((l) => l.trim());
    if (lines.length < 3 || !lines[1].startsWith("1 ") || !lines[2].startsWith("2 "))
      return Response.json({ error: "unavailable" }, { status: 502 });
    return Response.json({ name: lines[0], line1: lines[1], line2: lines[2] });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
