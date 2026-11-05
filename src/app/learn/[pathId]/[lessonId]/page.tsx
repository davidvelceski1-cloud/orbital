import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEARNING_PATHS, getLesson } from "@/data/learning-paths";
import { LessonView } from "@/components/learn/lesson-view";

export function generateStaticParams() {
  return LEARNING_PATHS.flatMap((p) => p.lessons.map((l) => ({ pathId: p.id, lessonId: l.id })));
}

type Params = { params: Promise<{ pathId: string; lessonId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { pathId, lessonId } = await params;
  const found = getLesson(pathId, lessonId);
  return { title: found ? `${found.lesson.title} · ${found.path.title}` : "Lesson", description: found?.lesson.summary };
}

export default async function LessonPage({ params }: Params) {
  const { pathId, lessonId } = await params;
  if (!getLesson(pathId, lessonId)) notFound();
  return <LessonView pathId={pathId} lessonId={lessonId} />;
}
