import { Suspense } from "react";
import type { Metadata } from "next";
import { SizeLab } from "@/components/compare/size-lab";
import { DistanceLab } from "@/components/compare/distance-lab";
import { TravelLab } from "@/components/compare/travel-lab";
import { WeightLab } from "@/components/compare/weight-lab";
import { SectionHeader, Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Scale & Comparison Lab",
  description: "Compare planets side by side at true relative size, feel the distances, calculate travel times and find your weight on other worlds.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6">
      <header>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Scale & Comparison Lab</div>
        <h1 className="mt-2 text-3xl sm:text-4xl">How big? How far? How long?</h1>
        <p className="mt-2 max-w-2xl text-body">Space numbers are too big to imagine — so let&apos;s make them feel real.</p>
      </header>

      <section className="space-y-5">
        <SectionHeader title="Side by side, true size" description="Pick any two worlds — or a world and a place on Earth." />
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
          <SizeLab />
        </Suspense>
      </section>

      <section className="space-y-5">
        <SectionHeader title="Feel the distances" description="Shrink the solar system down until the Sun fits in your hands." />
        <DistanceLab />
      </section>

      <section className="space-y-5">
        <SectionHeader title="Travel time calculator" description="Road trip to Mars? Here's how long you'd be in the car." />
        <TravelLab />
      </section>

      <section className="space-y-5">
        <SectionHeader title="Your weight on…" description="Step onto another world's scales." />
        <WeightLab />
      </section>
    </div>
  );
}
