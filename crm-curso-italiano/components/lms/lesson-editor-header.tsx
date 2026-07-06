"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Dumbbell, Eye } from "lucide-react";
import {
  getCrmCourseHref,
  getCrmLessonEditHref,
  getCrmLessonHref,
} from "@lms-mocks/course-routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LessonEditorHeaderProps = {
  courseId: string;
  courseTitle: string;
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  active: "conteudo" | "praticar";
  previewHref: string;
};

export function LessonEditorHeader({
  courseId,
  courseTitle,
  moduleSlug,
  lessonSlug,
  lessonTitle,
  active,
  previewHref,
}: LessonEditorHeaderProps) {
  const editBase = getCrmLessonEditHref(courseId, moduleSlug, lessonSlug);

  const tabs = [
    { id: "conteudo" as const, label: "Conteúdo", icon: BookOpen, href: `${editBase}` },
    { id: "praticar" as const, label: "Praticar", icon: Dumbbell, href: `${editBase}/praticar` },
  ];

  return (
    <header className="flex items-center gap-3 border-b bg-background px-3 py-2 shrink-0">
      <Link
        href={getCrmCourseHref(courseId)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground shrink-0"
        title={courseTitle}
      >
        <ArrowLeft className="size-4" />
        <span className="hidden sm:inline max-w-32 truncate">Visão do curso</span>
      </Link>

      <div className="h-4 w-px bg-border shrink-0" />

      <Link
        href={getCrmCourseHref(courseId)}
        className="hidden md:inline text-xs text-muted-foreground hover:text-foreground truncate max-w-28"
        title={courseTitle}
      >
        {courseTitle}
      </Link>

      <div className="hidden md:block h-4 w-px bg-border shrink-0" />

      <h1 className="text-sm font-semibold truncate min-w-0 flex-1">{lessonTitle}</h1>

      <nav className="flex items-center gap-0.5 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              <span className="hidden md:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
        <Link href={previewHref}>
          <Eye className="size-3.5 mr-1" />
          <span className="hidden sm:inline">Pré-visualizar</span>
        </Link>
      </Button>
    </header>
  );
}
