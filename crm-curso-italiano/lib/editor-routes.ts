import {
  getCrmCourseHref,
  getCrmDefaultLessonHref,
  getCrmLessonEditHref,
  getCrmLessonHref,
  getCrmLessonPreviewHref,
  getCrmModuleHref,
  isCourseEditorShellPath,
  isCrmCourseWorkspacePath,
  isLessonEditorPath,
  type CrmLessonEditorMode,
} from "@lms-mocks/course-routes";
import type { Course } from "@lms-mocks/types";
import { getLessonByIdInCourses } from "@lms-mocks/course-slugs";

export {
  getCrmCourseHref,
  getCrmDefaultLessonHref,
  getCrmModuleHref,
  getCrmLessonHref,
  getCrmLessonEditHref,
  getCrmLessonPreviewHref,
  isCourseEditorShellPath,
  isCrmCourseWorkspacePath,
  isLessonEditorPath,
};
export type { CrmLessonEditorMode };

export function getLessonEditorHref(
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
  mode: CrmLessonEditorMode = "conteudo",
): string {
  return getCrmLessonEditHref(courseId, moduleSlug, lessonSlug, mode);
}

export function getLessonPreviewHref(
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
  mode: CrmLessonEditorMode = "conteudo",
): string {
  return getCrmLessonPreviewHref(courseId, moduleSlug, lessonSlug, mode);
}

/** Resolve slug-based editor URL from legacy lesson id. */
export function getLessonEditorHrefFromLessonId(
  courses: Course[],
  courseId: string,
  lessonId: string,
  mode: CrmLessonEditorMode = "conteudo",
): string | null {
  const ctx = getLessonByIdInCourses(courses, courseId, lessonId);
  if (!ctx) return null;
  return getCrmLessonEditHref(courseId, ctx.module.slug, ctx.lesson.slug, mode);
}

export function getLessonPreviewHrefFromLessonId(
  courses: Course[],
  courseId: string,
  lessonId: string,
  mode: CrmLessonEditorMode = "conteudo",
): string | null {
  const ctx = getLessonByIdInCourses(courses, courseId, lessonId);
  if (!ctx) return null;
  return getCrmLessonPreviewHref(courseId, ctx.module.slug, ctx.lesson.slug, mode);
}
