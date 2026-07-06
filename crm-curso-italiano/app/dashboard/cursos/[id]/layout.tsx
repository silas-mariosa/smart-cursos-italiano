"use client";

import { useParams } from "next/navigation";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { CourseEditorShell } from "@/components/lms/course-editor/course-editor-shell";

export default function CourseEditorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = params.id as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  if (!course) {
    return <div className="p-8">Curso não encontrado</div>;
  }

  return <CourseEditorShell course={course}>{children}</CourseEditorShell>;
}
