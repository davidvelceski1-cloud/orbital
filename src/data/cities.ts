import type { SkyLocation } from "@/lib/store";

/** Quick picks for the sky features when the user doesn't share their location. */
export const PRESET_CITIES: SkyLocation[] = [
  { label: "New York", lat: 40.71, lon: -74.01 },
  { label: "London", lat: 51.51, lon: -0.13 },
  { label: "Paris", lat: 48.86, lon: 2.35 },
  { label: "Los Angeles", lat: 34.05, lon: -118.24 },
  { label: "Toronto", lat: 43.65, lon: -79.38 },
  { label: "Sydney", lat: -33.87, lon: 151.21 },
  { label: "Tokyo", lat: 35.68, lon: 139.69 },
  { label: "Mumbai", lat: 19.08, lon: 72.88 },
  { label: "São Paulo", lat: -23.55, lon: -46.63 },
  { label: "Nairobi", lat: -1.29, lon: 36.82 },
  { label: "Berlin", lat: 52.52, lon: 13.4 },
  { label: "Mexico City", lat: 19.43, lon: -99.13 },
  { label: "Cape Town", lat: -33.92, lon: 18.42 },
  { label: "Singapore", lat: 1.35, lon: 103.82 },
  { label: "Reykjavík", lat: 64.15, lon: -21.94 },
];
