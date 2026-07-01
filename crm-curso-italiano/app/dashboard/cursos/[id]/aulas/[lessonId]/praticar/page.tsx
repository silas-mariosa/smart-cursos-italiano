"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { LessonBlock } from "@lms-mocks/types";
import type { LessonPracticeSettings } from "@lms-mocks/lesson-practice-types";
import { resolveLessonPractice, saveLessonPractice } from "@lms-mocks/lesson-practice";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { LessonEditorNav } from "@/components/lms/lesson-editor-nav";
import { PracticeEditor } from "@/components/lms/practice-editor/practice-editor";
import { Badge } from "@/components/ui/badge";

export default function LessonPracticeEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const { courses, updateLessonBlocks, exercises, tenant } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);

  const [settings, setSettings] = useState<LessonPracticeSettings | null>(null);
  const [exerciseBlocks, setExerciseBlocks] = useState<LessonBlock[]>([]);
  const [saved, setSaved] = useState(false);
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
    <div className="w-full space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/dashboard/cursos/${courseId}`} className="text-xs text-primary hover:underline">
            ← {course.title}
          </Link>
          <h1 className="text-xl font-bold mt-1">{lesson.title}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary">Prática</Badge>
            <Badge variant="outline" className="text-xs">
              Editor de módulos
            </Badge>
            {saved && <Badge variant="success">Salvo!</Badge>}
          </div>
        </div>
        <a
          href={`http://localhost:3000/${tenant.slug}/cursos/${courseId}/aulas/${lessonId}/praticar?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block"
        >
          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-accent">
            <ExternalLink className="size-3" /> Abrir como aluno
          </Badge>
        </a>
      </div>

      <LessonEditorNav courseId={courseId} lessonId={lessonId} active="praticar" />

      <PracticeEditor
        lessonId={lessonId}
        settings={settings}
        exerciseBlocks={exerciseBlocks}
        exercises={exercises}
        onSettingsChange={handleSettingsChange}
        onExerciseBlocksChange={handleExerciseBlocksChange}
        previewUrl={`http://localhost:3000/${tenant.slug}/cursos/${courseId}/aulas/${lessonId}/praticar?preview=1`}
      />
    </div>
  );
}
