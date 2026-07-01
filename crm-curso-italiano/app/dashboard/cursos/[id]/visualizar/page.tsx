"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getCourseAnalytics } from "@/lib/course-analytics";
import { CoursePreviewToolbar } from "@/components/lms/course-preview/course-preview-toolbar";
import { CourseStudentView } from "@/components/lms/course-preview/course-student-view";
import { CourseAnalyticsPanel } from "@/components/lms/course-preview/course-analytics-panel";

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const { courses, students, grades } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const [activeTab, setActiveTab] = useState<"conteudo" | "alunos">(
    searchParams.get("tab") === "alunos" ? "alunos" : "conteudo",
  );

  function handleTabChange(tab: "conteudo" | "alunos") {
    setActiveTab(tab);
    router.replace(
      tab === "alunos"
        ? `/dashboard/cursos/${courseId}/visualizar?tab=alunos`
        : `/dashboard/cursos/${courseId}/visualizar`,
      { scroll: false },
    );
  }

  if (!course) {
    return <div className="p-8 text-center">Curso não encontrado</div>;
  }

  const analytics = getCourseAnalytics(course, students, grades);

  return (
    <div className="space-y-4">
      <CoursePreviewToolbar course={course} activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "conteudo" ? (
        <div className="rounded-xl border bg-background overflow-hidden">
          <CourseStudentView course={course} courseId={courseId} />
        </div>
      ) : (
        <CourseAnalyticsPanel course={course} analytics={analytics} />
      )}
    </div>
  );
}
