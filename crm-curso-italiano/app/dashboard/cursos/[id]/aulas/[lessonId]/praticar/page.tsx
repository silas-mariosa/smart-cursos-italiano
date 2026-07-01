"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { LessonBlock } from "@lms-mocks/types";
import type { LessonPracticeSettings } from "@lms-mocks/lesson-practice-types";
import { resolveLessonPractice, saveLessonPractice } from "@lms-mocks/lesson-practice";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getLessonPreviewHref } from "@/lib/editor-routes";
import { LessonEditorHeader } from "@/components/lms/lesson-editor-header";
import { PracticeEditor } from "@/components/lms/practice-editor/practice-editor";

export default function LessonPracticeEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const { courses, updateLessonBlocks, exercises } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);

  const [settings, setSettings] = useState<LessonPracticeSettings | null>(null);
  const [exerciseBlocks, setExerciseBlocks] = useState<LessonBlock[]>([]);
  const [, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lesson) return;
    setSettings(resolveLessonPractice(lessonId));
    setExerciseBlocks(lesson.blocks.filter((b) => b.type === "exercise").sort((a, b) => a.order - b.order));
  }, [lessonId, lesson?.blocks, lesson]);

  const persist = useCallback(
    (nextSettings: LessonPracticeSettings, nextExerciseBlocks: LessonBlock[]) => {
      if (!lesson) return;
      saveLessonPractice(nextSettings);
      const contentBlocks = lesson.blocks.filter((b) => b.type !== "exercise");
      const merged = [...contentBlocks, ...nextExerciseBlocks].map((b, i) => ({ ...b, order: i + 1 }));
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

  if (!course || !lesson || !settings) return <div>Aula não encontrada</div>;

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
    <div className="flex flex-col flex-1 min-h-0">
      <LessonEditorHeader
        courseId={courseId}
        courseTitle={course.title}
        lessonId={lessonId}
        lessonTitle={lesson.title}
        active="praticar"
        previewHref={getLessonPreviewHref(courseId, lessonId, "praticar")}
      />
      <div className="flex-1 min-h-0 overflow-auto">
        <PracticeEditor
          lessonId={lessonId}
          settings={settings}
          exerciseBlocks={exerciseBlocks}
          exercises={exercises}
          onSettingsChange={handleSettingsChange}
          onExerciseBlocksChange={handleExerciseBlocksChange}
          previewHref={getLessonPreviewHref(courseId, lessonId, "praticar")}
        />
      </div>
    </div>
  );
}
