"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { LessonBlock } from "@lms-mocks/types";
import type { LessonPracticeSettings } from "@lms-mocks/lesson-practice-types";
import { resolveLessonPractice, saveLessonPractice } from "@lms-mocks/lesson-practice";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import { getCrmLessonHref } from "@lms-mocks/course-routes";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { LessonEditorHeader } from "@/components/lms/lesson-editor-header";
import { PracticeEditor } from "@/components/lms/practice-editor/practice-editor";

export default function LessonPracticeEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;
  const { courses, updateLessonBlocks, exercises } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const ctx = course ? getLessonBySlugs(course, moduleSlug, lessonSlug) : undefined;
  const lesson = ctx?.lesson;
  const lessonId = lesson?.id ?? "";

  const [settings, setSettings] = useState<LessonPracticeSettings | null>(null);
  const [exerciseBlocks, setExerciseBlocks] = useState<LessonBlock[]>([]);
  const [, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lesson) return;
    setSettings(resolveLessonPractice(lessonId));
    setExerciseBlocks(
      lesson.blocks.filter((b) => b.type === "exercise").sort((a, b) => a.order - b.order),
    );
  }, [lessonId, lesson?.blocks, lesson]);

  const persist = useCallback(
    (nextSettings: LessonPracticeSettings, nextExerciseBlocks: LessonBlock[]) => {
      if (!lesson) return;
      saveLessonPractice(nextSettings);
      const contentBlocks = lesson.blocks.filter((b) => b.type !== "exercise");
      const merged = [...contentBlocks, ...nextExerciseBlocks].map((b, i) => ({
        ...b,
        order: i + 1,
      }));
      updateLessonBlocks(courseId, lessonId, merged);
      setSaved(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaved(false), 2000);
    },
    [courseId, lessonId, lesson, updateLessonBlocks],
  );

  const scheduleSave = useCallback(
    (nextSettings: LessonPracticeSettings, nextExerciseBlocks: LessonBlock[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(nextSettings, nextExerciseBlocks), 500);
    },
    [persist],
  );

  if (!course || !ctx || !lesson || !settings) return <div>Aula não encontrada</div>;

  const { module } = ctx;
  const previewHref = getCrmLessonHref(courseId, module.slug, lesson.slug, "praticar");

  function handleSettingsChange(next: LessonPracticeSettings) {
    setSettings(next);
    scheduleSave(next, exerciseBlocks);
  }

  function handleExerciseBlocksChange(next: LessonBlock[]) {
    if (!settings) return;
    setExerciseBlocks(next);
    scheduleSave(settings, next);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LessonEditorHeader
        courseId={courseId}
        courseTitle={course.title}
        moduleSlug={module.slug}
        lessonSlug={lesson.slug}
        lessonTitle={lesson.title}
        active="praticar"
        previewHref={previewHref}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <PracticeEditor
          lessonId={lessonId}
          settings={settings}
          exerciseBlocks={exerciseBlocks}
          exercises={exercises}
          onSettingsChange={handleSettingsChange}
          onExerciseBlocksChange={handleExerciseBlocksChange}
          previewHref={previewHref}
        />
      </div>
    </div>
  );
}
