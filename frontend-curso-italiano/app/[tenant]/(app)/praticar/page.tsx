"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Dumbbell, HelpCircle, Layers, MessageCircle } from "lucide-react";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { getLessonExerciseIds, lessonHasPractice } from "@lms-mocks/lesson-utils";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PracticeHubPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const courses = useDemoCourses();

  const publishedCourses = courses.filter((c) => c.status === "published");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="size-7 text-primary" />
          Central de prática
        </h1>
        <p className="text-muted-foreground mt-1">
          Quizzes, flashcards e simulador de conversação — separados do conteúdo das aulas.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: HelpCircle, title: "Quizzes", desc: "Exercícios com feedback imediato" },
          { icon: Layers, title: "Flashcards", desc: "Memorize vocabulário" },
          { icon: MessageCircle, title: "Simulador", desc: "Diálogos do dia a dia" },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="pt-6 text-center">
              <item.icon className="size-8 text-primary mx-auto mb-2" />
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {publishedCourses.map((course) => (
        <section key={course.id}>
          <h2 className="text-lg font-semibold mb-4">{course.title}</h2>
          <div className="space-y-2">
            {course.modules.flatMap((mod) =>
              mod.lessons
                .filter((l) => lessonHasPractice(l))
                .map((lesson) => {
                  const exCount = getLessonExerciseIds(lesson).length;
                  const fcCount = getFlashcardsByLesson(lesson.id).length;
                  return (
                    <Card key={lesson.id}>
                      <CardContent className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">{mod.title}</p>
                          <p className="font-medium">{lesson.title}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{exCount} quizzes</Badge>
                            <Badge variant="outline">{fcCount} flashcards</Badge>
                            <Badge variant="outline">Simulador</Badge>
                          </div>
                        </div>
                        <Link href={`/${tenantSlug}/cursos/${course.id}/aulas/${lesson.id}/praticar`}>
                          <Button>Praticar</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                }),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
