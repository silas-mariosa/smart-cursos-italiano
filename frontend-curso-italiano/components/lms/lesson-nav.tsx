"use client";

import Link from "next/link";
import { BookOpen, Dumbbell, Video } from "lucide-react";
import {
  getStudentLessonHref,
  getStudentLessonPracticeHref,
} from "@lms-mocks/course-routes";
import { cn } from "@/lib/utils";

type LessonNavProps = {
  tenantSlug: string;
  courseId: string;
  moduleSlug: string;
  lessonSlug: string;
  active: "conteudo" | "praticar";
  hasPractice?: boolean;
};

export function LessonNav({
  tenantSlug,
  courseId,
  moduleSlug,
  lessonSlug,
  active,
  hasPractice = true,
}: LessonNavProps) {
  const base = getStudentLessonHref(tenantSlug, courseId, moduleSlug, lessonSlug);

  const tabs = [
    { id: "conteudo" as const, label: "Conteúdo", icon: BookOpen, href: base },
    ...(hasPractice
      ? [
          {
            id: "praticar" as const,
            label: "Praticar",
            icon: Dumbbell,
            href: getStudentLessonPracticeHref(tenantSlug, courseId, moduleSlug, lessonSlug),
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-center gap-1 border-b px-2 sm:px-4 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0",
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

export function LiveNavLink({ tenantSlug, sessionId }: { tenantSlug: string; sessionId: string }) {
  return (
    <Link
      href={`/${tenantSlug}/ao-vivo/${sessionId}`}
      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 border-b-2 border-transparent hover:border-red-600 -mb-px"
    >
      <Video className="size-4" />
      Ao vivo
    </Link>
  );
}
