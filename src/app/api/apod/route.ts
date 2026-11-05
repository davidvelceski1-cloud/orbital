/**
 * GET /api/apod — NASA Astronomy Picture of the Day.
 * The route is dynamic so a failed upstream call is never cached; the upstream fetch itself is cached for an hour.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}&thumbs=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("APOD upstream error", res.status);
      return Response.json({ error: "unavailable" }, { status: 502 });
    }
    const d = await res.json();
    return Response.json({
      title: d.title as string,
      date: d.date as string,
      explanation: d.explanation as string,
      url: (d.media_type === "video" ? d.thumbnail_url : d.url) as string | undefined,
      mediaType: d.media_type as string,
      copyright: (d.copyright as string | undefined)?.trim(),
      pageUrl: `https://apod.nasa.gov/apod/ap${String(d.date).slice(2).replaceAll("-", "")}.html`,
    });
  } catch (err) {
    console.error("APOD fetch failed", err);
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
