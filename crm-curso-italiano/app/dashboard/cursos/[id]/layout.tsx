"use client";

import { useParams, usePathname } from "next/navigation";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { CourseEditorShell } from "@/components/lms/course-editor/course-editor-shell";
import { CourseEditorMobileBlock } from "@/components/lms/course-editor/course-editor-mobile-block";
import { useIsMobile } from "@/hooks/use-mobile";
import { isCourseLessonEditRoute } from "@/lib/course-editor-mobile";

export default function CourseEditorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const courseId = params.id as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  if (!course) {
    return <div className="p-8">Curso não encontrado</div>;
  }

  if (isMobile && isCourseLessonEditRoute(pathname)) {
    return <CourseEditorMobileBlock />;
  }

  return <CourseEditorShell course={course}>{children}</CourseEditorShell>;
}
