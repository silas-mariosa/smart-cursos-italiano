"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { Course } from "@lms-mocks/types";
import { countLessons } from "@lms-mocks/courses";
import { lessonHasPractice } from "@lms-mocks/lesson-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CourseStudentViewProps {
  course: Course;
  courseId: string;
}

export function CourseStudentView({ course, courseId }: CourseStudentViewProps) {
  const totalLessons = countLessons(course);
  const firstLesson = course.modules[0]?.lessons[0]?.id;
  const base = `/dashboard/cursos/${courseId}/visualizar`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
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
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso (exemplo aluno)</span>
              <span>0%</span>
            </div>
            <Progress value={0} />
          </div>
          {firstLesson && (
            <Link href={`${base}/aulas/${firstLesson}`}>
              <Button>Iniciar primeira aula</Button>
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Conteúdo do curso</h2>
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
                      <Link
                        href={`${base}/aulas/${lesson.id}`}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent text-sm"
                      >
                        {index === 0 ? (
                          <PlayCircle className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4 opacity-40" />
                        )}
                        <span className="flex-1">{lesson.title}</span>
                        <span className="text-xs text-muted-foreground">{lesson.durationMinutes} min</span>
                        {lesson.status === "draft" && (
                          <Badge variant="secondary" className="text-[10px]">
                            Rascunho
                          </Badge>
                        )}
                      </Link>
                      {lessonHasPractice(lesson) && (
                        <Link
                          href={`${base}/aulas/${lesson.id}/praticar`}
                          className="text-xs text-primary hover:underline ml-10"
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
