"use client";

import Link from "next/link";
import { BookOpen, Dumbbell } from "lucide-react";
import { getCrmLessonEditHref } from "@lms-mocks/course-routes";
import { cn } from "@/lib/utils";

type LessonEditorNavProps = {
  courseId: string;
  moduleSlug: string;
  lessonSlug: string;
  active: "conteudo" | "praticar";
};

export function LessonEditorNav({
  courseId,
  moduleSlug,
  lessonSlug,
  active,
}: LessonEditorNavProps) {
  const tabs = [
    {
      id: "conteudo" as const,
      label: "Conteúdo",
      icon: BookOpen,
      href: getCrmLessonEditHref(courseId, moduleSlug, lessonSlug),
    },
    {
      id: "praticar" as const,
      label: "Praticar",
      icon: Dumbbell,
      href: getCrmLessonEditHref(courseId, moduleSlug, lessonSlug, "praticar"),
    },
  ];

  return (
    <div className="flex items-center gap-1 border-b">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
