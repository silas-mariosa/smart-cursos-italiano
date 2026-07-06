"use client";

import { useParams } from "next/navigation";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { CourseStudentView } from "@/components/lms/course-preview/course-student-view";

export default function CourseEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  if (!course) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-muted/10">
      <CourseStudentView course={course} courseId={courseId} variant="embedded" />
    </div>
  );
}
