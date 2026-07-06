"use client";

import Link from "next/link";
import Image from "next/image";
import { Circle, Pencil, PlayCircle } from "lucide-react";
import type { Course } from "@lms-mocks/types";
import { countLessons } from "@lms-mocks/courses";
import { lessonHasPractice } from "@lms-mocks/lesson-utils";
import {
  getCrmCoursePreviewHref,
  getCrmLessonEditHref,
  getCrmLessonHref,
  getCrmLessonPreviewPlayerHref,
  getCrmLessonPreviewPracticeHref,
} from "@lms-mocks/course-routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CourseStudentViewProps {
  course: Course;
  courseId: string;
  variant?: "standalone" | "embedded";
}

export function CourseStudentView({
  course,
  courseId,
  variant = "standalone",
}: CourseStudentViewProps) {
  const totalLessons = countLessons(course);
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons[0];
  const embedded = variant === "embedded";

  const lessonHref = (moduleSlug: string, lessonSlug: string) =>
    embedded
      ? getCrmLessonHref(courseId, moduleSlug, lessonSlug)
      : getCrmLessonPreviewPlayerHref(courseId, moduleSlug, lessonSlug);

  const practiceHref = (moduleSlug: string, lessonSlug: string) =>
    embedded
      ? getCrmLessonHref(courseId, moduleSlug, lessonSlug, "praticar")
      : getCrmLessonPreviewPracticeHref(courseId, moduleSlug, lessonSlug);

  const startHref =
    firstModule && firstLesson
      ? lessonHref(firstModule.slug, firstLesson.slug)
      : null;

  return (
    <div className={embedded ? "px-4 py-6 space-y-6" : "mx-auto max-w-4xl px-4 py-8 space-y-8"}>
      {embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Visão do aluno
            </p>
            <p className="text-sm text-muted-foreground">
              Pré-visualização de como o curso aparece para os estudantes
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={getCrmCoursePreviewHref(courseId)}>Abrir em tela cheia</Link>
          </Button>
        </div>
      )}

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
              <span>{embedded ? "Progresso (exemplo aluno)" : "Progresso (exemplo aluno)"}</span>
              <span>0%</span>
            </div>
            <Progress value={0} />
          </div>
          {startHref && (
            <Link href={startHref}>
              <Button>Iniciar primeira aula</Button>
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
                  {mod.lessons.map((lesson, index) => (
                    <li key={lesson.id} className="space-y-0.5">
                      <div className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent/50">
                        <Link
                          href={lessonHref(mod.slug, lesson.slug)}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-2 text-sm"
                        >
                          {index === 0 ? (
                            <PlayCircle className="size-4 shrink-0 text-primary" />
                          ) : (
                            <Circle className="size-4 shrink-0 opacity-40" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {lesson.durationMinutes} min
                          </span>
                          {lesson.status === "draft" && (
                            <Badge variant="secondary" className="text-[10px]">
                              Rascunho
                            </Badge>
                          )}
                        </Link>
                        {embedded && (
                          <Button variant="outline" size="sm" className="h-8 shrink-0 text-xs" asChild>
                            <Link href={getCrmLessonEditHref(courseId, mod.slug, lesson.slug)}>
                              <Pencil className="mr-1 size-3" />
                              Editar
                            </Link>
                          </Button>
                        )}
                      </div>
                      {lessonHasPractice(lesson) && (
                        <Link
                          href={practiceHref(mod.slug, lesson.slug)}
                          className="ml-10 text-xs text-primary hover:underline"
                        >
                          → Praticar exercícios
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
