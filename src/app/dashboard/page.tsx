import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "My space",
  description: "Continue learning, revisit your questions and see what's coming up in your sky.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
