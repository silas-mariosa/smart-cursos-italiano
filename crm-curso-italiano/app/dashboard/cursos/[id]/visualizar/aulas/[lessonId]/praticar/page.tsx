"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { getLessonFromCourses } from "@lms-mocks/courses";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { getExerciseById } from "@lms-mocks/exercises";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { CoursePreviewToolbar } from "@/components/lms/course-preview/course-preview-toolbar";
import { CoursePreviewSidebar } from "@/components/lms/course-preview/course-preview-sidebar";
import { ExercisePreview } from "@/components/lms/exercise-bank/exercise-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoursePreviewPracticePage() {
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
  const exerciseIds = getLessonExerciseIds(lesson);
  const exercises = exerciseIds.map((id) => getExerciseById(id)).filter(Boolean);
  const practice = resolveLessonPractice(lessonId);
  const flashcards = getFlashcardsByLesson(lessonId);
  const scenarios = getSimulatorByLesson(lessonId);
  const base = `/dashboard/cursos/${courseId}/visualizar`;

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
              <h1 className="font-semibold truncate">Prática · {lesson.title}</h1>
            </div>
            <Badge variant="secondary">Visão do aluno</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-6">
              <Link href={`${base}/aulas/${lessonId}`} className="text-sm text-primary hover:underline">
                ← Voltar ao conteúdo da aula
              </Link>

              <Tabs defaultValue={practice.modules.quizzes.enabled ? "quizzes" : "flashcards"}>
                <TabsList>
                  {practice.modules.quizzes.enabled && (
                    <TabsTrigger value="quizzes">Quizzes ({exercises.length})</TabsTrigger>
                  )}
                  {practice.modules.flashcards.enabled && (
                    <TabsTrigger value="flashcards">Flashcards ({flashcards.length})</TabsTrigger>
                  )}
                  {practice.modules.simulator.enabled && (
                    <TabsTrigger value="simulator">Simulador ({scenarios.length})</TabsTrigger>
                  )}
                </TabsList>

                {practice.modules.quizzes.enabled && (
                  <TabsContent value="quizzes" className="space-y-4 mt-4">
                    {exercises.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum exercício vinculado.</p>
                    ) : (
                      exercises.map((ex) =>
                        ex ? (
                          <Card key={ex.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{ex.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ExercisePreview exercise={ex} />
                            </CardContent>
                          </Card>
                        ) : null,
                      )
                    )}
                  </TabsContent>
                )}

                {practice.modules.flashcards.enabled && (
                  <TabsContent value="flashcards" className="space-y-3 mt-4">
                    {flashcards.map((fc) => (
                      <Card key={fc.id}>
                        <CardContent className="py-4">
                          <p className="text-sm text-muted-foreground">Frente</p>
                          <p className="font-medium">{fc.front}</p>
                          <p className="text-sm text-muted-foreground mt-2">Verso</p>
                          <p>{fc.back}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                )}

                {practice.modules.simulator.enabled && (
                  <TabsContent value="simulator" className="space-y-3 mt-4">
                    {scenarios.map((s) => (
                      <Card key={s.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{s.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{s.description}</p>
                          <p className="text-sm mt-2">
                            Cenário: {s.setting} · {s.suggestedResponses.length} respostas sugeridas
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
