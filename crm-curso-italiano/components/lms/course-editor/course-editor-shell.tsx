"use client";

import { useParams, usePathname } from "next/navigation";
import type { Course } from "@lms-mocks/types";
import { getModuleBySlug } from "@lms-mocks/course-slugs";
import { CourseEditorSidebar } from "./course-editor-sidebar";

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

  const activeModuleSlug =
    moduleSlug && getModuleBySlug(course, moduleSlug) ? moduleSlug : undefined;

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      {!isEditMode && (
        <CourseEditorSidebar
          course={course}
          courseId={courseId}
          activeModuleSlug={activeModuleSlug}
          activeLessonSlug={lessonSlug}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
