import type { Metadata } from "next";
import { AskPage } from "@/components/chat/ask-page";

export const metadata: Metadata = {
  title: "Ask Orbital",
  description: "Ask the AI space guide anything — in plain language, at your level, with sources from NASA, ESA and JPL.",
};

export default function Page() {
  return <AskPage />;
}
