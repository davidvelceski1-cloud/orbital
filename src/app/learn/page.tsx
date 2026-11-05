import type { Metadata } from "next";
import { LearnOverview } from "@/components/learn/learn-overview";

export const metadata: Metadata = {
  title: "Learning Paths",
  description: "Mini-courses on the solar system, stars, seasons, black holes and Moon phases — with interactive diagrams and quizzes.",
};

export default function LearnPage() {
  return <LearnOverview />;
}
