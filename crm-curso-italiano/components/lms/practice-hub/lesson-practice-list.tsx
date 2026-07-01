"use client";

import Link from "next/link";
import type { Course } from "@lms-mocks/types";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HelpCircle, Layers, MessageCircle, ChevronRight } from "lucide-react";

interface LessonPracticeListProps {
  courses: Course[];
  filter?: "all" | "with-practice" | "without-practice";
}

export function LessonPracticeList({ courses, filter = "all" }: LessonPracticeListProps) {
  return (
    <div className="space-y-8">
      {courses.map((course) => {
        const lessons = course.modules.flatMap((mod) =>
          mod.lessons.map((lesson) => {
            const settings = resolveLessonPractice(lesson.id);
            const exCount = getLessonExerciseIds(lesson).length;
            const fcCount = getFlashcardsByLesson(lesson.id).length;
            const simCount = getSimulatorByLesson(lesson.id).length;
            const totalItems = exCount + fcCount + simCount;
            const hasPractice = totalItems > 0;
            const activeModules = [
              settings.modules.quizzes.enabled && exCount > 0,
              settings.modules.flashcards.enabled && fcCount > 0,
              settings.modules.simulator.enabled && simCount > 0,
            ].filter(Boolean).length;

            return { mod, lesson, exCount, fcCount, simCount, totalItems, hasPractice, activeModules };
          }),
        );

        const filteredLessons = lessons.filter(({ hasPractice }) => {
          if (filter === "with-practice") return hasPractice;
          if (filter === "without-practice") return !hasPractice;
          return true;
        });

        if (filteredLessons.length === 0) return null;

        const withPractice = lessons.filter((l) => l.hasPractice).length;
        const coverage = lessons.length > 0 ? Math.round((withPractice / lessons.length) * 100) : 0;

        return (
          <section key={course.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge>{course.level}</Badge>
                  <Badge variant={course.status === "published" ? "success" : "secondary"}>
                    {course.status === "published" ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <h2 className="text-lg font-semibold">{course.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {withPractice} de {lessons.length} aulas com prática · {coverage}% cobertura
                </p>
              </div>
              <Link href={`/dashboard/cursos/${course.id}`}>
                <Button variant="outline" size="sm">
                  Ver curso
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
            <Progress value={coverage} className="h-1.5" />

            <div className="space-y-2">
              {filteredLessons.map(({ mod, lesson, exCount, fcCount, simCount, totalItems, hasPractice, activeModules }) => (
                <Card
                  key={lesson.id}
                  className={hasPractice ? undefined : "border-dashed bg-muted/20"}
                >
                  <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{mod.title}</p>
                      <p className="font-medium">{lesson.title}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <HelpCircle className="size-3" />
                          {exCount} quizzes
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <Layers className="size-3" />
                          {fcCount} flashcards
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <MessageCircle className="size-3" />
                          {simCount} simulador
                        </Badge>
                        {hasPractice ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {activeModules} módulo(s) ativo(s)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Sem prática
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {totalItems > 0 && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {totalItems} itens
                        </span>
                      )}
                      <Link href={`/dashboard/cursos/${course.id}/aulas/${lesson.id}/praticar`}>
                        <Button size="sm" variant={hasPractice ? "default" : "outline"}>
                          {hasPractice ? "Gerenciar" : "Configurar"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
