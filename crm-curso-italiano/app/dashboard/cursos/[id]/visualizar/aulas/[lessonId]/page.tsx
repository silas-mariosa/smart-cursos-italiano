"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { getLessonFromCourses, getNextLesson, getPrevLesson } from "@lms-mocks/courses";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { isPageBuilderLesson } from "@lms-mocks/lesson-display";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { CoursePreviewToolbar } from "@/components/lms/course-preview/course-preview-toolbar";
import { CoursePreviewSidebar } from "@/components/lms/course-preview/course-preview-sidebar";
import { LessonContentPlayer } from "@/components/lms/course-preview/lesson-content-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function CoursePreviewLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const data = course ? getLessonFromCourses([course], courseId, lessonId) : null;

  if (!course || !data) {
    return <div className="p-8 text-center">Aula não encontrada</div>;
  }

  const { lesson, module: mod } = data;
  const prev = getPrevLesson(course, lessonId);
  const next = getNextLesson(course, lessonId);
  const pageBuilder = isPageBuilderLesson(lesson);
  const base = `/dashboard/cursos/${courseId}/visualizar`;

  const exerciseIds = getLessonExerciseIds(lesson);
  const practice = resolveLessonPractice(lessonId);
  const flashcardCount = practice.modules.flashcards.enabled ? getFlashcardsByLesson(lessonId).length : 0;
  const simulatorCount = practice.modules.simulator.enabled ? getSimulatorByLesson(lessonId).length : 0;
  const quizCount = practice.modules.quizzes.enabled ? exerciseIds.length : 0;
  const hasPractice = quizCount > 0 || flashcardCount > 0 || simulatorCount > 0;

  const sidebar = <CoursePreviewSidebar course={course} courseId={courseId} currentLessonId={lessonId} />;

  return (
    <div className="space-y-4">
      <CoursePreviewToolbar
        course={course}
        activeTab="conteudo"
        onTabChange={(tab) => {
          if (tab === "alunos") router.push(`/dashboard/cursos/${courseId}/visualizar?tab=alunos`);
        }}
      />

      <div className="flex h-[calc(100vh-12rem)] border rounded-xl overflow-hidden bg-background">
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
            {lesson.status === "draft" && <Badge variant="warning">Rascunho</Badge>}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className={cn("mx-auto px-4 py-6 space-y-8", pageBuilder ? "max-w-4xl" : "max-w-3xl")}>
              <LessonContentPlayer lesson={lesson} />

              {hasPractice && (
                <div className="rounded-xl border bg-muted/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Prática disponível nesta aula</p>
                    <p className="text-sm text-muted-foreground">
                      {quizCount > 0 && `${quizCount} quiz${quizCount > 1 ? "zes" : ""}`}
                      {flashcardCount > 0 && ` · ${flashcardCount} flashcards`}
                      {simulatorCount > 0 && ` · ${simulatorCount} simulador${simulatorCount > 1 ? "es" : ""}`}
                    </p>
                  </div>
                  <Link href={`${base}/aulas/${lessonId}/praticar`}>
                    <Button variant="outline">Ver prática</Button>
                  </Link>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                {prev ? (
                  <Link href={`${base}/aulas/${prev.id}`}>
                    <Button variant="outline">
                      <ChevronLeft className="size-4 mr-1" />
                      Aula anterior
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                <Link href={`${base}?tab=alunos`}>
                  <Button variant="outline">Ver alunos e métricas</Button>
                </Link>
                {next ? (
                  <Link href={`${base}/aulas/${next.id}`}>
                    <Button variant="outline">
                      Próxima
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </Link>
                ) : hasPractice ? (
                  <Link href={`${base}/aulas/${lessonId}/praticar`}>
                    <Button>
                      Praticar
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
