"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Menu, HelpCircle, Layers, MessageCircle } from "lucide-react";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import { getStudentLessonHref } from "@lms-mocks/course-routes";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { getExerciseById } from "@lms-mocks/exercises";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { CourseSidebar } from "@/components/lms/course-sidebar";
import { LessonNav } from "@/components/lms/lesson-nav";
import { ExercisePlayer } from "@/components/lms/exercise-player";
import { FlashcardPlayer } from "@/components/lms/flashcard-player";
import { ConversationSimulator } from "@/components/lms/conversation-simulator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function LessonPracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantSlug = params.tenant as string;
  const courseId = params.courseId as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const { persona, completedLessonIds, getCourseProgress, submitWrittenAttempt } = useDemoStudent();
  const [writtenSubmittedIds, setWrittenSubmittedIds] = useState<string[]>([]);

  const courses = useDemoCourses();
  const course = courses.find((c) => c.id === courseId);
  const ctx = course ? getLessonBySlugs(course, moduleSlug, lessonSlug) : undefined;

  if (!course || !ctx) {
    return <div className="p-8 text-center">Aula não encontrada</div>;
  }

  const { lesson, module: mod } = ctx;
  const lessonId = lesson.id;
  const progressPercent = getCourseProgress(courseId);
  const exerciseIds = getLessonExerciseIds(lesson);
  const exercises = exerciseIds.map((id) => getExerciseById(id)).filter(Boolean);
  const practice = resolveLessonPractice(lessonId);
  const flashcards = getFlashcardsByLesson(lessonId);
  const scenarios = getSimulatorByLesson(lessonId);

  const tabParam = searchParams.get("tab");
  const tabDefault =
    tabParam === "simulador" || tabParam === "simulator"
      ? "simulador"
      : tabParam === "flashcards"
        ? "flashcards"
        : tabParam === "quizzes"
          ? "quizzes"
          : practice.modules.quizzes.enabled
            ? "quizzes"
            : practice.modules.flashcards.enabled
              ? "flashcards"
              : "simulador";

  const showQuizzes = practice.modules.quizzes.enabled;
  const showFlashcards = practice.modules.flashcards.enabled;
  const showSimulator = practice.modules.simulator.enabled;
  const tabCount = [showQuizzes, showFlashcards, showSimulator].filter(Boolean).length;

  function handleWrittenSubmit(exerciseId: string, answer: string) {
    const exercise = getExerciseById(exerciseId);
    if (!exercise || !persona || !course) return;
    submitWrittenAttempt({
      studentId: persona.id,
      studentName: persona.name,
      exerciseId,
      lessonId,
      courseId,
      courseTitle: course.title,
      lessonTitle: lesson.title,
      prompt: (exercise.config as { prompt: string }).prompt,
      answer,
      maxScore: 10,
    });
    setWrittenSubmittedIds((prev) => [...prev, exerciseId]);
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
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Curso</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {course.title} › {mod.title}
            </p>
            <h1 className="font-semibold truncate">Prática — {lesson.title}</h1>
          </div>
          <Badge className="shrink-0 hidden sm:inline-flex">Praticar</Badge>
        </div>

        <LessonNav
          tenantSlug={tenantSlug}
          courseId={courseId}
          moduleSlug={mod.slug}
          lessonSlug={lesson.slug}
          active="praticar"
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
            <Link
              href={getStudentLessonHref(tenantSlug, courseId, mod.slug, lesson.slug)}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ChevronLeft className="size-4 mr-1" />
              Voltar ao conteúdo da aula
            </Link>

            <Tabs defaultValue={tabDefault} className="w-full">
              {tabCount > 1 && (
                <TabsList className={cn("w-full grid h-auto", tabCount === 2 ? "grid-cols-2" : "grid-cols-3")}>
                  {showQuizzes && (
                    <TabsTrigger value="quizzes" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                      <HelpCircle className="size-4 hidden sm:inline" />
                      Quizzes
                    </TabsTrigger>
                  )}
                  {showFlashcards && (
                    <TabsTrigger value="flashcards" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                      <Layers className="size-4 hidden sm:inline" />
                      Flashcards
                    </TabsTrigger>
                  )}
                  {showSimulator && (
                    <TabsTrigger value="simulador" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                      <MessageCircle className="size-4 hidden sm:inline" />
                      Simulador
                    </TabsTrigger>
                  )}
                </TabsList>
              )}

              {showQuizzes && (
                <TabsContent value="quizzes" className="space-y-6 mt-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Quizzes e exercícios</h2>
                    <p className="text-sm text-muted-foreground">{practice.modules.quizzes.intro}</p>
                  </div>
                  {exercises.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum quiz nesta aula.</p>
                  ) : (
                    exercises.map(
                      (exercise) =>
                        exercise && (
                          <ExercisePlayer
                            key={exercise.id}
                            exercise={exercise}
                            writtenSubmitted={writtenSubmittedIds.includes(exercise.id)}
                            onWrittenSubmit={(answer) => handleWrittenSubmit(exercise.id, answer)}
                          />
                        ),
                    )
                  )}
                </TabsContent>
              )}

              {showFlashcards && (
                <TabsContent value="flashcards" className="mt-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-1">Flashcards</h2>
                    <p className="text-sm text-muted-foreground">{practice.modules.flashcards.intro}</p>
                  </div>
                  <FlashcardPlayer cards={flashcards} />
                </TabsContent>
              )}

              {showSimulator && (
                <TabsContent value="simulador" className="mt-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-1">Simulador de conversação</h2>
                    <p className="text-sm text-muted-foreground">{practice.modules.simulator.intro}</p>
                  </div>
                  <ConversationSimulator scenarios={scenarios} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
