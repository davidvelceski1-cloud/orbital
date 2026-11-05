import { Suspense } from "react";
import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/explorer";

export const metadata: Metadata = {
  title: "Solar System Explorer",
  description: "A 3D, real-time model of the solar system. Fly to any planet, moon or dwarf planet and travel through time.",
};

export default function ExplorePage() {
  return (
    <>
      <h1 className="sr-only">Solar System Explorer</h1>
      <Suspense>
        <Explorer />
      </Suspense>
    </>
  );
}
