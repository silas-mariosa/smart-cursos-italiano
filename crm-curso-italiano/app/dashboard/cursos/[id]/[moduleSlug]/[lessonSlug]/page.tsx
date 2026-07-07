"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLessonById, getNextLesson, getPrevLesson } from "@lms-mocks/courses";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import {
  getCrmLessonEditHref,
  getCrmLessonHref,
} from "@lms-mocks/course-routes";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { isPageBuilderLesson } from "@lms-mocks/lesson-display";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { LessonPreviewHeader } from "@/components/lms/course-editor/lesson-preview-header";
import { CourseEditorMobileEditTrigger } from "@/components/lms/course-editor/course-editor-mobile-edit-trigger";
import { LessonContentPlayer } from "@/components/lms/course-preview/lesson-content-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LessonPreviewPage() {
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
  const prev = getPrevLesson(course, lessonId);
  const next = getNextLesson(course, lessonId);
  const prevCtx = prev ? getLessonById(courseId, prev.id, [course]) : undefined;
  const nextCtx = next ? getLessonById(courseId, next.id, [course]) : undefined;
  const pageBuilder = isPageBuilderLesson(lesson);

  const exerciseIds = getLessonExerciseIds(lesson);
  const practice = resolveLessonPractice(lessonId);
  const flashcardCount = practice.modules.flashcards.enabled
    ? getFlashcardsByLesson(lessonId).length
    : 0;
  const simulatorCount = practice.modules.simulator.enabled
    ? getSimulatorByLesson(lessonId).length
    : 0;
  const quizCount = practice.modules.quizzes.enabled ? exerciseIds.length : 0;
  const hasPractice = quizCount > 0 || flashcardCount > 0 || simulatorCount > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <LessonPreviewHeader
        courseId={courseId}
        moduleSlug={mod.slug}
        lessonSlug={lesson.slug}
        lessonTitle={lesson.title}
        active="conteudo"
      />

      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2">
        <Badge variant="secondary">{lesson.durationMinutes} min</Badge>
        {lesson.status === "draft" && <Badge variant="secondary">Rascunho</Badge>}
        <span className="text-xs text-muted-foreground truncate">
          {course.title} › {mod.title}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={cn("mx-auto space-y-8 px-4 py-6", pageBuilder ? "max-w-4xl" : "max-w-3xl")}>
          <LessonContentPlayer lesson={lesson} />

          {hasPractice && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">Prática disponível nesta aula</p>
                <p className="text-sm text-muted-foreground">
                  {quizCount > 0 && `${quizCount} quiz${quizCount > 1 ? "zes" : ""}`}
                  {flashcardCount > 0 && ` · ${flashcardCount} flashcards`}
                  {simulatorCount > 0 &&
                    ` · ${simulatorCount} simulador${simulatorCount > 1 ? "es" : ""}`}
                </p>
              </div>
              <Link href={getCrmLessonHref(courseId, mod.slug, lesson.slug, "praticar")}>
                <Button variant="outline">Ver prática</Button>
              </Link>
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
            {prevCtx ? (
              <Link
                href={getCrmLessonHref(
                  courseId,
                  prevCtx.module.slug,
                  prevCtx.lesson.slug,
                )}
              >
                <Button variant="outline">
                  <ChevronLeft className="mr-1 size-4" />
                  Aula anterior
                </Button>
              </Link>
            ) : (
              <div />
            )}
            <CourseEditorMobileEditTrigger href={getCrmLessonEditHref(courseId, mod.slug, lesson.slug)}>
              Editar conteúdo
            </CourseEditorMobileEditTrigger>
            {nextCtx ? (
              <Link
                href={getCrmLessonHref(
                  courseId,
                  nextCtx.module.slug,
                  nextCtx.lesson.slug,
                )}
              >
                <Button variant="outline">
                  Próxima
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </Link>
            ) : hasPractice ? (
              <Link href={getCrmLessonHref(courseId, mod.slug, lesson.slug, "praticar")}>
                <Button>
                  Praticar
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
