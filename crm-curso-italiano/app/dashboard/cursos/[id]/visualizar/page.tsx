"use client";

import { useParams } from "next/navigation";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { CoursePreviewToolbar } from "@/components/lms/course-preview/course-preview-toolbar";
import { CrmCourseOverviewView } from "@/components/lms/course-preview/crm-course-overview-view";

export default function CoursePreviewPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  if (!course) {
    return <div className="p-8 text-center">Curso não encontrado</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <CoursePreviewToolbar
        course={course}
        primaryAction="back"
        className="rounded-none border-x-0 border-t-0 shadow-none"
      />
      <div className="flex-1 overflow-y-auto">
        <CrmCourseOverviewView course={course} courseId={courseId} />
      </div>
    </div>
  );
}
