"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { countLessons } from "@lms-mocks/courses";
import { lessonHasPractice } from "@lms-mocks/lesson-utils";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";

export default function CourseOverviewPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const courseId = params.courseId as string;
  const { completedLessonIds, getCourseProgress, progress } = useDemoStudent();

  const courses = useDemoCourses();
  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return <div className="p-8 text-center">Curso não encontrado</div>;
  }

  const progressPercent = getCourseProgress(courseId);
  const totalLessons = countLessons(course);
  const continueId = progress.lastLessonId ?? course.modules[0]?.lessons[0]?.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <Link href={`/${tenantSlug}/dashboard`} className="text-sm text-primary hover:underline">
        ← Dashboard
      </Link>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        <div className="relative h-40 md:h-auto rounded-xl overflow-hidden bg-muted">
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" unoptimized />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge>{course.level}</Badge>
            <Badge variant="secondary">{course.status === "published" ? "Publicado" : "Rascunho"}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
          <p className="text-sm text-muted-foreground">
            {totalLessons} aulas · Prof. {course.instructorName}
          </p>
          <div className="max-w-md space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>
          {continueId && (
            <Link href={`/${tenantSlug}/cursos/${courseId}/aulas/${continueId}`}>
              <Button>Continuar · próxima aula</Button>
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Conteúdo do curso</h2>
        <Accordion type="multiple" defaultValue={course.modules.map((m) => m.id)}>
          {course.modules.map((mod) => {
            const modCompleted = mod.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
            return (
              <AccordionItem key={mod.id} value={mod.id}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    {mod.title}
                    <Badge variant="outline" className="ml-2">
                      {modCompleted}/{mod.lessons.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 pl-2">
                    {mod.lessons.map((lesson) => {
                      const done = completedLessonIds.includes(lesson.id);
                      const active = lesson.id === continueId;
                      return (
                        <li key={lesson.id} className="space-y-0.5">
                          <Link
                            href={`/${tenantSlug}/cursos/${courseId}/aulas/${lesson.id}`}
                            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent text-sm"
                          >
                            {done ? (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            ) : active ? (
                              <PlayCircle className="size-4 text-primary" />
                            ) : (
                              <Circle className="size-4 opacity-40" />
                            )}
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-xs text-muted-foreground">{lesson.durationMinutes} min</span>
                          </Link>
                          {lessonHasPractice(lesson) && (
                            <Link
                              href={`/${tenantSlug}/cursos/${courseId}/aulas/${lesson.id}/praticar`}
                              className="text-xs text-primary hover:underline ml-10"
                            >
                              → Praticar exercícios
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
    </div>
  );
}
