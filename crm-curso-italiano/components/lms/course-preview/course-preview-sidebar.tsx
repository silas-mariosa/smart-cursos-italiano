"use client";

import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle, Dumbbell } from "lucide-react";
import type { Course } from "@lms-mocks/types";
import { lessonHasPractice } from "@lms-mocks/lesson-utils";
import { getCrmCoursePreviewHref, getCrmLessonPreviewPlayerHref, getCrmLessonPreviewPracticeHref } from "@lms-mocks/course-routes";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CoursePreviewSidebarProps {
  course: Course;
  courseId: string;
  currentLessonId?: string;
}

export function CoursePreviewSidebar({ course, courseId, currentLessonId }: CoursePreviewSidebarProps) {
  const base = getCrmCoursePreviewHref(courseId);

  return (
    <div className="flex h-full flex-col border-r bg-muted/20">
      <div className="p-4 border-b">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Conteúdo do curso</p>
        <h2 className="font-semibold text-sm line-clamp-2 mt-1">{course.title}</h2>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Visão do aluno</span>
            <span>—</span>
          </div>
          <Progress value={0} />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase mb-1">{mod.title}</p>
              <ul className="space-y-0.5">
                {mod.lessons.map((lesson) => {
                  const active = lesson.id === currentLessonId;
                  const hasPractice = lessonHasPractice(lesson);
                  return (
                    <li key={lesson.id} className="space-y-0.5">
                      <Link
                        href={getCrmLessonPreviewPlayerHref(courseId, mod.slug, lesson.slug)}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                          active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                        )}
                      >
                        {active ? (
                          <PlayCircle className="size-4 shrink-0" />
                        ) : (
                          <Circle className="size-4 shrink-0 opacity-40" />
                        )}
                        <span className="line-clamp-2 flex-1">{lesson.title}</span>
                        <span className="text-xs opacity-70 shrink-0">{lesson.durationMinutes}m</span>
                      </Link>
                      {hasPractice && (
                        <Link
                          href={getCrmLessonPreviewPracticeHref(courseId, mod.slug, lesson.slug)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ml-6 transition-colors",
                            active ? "text-primary-foreground/80" : "text-muted-foreground hover:text-primary",
                          )}
                        >
                          <Dumbbell className="size-3" />
                          Praticar
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 border-t">
        <Link
          href={base}
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent text-muted-foreground"
        >
          <CheckCircle2 className="size-4" />
          Visão geral do curso
        </Link>
      </div>
    </div>
  );
}
