"use client";

import Link from "next/link";
import { BookOpen, Dumbbell, Pencil } from "lucide-react";
import {
  getCrmCourseHref,
  getCrmLessonEditHref,
  getCrmLessonHref,
} from "@lms-mocks/course-routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LessonPreviewHeaderProps = {
  courseId: string;
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  active: "conteudo" | "praticar";
};

export function LessonPreviewHeader({
  courseId,
  moduleSlug,
  lessonSlug,
  lessonTitle,
  active,
}: LessonPreviewHeaderProps) {
  const tabs = [
    {
      id: "conteudo" as const,
      label: "Conteúdo",
      icon: BookOpen,
      href: getCrmLessonHref(courseId, moduleSlug, lessonSlug),
    },
    {
      id: "praticar" as const,
      label: "Praticar",
      icon: Dumbbell,
      href: getCrmLessonHref(courseId, moduleSlug, lessonSlug, "praticar"),
    },
  ];

  return (
    <header className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link
          href={getCrmCourseHref(courseId)}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Visão do curso
        </Link>
        <h1 className="truncate text-sm font-semibold">{lessonTitle}</h1>
      </div>

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
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <Button size="sm" className="h-8 shrink-0" asChild>
        <Link href={getCrmLessonEditHref(courseId, moduleSlug, lessonSlug, active)}>
          <Pencil className="mr-1 size-3.5" />
          Editar
        </Link>
      </Button>
    </header>
  );
}
