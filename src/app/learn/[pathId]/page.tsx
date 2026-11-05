import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEARNING_PATHS, getPath } from "@/data/learning-paths";
import { PathOverview } from "@/components/learn/path-overview";

export function generateStaticParams() {
  return LEARNING_PATHS.map((p) => ({ pathId: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ pathId: string }> }): Promise<Metadata> {
  const path = getPath((await params).pathId);
  return { title: path?.title ?? "Learning path", description: path?.description };
}

export default async function PathPage({ params }: { params: Promise<{ pathId: string }> }) {
  const path = getPath((await params).pathId);
  if (!path) notFound();
  return <PathOverview pathId={path.id} />;
}
