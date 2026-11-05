import type { Metadata } from "next";
import { SkyView } from "@/components/sky/sky-view";

export const metadata: Metadata = {
  title: "Tonight's Sky",
  description: "See which planets are visible tonight, where to look, the Moon phase and upcoming eclipses, meteor showers and ISS passes.",
};

export default function SkyPage() {
  return <SkyView />;
}
