"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { Course } from "@lms-mocks/types";
import { countLessons } from "@lms-mocks/courses";
import { lessonHasPractice } from "@lms-mocks/lesson-utils";
import {
  getStudentLessonHref,
  getStudentLessonPracticeHref,
} from "@lms-mocks/course-routes";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type CourseOverviewViewProps = {
  course: Course;
  courseId: string;
  tenantSlug: string;
  progressPercent: number;
  completedLessonIds: string[];
  continueHref: string | null;
  nextLessonId?: string | null;
};

function resolveNextLessonId(
  course: Course,
  completedLessonIds: string[],
  lastLessonId: string | null,
): string | null {
  if (lastLessonId) return lastLessonId;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!completedLessonIds.includes(lesson.id)) return lesson.id;
    }
  }
  return null;
}

export function CourseOverviewView({
  course,
  courseId,
  tenantSlug,
  progressPercent,
  completedLessonIds,
  continueHref,
  nextLessonId: nextLessonIdProp,
}: CourseOverviewViewProps) {
  const totalLessons = countLessons(course);
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons[0];
  const nextLessonId =
    nextLessonIdProp ??
    resolveNextLessonId(course, completedLessonIds, null);
  const startHref =
    continueHref ??
    (firstModule && firstLesson
      ? getStudentLessonHref(tenantSlug, courseId, firstModule.slug, firstLesson.slug)
      : null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <div className="relative h-40 overflow-hidden rounded-xl bg-muted md:h-auto">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge>{course.level}</Badge>
            <Badge variant="secondary">
              {course.status === "published" ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
          <p className="text-sm text-muted-foreground">
            {totalLessons} aulas · Prof. {course.instructorName}
          </p>
          <div className="max-w-md space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>
          {startHref && (
            <Link
              href={startHref}
              className={cn(buttonVariants())}
            >
              {progressPercent > 0 ? "Continuar · próxima aula" : "Iniciar primeira aula"}
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Conteúdo do curso</h2>
        <Accordion type="multiple" defaultValue={course.modules.map((m) => m.id)}>
          {course.modules.map((mod) => (
            <AccordionItem key={mod.id} value={mod.id}>
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  {mod.title}
                  <Badge variant="outline" className="ml-2">
                    {mod.lessons.length} aulas
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 pl-2">
                  {mod.lessons.map((lesson) => {
                    const done = completedLessonIds.includes(lesson.id);
                    const hasPractice = lessonHasPractice(lesson);
                    return (
                      <li key={lesson.id} className="space-y-0.5">
                        <Link
                          href={getStudentLessonHref(
                            tenantSlug,
                            courseId,
                            mod.slug,
                            lesson.slug,
                          )}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent min-w-0"
                        >
                          {done ? (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                          ) : lesson.id === nextLessonId ? (
                            <PlayCircle className="size-4 shrink-0 text-primary" />
                          ) : (
                            <Circle className="size-4 shrink-0 opacity-40" />
                          )}
                          <span className="flex-1 min-w-0 truncate">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {lesson.durationMinutes} min
                          </span>
                          {lesson.status === "draft" && (
                            <Badge variant="secondary" className="text-[10px]">
                              Rascunho
                            </Badge>
                          )}
                        </Link>
                        {hasPractice && (
                          <Link
                            href={getStudentLessonPracticeHref(
                              tenantSlug,
                              courseId,
                              mod.slug,
                              lesson.slug,
                            )}
                            className="ml-10 text-xs text-primary hover:underline"
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
          ))}
        </Accordion>
      </section>
    </div>
  );
}
