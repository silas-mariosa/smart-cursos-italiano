"use client";

import { isPageBuilderLesson } from "@lms-mocks/lesson-display";
import { getLessonBySlugs } from "@lms-mocks/course-slugs";
import { useParams } from "next/navigation";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { getLessonEditorHref } from "@/lib/editor-routes";
import { LessonPreviewBar } from "@/components/lms/lesson-preview-bar";
import { LessonContentPlayer } from "@/components/lms/course-preview/lesson-content-player";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LessonContentPreviewPage() {
  const params = useParams();
  const courseId = params.id as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;
  const { courses } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const ctx = course ? getLessonBySlugs(course, moduleSlug, lessonSlug) : undefined;

  if (!course || !ctx) {
    return <div className="p-8 text-center">Aula não encontrada</div>;
  }

  const { lesson, module: mod } = ctx;
  const pageBuilder = isPageBuilderLesson(lesson);
  const editorHref = getLessonEditorHref(courseId, mod.slug, lesson.slug, "conteudo");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <LessonPreviewBar editorHref={editorHref} lessonTitle={lesson.title} />

      <div className="flex-1 overflow-y-auto bg-muted/10">
        <div className={cn("mx-auto px-4 py-8", pageBuilder ? "max-w-4xl" : "max-w-3xl")}>
          <div className="mb-8 space-y-2">
            <p className="text-xs text-muted-foreground">
              {course.title} › {mod.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <Badge variant="secondary">{lesson.durationMinutes} min</Badge>
              {lesson.status === "draft" && <Badge variant="secondary">Rascunho</Badge>}
            </div>
          </div>

          <LessonContentPlayer lesson={lesson} />
        </div>
      </div>
    </div>
  );
}
