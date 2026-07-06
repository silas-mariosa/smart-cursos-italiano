"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import { getCrmLessonEditHref, getCrmLessonHref } from "@lms-mocks/course-routes";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { getExerciseById } from "@lms-mocks/exercises";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { LessonPreviewHeader } from "@/components/lms/course-editor/lesson-preview-header";
import { LessonPracticeStudentView } from "@/components/lms/lesson-practice-student-view";
import { Button } from "@/components/ui/button";

export default function LessonPracticePreviewPage() {
  const params = useParams();
  const courseId = params.id as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const ctx = course ? getLessonBySlugs(course, moduleSlug, lessonSlug) : undefined;

  if (!course || !ctx) {
    return <div className="p-8 text-center">Aula não encontrada</div>;
  }

  const { lesson, module: mod } = ctx;
  const lessonId = lesson.id;
  const exerciseIds = getLessonExerciseIds(lesson);
  const exercises = exerciseIds.map((id) => getExerciseById(id)).filter(Boolean);
  const practice = resolveLessonPractice(lessonId);
  const flashcards = getFlashcardsByLesson(lessonId);
  const scenarios = getSimulatorByLesson(lessonId);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <LessonPreviewHeader
        courseId={courseId}
        moduleSlug={mod.slug}
        lessonSlug={lesson.slug}
        lessonTitle={lesson.title}
        active="praticar"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Prática · visão do aluno</p>
              <h2 className="text-lg font-semibold">{lesson.title}</h2>
            </div>
            <div className="flex gap-2">
              <Link href={getCrmLessonHref(courseId, mod.slug, lesson.slug)}>
                <Button variant="outline" size="sm">
                  Ver conteúdo
                </Button>
              </Link>
              <Link href={getCrmLessonEditHref(courseId, mod.slug, lesson.slug, "praticar")}>
                <Button size="sm">Editar prática</Button>
              </Link>
            </div>
          </div>

          <LessonPracticeStudentView
            practice={practice}
            exercises={exercises}
            flashcards={flashcards}
            scenarios={scenarios}
          />
        </div>
      </div>
    </div>
  );
}
