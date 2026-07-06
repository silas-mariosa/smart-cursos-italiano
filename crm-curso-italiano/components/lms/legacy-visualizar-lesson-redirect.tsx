"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getLessonByIdInCourses } from "@lms-mocks/course-slugs";
import {
  getCrmLessonPreviewPlayerHref,
  getCrmLessonPreviewPracticeHref,
} from "@lms-mocks/course-routes";
import { useMockStore } from "@/lib/mock-store";

export function LegacyVisualizarLessonRedirect() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { courses } = useMockStore();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  useEffect(() => {
    const ctx = getLessonByIdInCourses(courses, courseId, lessonId);
    if (!ctx) {
      router.replace(`/dashboard/cursos/${courseId}/visualizar`);
      return;
    }
    const isPractice = pathname.includes("/praticar");
    const href = isPractice
      ? getCrmLessonPreviewPracticeHref(courseId, ctx.module.slug, ctx.lesson.slug)
      : getCrmLessonPreviewPlayerHref(courseId, ctx.module.slug, ctx.lesson.slug);
    router.replace(href);
  }, [courses, courseId, lessonId, pathname, router]);

  return <div className="p-8 text-muted-foreground">Redirecionando...</div>;
}
