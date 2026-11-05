import type { Metadata } from "next";
import { MissionsTimeline } from "@/components/missions/timeline";

export const metadata: Metadata = {
  title: "Missions Timeline",
  description: "From Sputnik to Apollo to Artemis: the missions that explored our solar system, and where they are now.",
};

export default function MissionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Missions timeline</div>
        <h1 className="mt-2 text-3xl sm:text-4xl">Seven decades of exploration</h1>
        <p className="mt-2 max-w-2xl text-body">Scroll through the missions that taught us about our cosmic neighborhood — and see where the travelers are today.</p>
      </header>
      <MissionsTimeline />
    </div>
  );
}
