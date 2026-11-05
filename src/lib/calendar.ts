/** Calendar export helpers: .ics download and Google Calendar link. */
import type { SkyEvent } from "@/lib/sky";

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function downloadIcs(event: SkyEvent) {
  const end = new Date(event.date.getTime() + (event.durationMin ?? 60) * 60_000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Orbital//Sky Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@orbital.app`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(event.date)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(event.title)} in 30 minutes`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(event: SkyEvent) {
  const end = new Date(event.date.getTime() + (event.durationMin ?? 60) * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${icsDate(event.date)}/${icsDate(end)}`,
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
