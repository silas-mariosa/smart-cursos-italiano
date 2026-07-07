"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, Eye, Plus } from "lucide-react";
import type { Course } from "@lms-mocks/types";
import {
  getCrmCourseHref,
  getCrmCoursePreviewHref,
  getCrmLessonHref,
  getCrmLessonPreviewPlayerHref,
} from "@lms-mocks/course-routes";
import { useMockStore } from "@/lib/mock-store";
import { layoutTemplateToBlocks } from "@/lib/page-builder/lesson-layout";
import { NewLessonDialog } from "@/components/lms/course-editor/new-lesson-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type CourseEditorSidebarProps = {
  course: Course;
  courseId: string;
  activeModuleSlug?: string;
  activeLessonSlug?: string;
  previewMode?: boolean;
};

export function CourseEditorSidebar({
  course,
  courseId,
  activeModuleSlug,
  activeLessonSlug,
  previewMode = false,
}: CourseEditorSidebarProps) {
  const { addLesson, addModule } = useMockStore();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newLessonModuleId, setNewLessonModuleId] = useState<string | null>(null);

  const newLessonModule = newLessonModuleId
    ? course.modules.find((m) => m.id === newLessonModuleId)
    : undefined;

  function handleAddLesson(moduleId: string) {
    setNewLessonModuleId(moduleId);
  }

  function handleConfirmNewLesson(title: string, layoutId: string | null) {
    if (!newLessonModuleId) return;
    const blocks = layoutId ? layoutTemplateToBlocks(layoutId) : [];
    addLesson(courseId, newLessonModuleId, title, blocks);
    setNewLessonModuleId(null);
  }

  function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    addModule(courseId, newModuleTitle.trim());
    setNewModuleTitle("");
  }

  function lessonLink(moduleSlug: string, lessonSlug: string) {
    return previewMode
      ? getCrmLessonPreviewPlayerHref(courseId, moduleSlug, lessonSlug)
      : getCrmLessonHref(courseId, moduleSlug, lessonSlug);
  }

  return (
    <>
      <div className="flex h-full w-72 shrink-0 flex-col border-r bg-background">
      <div className="space-y-3 border-b p-4">
        <Link href="/dashboard/cursos" className="text-sm text-primary hover:underline">
          ← Cursos
        </Link>
        <h2 className="text-base font-bold leading-snug">{course.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-600 hover:bg-emerald-600">
            {course.status === "published" ? "Publicado" : "Rascunho"}
          </Badge>
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            asChild
          >
            <Link href={getCrmCoursePreviewHref(courseId)}>
              <Eye className="mr-1 size-3.5" />
              Visualizar
            </Link>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 p-3">
          {course.modules.map((mod) => {
            const isActiveModule = mod.slug === activeModuleSlug;
            return (
              <div
                key={mod.id}
                className={cn(isActiveModule && !activeLessonSlug && "rounded-lg bg-muted/40 p-1")}
              >
                <Link
                  href={previewMode ? getCrmCoursePreviewHref(courseId) : getCrmCourseHref(courseId)}
                  className="block px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                  {mod.title}
                </Link>
                <ul className="mt-1 space-y-0.5">
                  {mod.lessons.map((lesson) => {
                    const active = isActiveModule && lesson.slug === activeLessonSlug;
                    const published = lesson.status === "published";
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={lessonLink(mod.slug, lesson.slug)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                            active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                          )}
                        >
                          {published ? (
                            <CheckCircle2
                              className={cn(
                                "size-4 shrink-0",
                                active ? "text-primary-foreground" : "text-emerald-500",
                              )}
                            />
                          ) : (
                            <Circle className="size-4 shrink-0 opacity-40" />
                          )}
                          <span className="line-clamp-2 flex-1">{lesson.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  onClick={() => handleAddLesson(mod.id)}
                  className="mt-1 w-full rounded-md px-2 py-1.5 text-center text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  + Nova aula
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="space-y-2 border-t p-3">
        <Input
          placeholder="Novo módulo..."
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
          className="h-8 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAddModule}
          disabled={!newModuleTitle.trim()}
        >
          <Plus className="mr-1 size-4" />
          Módulo
        </Button>
      </div>
      </div>

      <NewLessonDialog
        open={!!newLessonModuleId}
        onOpenChange={(open) => {
          if (!open) setNewLessonModuleId(null);
        }}
        moduleTitle={newLessonModule?.title}
        onConfirm={handleConfirmNewLesson}
      />
    </>
  );
}
