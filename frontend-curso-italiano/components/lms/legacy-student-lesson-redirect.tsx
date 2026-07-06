"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { getStudentLessonHrefFromLessonId } from "@lms-mocks/course-routes";

export function LegacyStudentLessonRedirect() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const courses = useDemoCourses();
  const tenantSlug = params.tenant as string;
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  useEffect(() => {
    const base = getStudentLessonHrefFromLessonId(tenantSlug, courses, courseId, lessonId);
    if (!base) {
      router.replace(`/${tenantSlug}/cursos/${courseId}`);
      return;
    }
    router.replace(pathname.includes("/praticar") ? `${base}/praticar` : base);
  }, [courses, tenantSlug, courseId, lessonId, pathname, router]);

  return <div className="p-8 text-muted-foreground">Redirecionando...</div>;
}
