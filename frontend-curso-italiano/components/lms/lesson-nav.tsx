"use client";

import Link from "next/link";
import { BookOpen, Dumbbell, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type LessonNavProps = {
  tenantSlug: string;
  courseId: string;
  lessonId: string;
  active: "conteudo" | "praticar";
  hasPractice?: boolean;
};

export function LessonNav({ tenantSlug, courseId, lessonId, active, hasPractice = true }: LessonNavProps) {
  const base = `/${tenantSlug}/cursos/${courseId}/aulas/${lessonId}`;

  const tabs = [
    { id: "conteudo" as const, label: "Conteúdo", icon: BookOpen, href: base },
    ...(hasPractice
      ? [{ id: "praticar" as const, label: "Praticar", icon: Dumbbell, href: `${base}/praticar` }]
      : []),
  ];

  return (
    <div className="flex items-center gap-1 border-b px-4">
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
