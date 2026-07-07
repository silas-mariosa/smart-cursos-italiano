"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCrmDefaultLessonHref } from "@lms-mocks/course-routes";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);

  useEffect(() => {
    if (!course) return;
    router.replace(getCrmDefaultLessonHref(course));
  }, [course, router]);

  if (!course) return null;

  return (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      Abrindo editor...
    </div>
  );
}
