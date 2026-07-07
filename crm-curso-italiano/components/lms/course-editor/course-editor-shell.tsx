"use client";

import { useParams, usePathname } from "next/navigation";
import type { Course } from "@lms-mocks/types";
import { getModuleBySlug } from "@lms-mocks/course-slugs";
import { CourseEditorSidebar } from "./course-editor-sidebar";

function isCourseMetricsPath(pathname: string): boolean {
  return /\/dashboard\/cursos\/[^/]+\/metricas\/?$/.test(pathname);
}

function isCoursePreviewPath(pathname: string): boolean {
  return /\/dashboard\/cursos\/[^/]+\/visualizar(\/|$)/.test(pathname);
}

type CourseEditorShellProps = {
  course: Course;
  children: React.ReactNode;
};

export function CourseEditorShell({ course, children }: CourseEditorShellProps) {
  const params = useParams();
  const pathname = usePathname();
  const courseId = params.id as string;
  const moduleSlug = params.moduleSlug as string | undefined;
  const lessonSlug = params.lessonSlug as string | undefined;
  const isEditMode = pathname.endsWith("/editar");
  const isMetricsPage = isCourseMetricsPath(pathname);
  const showSidebar = !isEditMode && !isMetricsPage && !isCoursePreviewPath(pathname);

  const activeModuleSlug =
    moduleSlug && getModuleBySlug(course, moduleSlug) ? moduleSlug : undefined;

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      {showSidebar ? (
        <CourseEditorSidebar
          course={course}
          courseId={courseId}
          activeModuleSlug={activeModuleSlug}
          activeLessonSlug={lessonSlug}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
