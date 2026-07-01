"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { PageDocument } from "@lms-mocks/page-builder-types";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getPageDocumentFromBlocks } from "@/lib/page-builder/migrate";
import { normalizeDocument } from "@/lib/page-builder/document";
import { getLessonPreviewHref } from "@/lib/editor-routes";
import { LessonEditorHeader } from "@/components/lms/lesson-editor-header";
import { PageBuilder } from "@/components/page-builder/page-builder";

export default function LessonEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const { courses, updateLessonBlocks } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  const [, setSaved] = useState(false);

  const initialDocument = useMemo(() => {
    if (!lesson) return null;
    const contentBlocks = lesson.blocks.filter((b) => b.type !== "exercise").sort((a, b) => a.order - b.order);
    return getPageDocumentFromBlocks(contentBlocks);
  }, [lesson]);

  const normalizedDocument = useMemo(
    () => (initialDocument ? normalizeDocument(initialDocument) : null),
    [initialDocument],
  );

  useEffect(() => {
    setSaved(false);
  }, [lessonId]);

  if (!course || !lesson || !normalizedDocument) return <div>Aula não encontrada</div>;

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
    <div className="flex flex-col flex-1 min-h-0">
      <LessonEditorHeader
        courseId={courseId}
        courseTitle={course.title}
        lessonId={lessonId}
        lessonTitle={activeLesson.title}
        active="conteudo"
        previewHref={getLessonPreviewHref(courseId, lessonId, "conteudo")}
      />
      <PageBuilder
        key={lessonId}
        initialDocument={normalizedDocument}
        onSave={handleSave}
        previewHref={getLessonPreviewHref(courseId, lessonId, "conteudo")}
      />
    </div>
  );
}
