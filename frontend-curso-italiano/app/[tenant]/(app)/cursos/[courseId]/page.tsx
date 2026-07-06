"use client";

import { useParams } from "next/navigation";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import {
  getStudentLessonHrefFromLessonId,
} from "@lms-mocks/course-routes";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { useStoredStudentProfile } from "@/lib/hooks/useStoredStudentProfile";
import { CourseAccessGate } from "@/components/lms/course-access-gate";
import { CourseOverviewView } from "@/components/lms/course-overview";

export default function CourseOverviewPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const courseId = params.courseId as string;
  const { completedLessonIds, getCourseProgress, progress, persona } = useDemoStudent();
  const profile = useStoredStudentProfile(persona?.id);

  const courses = useDemoCourses();
  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return <div className="p-8 text-center">Curso não encontrado</div>;
  }

  if (!profile) return null;

  const progressPercent = getCourseProgress(courseId);
  const nextLessonId =
    progress.lastLessonId ??
    course.modules.flatMap((m) => m.lessons).find((l) => !completedLessonIds.includes(l.id))?.id ??
    null;
  const continueHref = nextLessonId
    ? getStudentLessonHrefFromLessonId(tenantSlug, courses, courseId, nextLessonId)
    : null;

  return (
    <CourseAccessGate student={profile} courseId={courseId} tenantSlug={tenantSlug}>
      <CourseOverviewView
        course={course}
        courseId={courseId}
        tenantSlug={tenantSlug}
        progressPercent={progressPercent}
        completedLessonIds={completedLessonIds}
        continueHref={continueHref}
        nextLessonId={nextLessonId}
      />
    </CourseAccessGate>
  );
}
