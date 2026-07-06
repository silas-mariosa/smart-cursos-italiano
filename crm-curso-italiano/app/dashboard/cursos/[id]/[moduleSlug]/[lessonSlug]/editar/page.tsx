"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { PageDocument } from "@lms-mocks/page-builder-types";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import { getCrmLessonHref } from "@lms-mocks/course-routes";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getPageDocumentFromBlocks } from "@/lib/page-builder/migrate";
import { normalizeDocument } from "@/lib/page-builder/document";
import { LessonEditorHeader } from "@/components/lms/lesson-editor-header";
import { PageBuilder } from "@/components/page-builder/page-builder";

export default function LessonContentEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;
  const { courses, updateLessonBlocks } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const ctx = course ? getLessonBySlugs(course, moduleSlug, lessonSlug) : undefined;
  const [, setSaved] = useState(false);

  const lesson = ctx?.lesson;

  const initialDocument = useMemo(() => {
    if (!lesson) return null;
    const contentBlocks = lesson.blocks
      .filter((b) => b.type !== "exercise")
      .sort((a, b) => a.order - b.order);
    return getPageDocumentFromBlocks(contentBlocks);
  }, [lesson]);

  const normalizedDocument = useMemo(
    () => (initialDocument ? normalizeDocument(initialDocument) : null),
    [initialDocument],
  );

  useEffect(() => {
    setSaved(false);
  }, [lessonSlug]);

  if (!course || !ctx || !lesson || !normalizedDocument) return <div>Aula não encontrada</div>;

  const { module } = ctx;
  const activeLesson = lesson;
  const existingTextBlockId = lesson.blocks.find((b) => b.type === "text")?.id;
  const previewHref = getCrmLessonHref(courseId, module.slug, lesson.slug);

  function handleSave(doc: PageDocument, html: string) {
    const exerciseBlocks = activeLesson.blocks.filter((b) => b.type === "exercise");
    const pageBlock = {
      id: existingTextBlockId ?? `block-page-${Date.now()}`,
      type: "text" as const,
      order: 1,
      content: { html, pageDocument: doc },
    };
    const merged = [pageBlock, ...exerciseBlocks].map((b, i) => ({ ...b, order: i + 1 }));
    updateLessonBlocks(courseId, activeLesson.id, merged);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LessonEditorHeader
        courseId={courseId}
        courseTitle={course.title}
        moduleSlug={module.slug}
        lessonSlug={lesson.slug}
        lessonTitle={activeLesson.title}
        active="conteudo"
        previewHref={previewHref}
      />
      <PageBuilder
        key={lesson.id}
        initialDocument={normalizedDocument}
        onSave={handleSave}
      />
    </div>
  );
}
