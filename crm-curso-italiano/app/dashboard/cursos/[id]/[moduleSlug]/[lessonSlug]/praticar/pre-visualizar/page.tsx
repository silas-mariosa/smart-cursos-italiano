"use client";

import { useParams } from "next/navigation";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { getExerciseById } from "@lms-mocks/exercises";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getLessonEditorHref } from "@/lib/editor-routes";
import { LessonPreviewBar } from "@/components/lms/lesson-preview-bar";
import { LessonPracticeStudentView } from "@/components/lms/lesson-practice-student-view";

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
  const editorHref = getLessonEditorHref(courseId, mod.slug, lesson.slug, "praticar");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <LessonPreviewBar editorHref={editorHref} lessonTitle={lesson.title} />

      <div className="flex-1 overflow-y-auto bg-muted/10">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {course.title} › {mod.title}
            </p>
            <h1 className="text-2xl font-bold">Prática · {lesson.title}</h1>
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
