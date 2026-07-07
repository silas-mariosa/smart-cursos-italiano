"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Eye, Pencil, Users } from "lucide-react";
import type { Course } from "@lms-mocks/types";
import {
  getCrmCoursePreviewHref,
  getCrmDefaultLessonHref,
} from "@lms-mocks/course-routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoursePreviewToolbarProps {
  course: Course;
  className?: string;
  primaryAction?: "edit" | "back";
}

function getCoursePreviewBackHref(pathname: string, courseId: string): string {
  const overviewPath = `/dashboard/cursos/${courseId}/visualizar`;
  if (pathname === overviewPath || pathname === `${overviewPath}/`) {
    return "/dashboard/cursos";
  }
  if (pathname.startsWith(`${overviewPath}/`)) {
    return getCrmCoursePreviewHref(courseId);
  }
  return "/dashboard/cursos";
}

export function CoursePreviewToolbar({
  course,
  className,
  primaryAction = "edit",
}: CoursePreviewToolbarProps) {
  const pathname = usePathname();
  const backHref = getCoursePreviewBackHref(pathname, course.id);

  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {primaryAction === "back" ? (
            <Button variant="ghost" size="sm" className="shrink-0" asChild>
              <Link href={backHref}>
                <ArrowLeft className="mr-1 size-4" />
                Voltar
              </Link>
            </Button>
          ) : (
            <Link href={getCrmDefaultLessonHref(course)}>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Pencil className="mr-1 size-4" />
                Editar
              </Button>
            </Link>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Eye className="size-3" />
                Visão do aluno
              </Badge>
              <Badge variant={course.status === "published" ? "success" : "secondary"}>
                {course.status === "published" ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm font-medium">{course.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CourseMetricsToolbarProps {
  course: Course;
  className?: string;
}

export function CourseMetricsToolbar({ course, className }: CourseMetricsToolbarProps) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={getCrmDefaultLessonHref(course)}>
            <Button variant="ghost" size="sm" className="shrink-0">
              <ArrowLeft className="mr-1 size-4" />
              Voltar ao curso
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Users className="size-3" />
                Alunos e métricas
              </Badge>
              <Badge variant={course.status === "published" ? "success" : "secondary"}>
                {course.status === "published" ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm font-medium">{course.title}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link href={getCrmCoursePreviewHref(course.id)}>
            <Eye className="mr-1 size-3.5" />
            Visão do aluno
          </Link>
        </Button>
      </div>
    </div>
  );
}
