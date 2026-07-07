"use client";

import { useParams } from "next/navigation";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getCourseAnalytics } from "@/lib/course-analytics";
import { CourseMetricsToolbar } from "@/components/lms/course-preview/course-preview-toolbar";
import { CourseAnalyticsPanel } from "@/components/lms/course-preview/course-analytics-panel";

export default function CourseMetricsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { courses, students, grades } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  if (!course) {
    return <div className="p-8 text-center">Curso não encontrado</div>;
  }

  const analytics = getCourseAnalytics(course, students, grades);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/10">
      <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-hidden p-4">
        <CourseMetricsToolbar course={course} />
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">
          <CourseAnalyticsPanel course={course} analytics={analytics} />
        </div>
      </div>
    </div>
  );
}
