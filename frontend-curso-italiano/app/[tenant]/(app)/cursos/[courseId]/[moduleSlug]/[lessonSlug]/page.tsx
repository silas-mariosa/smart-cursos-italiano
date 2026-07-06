"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { getLessonById, getNextLesson, getPrevLesson } from "@lms-mocks/courses";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import {
  getStudentLessonHref,
  getStudentLessonPracticeHref,
} from "@lms-mocks/course-routes";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { isPageBuilderLesson } from "@lms-mocks/lesson-display";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { CourseSidebar } from "@/components/lms/course-sidebar";
import { LessonContentPlayer } from "@/components/lms/lesson-content-player";
import { LessonNav } from "@/components/lms/lesson-nav";
import { PracticeCTA } from "@/components/lms/practice-cta";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LessonPlayerPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const courseId = params.courseId as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;
  const { completedLessonIds, completeLesson, getCourseProgress } = useDemoStudent();
  const [completedToast, setCompletedToast] = useState(false);

  const courses = useDemoCourses();
  const course = courses.find((c) => c.id === courseId);
  const ctx = course ? getLessonBySlugs(course, moduleSlug, lessonSlug) : undefined;

  if (!course || !ctx) {
    return <div className="p-8 text-center">Aula não encontrada</div>;
  }

  const { lesson, module: mod } = ctx;
  const lessonId = lesson.id;
  const progressPercent = getCourseProgress(courseId);
  const prev = getPrevLesson(course, lessonId);
  const next = getNextLesson(course, lessonId);
  const prevCtx = prev ? getLessonById(courseId, prev.id, courses) : undefined;
  const nextCtx = next ? getLessonById(courseId, next.id, courses) : undefined;
  const isCompleted = completedLessonIds.includes(lessonId);
  const pageBuilder = isPageBuilderLesson(lesson);

  const exerciseIds = getLessonExerciseIds(lesson);
  const practice = resolveLessonPractice(lessonId);
  const flashcardCount = practice.modules.flashcards.enabled ? getFlashcardsByLesson(lessonId).length : 0;
  const simulatorCount = practice.modules.simulator.enabled ? getSimulatorByLesson(lessonId).length : 0;
  const quizCount = practice.modules.quizzes.enabled ? exerciseIds.length : 0;
  const hasPractice = quizCount > 0 || flashcardCount > 0 || simulatorCount > 0;

  function handleComplete() {
    completeLesson(lessonId);
    setCompletedToast(true);
    setTimeout(() => setCompletedToast(false), 3000);
  }

  const sidebar = (
    <CourseSidebar
      course={course}
      tenantSlug={tenantSlug}
      courseId={courseId}
      currentLessonId={lessonId}
      completedLessonIds={completedLessonIds}
      progressPercent={progressPercent}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="hidden lg:block w-72 shrink-0">{sidebar}</aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center gap-3 shrink-0">
          <Sheet>
            <SheetTrigger className="lg:hidden">
              <Button variant="outline" size="sm">
                <Menu className="size-4 mr-1" />
                Conteúdo
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Conteúdo do curso</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {course.title} › {mod.title}
            </p>
            <h1 className="font-semibold truncate">{lesson.title}</h1>
          </div>
          <Badge variant="secondary">{lesson.durationMinutes} min</Badge>
        </div>

        <LessonNav
          tenantSlug={tenantSlug}
          courseId={courseId}
          moduleSlug={mod.slug}
          lessonSlug={lesson.slug}
          active="conteudo"
          hasPractice={hasPractice}
        />

        <div className="flex-1 overflow-y-auto">
          <div className={cn("mx-auto px-4 py-6 space-y-8", pageBuilder ? "max-w-4xl" : "max-w-3xl")}>
            <LessonContentPlayer lesson={lesson} />

            {hasPractice && (
              <PracticeCTA
                tenantSlug={tenantSlug}
                courseId={courseId}
                moduleSlug={mod.slug}
                lessonSlug={lesson.slug}
                exerciseCount={quizCount}
                flashcardCount={flashcardCount}
                simulatorCount={simulatorCount}
              />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              {prevCtx ? (
                <Link
                  href={getStudentLessonHref(
                    tenantSlug,
                    courseId,
                    prevCtx.module.slug,
                    prevCtx.lesson.slug,
                  )}
                >
                  <Button variant="outline">
                    <ChevronLeft className="size-4 mr-1" />
                    Aula anterior
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              <Button onClick={handleComplete} disabled={isCompleted}>
                {isCompleted ? "✓ Aula concluída" : "Marcar aula como concluída"}
              </Button>
              {nextCtx ? (
                <Link
                  href={getStudentLessonHref(
                    tenantSlug,
                    courseId,
                    nextCtx.module.slug,
                    nextCtx.lesson.slug,
                  )}
                >
                  <Button variant="outline">
                    Próxima
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </Link>
              ) : hasPractice ? (
                <Link href={getStudentLessonPracticeHref(tenantSlug, courseId, mod.slug, lesson.slug)}>
                  <Button>
                    Praticar
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {completedToast && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
                Aula concluída!{hasPractice ? " Agora pratique os exercícios." : ""}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
