"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { PageDocument } from "@lms-mocks/page-builder-types";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getPageDocumentFromBlocks } from "@/lib/page-builder/migrate";
import { LessonEditorNav } from "@/components/lms/lesson-editor-nav";
import { PageBuilder } from "@/components/page-builder/page-builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LessonEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const { courses, updateLessonBlocks } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  const [saved, setSaved] = useState(false);

  const initialDocument = useMemo(() => {
    if (!lesson) return null;
    const contentBlocks = lesson.blocks.filter((b) => b.type !== "exercise").sort((a, b) => a.order - b.order);
    return getPageDocumentFromBlocks(contentBlocks);
  }, [lesson]);

  useEffect(() => {
    setSaved(false);
  }, [lessonId]);

  if (!course || !lesson || !initialDocument) return <div>Aula não encontrada</div>;

  const activeLesson = lesson;
  const existingTextBlockId = lesson.blocks.find((b) => b.type === "text")?.id;

  function handleSave(doc: PageDocument, html: string) {
    const exerciseBlocks = activeLesson.blocks.filter((b) => b.type === "exercise");
    const pageBlock = {
      id: existingTextBlockId ?? `block-page-${Date.now()}`,
      type: "text" as const,
      order: 1,
      content: { html, pageDocument: doc },
    };
    const merged = [pageBlock, ...exerciseBlocks].map((b, i) => ({ ...b, order: i + 1 }));
    updateLessonBlocks(courseId, lessonId, merged);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/dashboard/cursos/${courseId}`} className="text-xs text-primary hover:underline">
            ← {course.title}
          </Link>
          <h1 className="text-xl font-bold mt-1">{activeLesson.title}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary">{activeLesson.status === "published" ? "Publicado" : "Rascunho"}</Badge>
            <span className="text-xs text-muted-foreground">{activeLesson.durationMinutes} min</span>
            <Badge variant="outline" className="text-xs">
              Page Builder
            </Badge>
            {saved && <Badge variant="success">Salvo!</Badge>}
          </div>
        </div>
        <a
          href={`http://localhost:3000/studio-italiano/cursos/${courseId}/aulas/${lessonId}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="size-4 mr-1" /> Pré-visualizar
          </Button>
        </a>
      </div>

      <LessonEditorNav courseId={courseId} lessonId={lessonId} active="conteudo" />

      <PageBuilder key={lessonId} initialDocument={initialDocument} onSave={handleSave} />
    </div>
  );
}
