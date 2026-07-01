"use client";

import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle, Dumbbell } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Course } from "@lms-mocks/types";
import { lessonHasPractice } from "@lms-mocks/lesson-utils";
import { cn } from "@/lib/utils";

export function CourseSidebar({
  course,
  tenantSlug,
  courseId,
  currentLessonId,
  completedLessonIds,
  progressPercent,
}: {
  course: Course;
  tenantSlug: string;
  courseId: string;
  currentLessonId: string;
  completedLessonIds: string[];
  progressPercent: number;
}) {
  return (
    <div className="flex h-full flex-col border-r bg-muted/20">
      <div className="p-4 border-b">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Curso</p>
        <h2 className="font-semibold text-sm line-clamp-2 mt-1">{course.title}</h2>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase mb-1">{mod.title}</p>
              <ul className="space-y-0.5">
                {mod.lessons.map((lesson) => {
                  const done = completedLessonIds.includes(lesson.id);
                  const active = lesson.id === currentLessonId;
                  const hasPractice = lessonHasPractice(lesson);
                  return (
                    <li key={lesson.id} className="space-y-0.5">
                      <Link
                        href={`/${tenantSlug}/cursos/${courseId}/aulas/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                          active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className={cn("size-4 shrink-0", active ? "text-white" : "text-emerald-500")} />
                        ) : active ? (
                          <PlayCircle className="size-4 shrink-0" />
                        ) : (
                          <Circle className="size-4 shrink-0 opacity-40" />
                        )}
                        <span className="line-clamp-2 flex-1">{lesson.title}</span>
                      </Link>
                      {hasPractice && (
                        <Link
                          href={`/${tenantSlug}/cursos/${courseId}/aulas/${lesson.id}/praticar`}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ml-6 transition-colors",
                            active ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-primary",
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
    </div>
  );
}
