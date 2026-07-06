import type { Course } from "./types";
import { getLessonByIdInCourses } from "./course-slugs";

export type CrmLessonEditorMode = "conteudo" | "praticar";

export function getCrmCourseHref(courseId: string): string {
  return `/dashboard/cursos/${courseId}`;
}

export function getCrmModuleHref(courseId: string, moduleSlug: string): string {
  return `/dashboard/cursos/${courseId}/${moduleSlug}`;
}

export function getCrmLessonHref(
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
  mode: CrmLessonEditorMode = "conteudo",
): string {
  const base = `/dashboard/cursos/${courseId}/${moduleSlug}/${lessonSlug}`;
  return mode === "praticar" ? `${base}/praticar` : base;
}

/** Rota exclusiva de edição (professor/escola). */
export function getCrmLessonEditHref(
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
  mode: CrmLessonEditorMode = "conteudo",
): string {
  const base = `/dashboard/cursos/${courseId}/${moduleSlug}/${lessonSlug}/editar`;
  return mode === "praticar" ? `${base}/praticar` : base;
}

export function getCrmLessonPreviewHref(
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
  mode: CrmLessonEditorMode = "conteudo",
): string {
  const base = `/dashboard/cursos/${courseId}/${moduleSlug}/${lessonSlug}`;
  return mode === "praticar" ? `${base}/praticar/pre-visualizar` : `${base}/pre-visualizar`;
}

export function getCrmCoursePreviewHref(courseId: string): string {
  return `/dashboard/cursos/${courseId}/visualizar`;
}

export function getCrmLessonPreviewPlayerHref(
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
): string {
  return `/dashboard/cursos/${courseId}/visualizar/${moduleSlug}/${lessonSlug}`;
}

export function getCrmLessonPreviewPracticeHref(
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
): string {
  return `/dashboard/cursos/${courseId}/visualizar/${moduleSlug}/${lessonSlug}/praticar`;
}

export function getStudentCourseHref(tenantSlug: string, courseId: string): string {
  return `/${tenantSlug}/cursos/${courseId}`;
}

export function getStudentModuleHref(
  tenantSlug: string,
  courseId: string,
  moduleSlug: string,
): string {
  return `/${tenantSlug}/cursos/${courseId}/${moduleSlug}`;
}

export function getStudentLessonHref(
  tenantSlug: string,
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
): string {
  return `/${tenantSlug}/cursos/${courseId}/${moduleSlug}/${lessonSlug}`;
}

export function getStudentLessonPracticeHref(
  tenantSlug: string,
  courseId: string,
  moduleSlug: string,
  lessonSlug: string,
): string {
  return `/${tenantSlug}/cursos/${courseId}/${moduleSlug}/${lessonSlug}/praticar`;
}

export function getStudentLessonHrefFromLessonId(
  tenantSlug: string,
  courses: Course[],
  courseId: string,
  lessonId: string,
): string | null {
  const ctx = getLessonByIdInCourses(courses, courseId, lessonId);
  if (!ctx) return null;
  return getStudentLessonHref(tenantSlug, courseId, ctx.module.slug, ctx.lesson.slug);
}

const CRM_LESSON_EDIT_PATTERN =
  /^\/dashboard\/cursos\/[^/]+\/[^/]+\/[^/]+\/editar(\/praticar)?$/;
const CRM_LESSON_PLAYER_PATTERN =
  /^\/dashboard\/cursos\/[^/]+\/[^/]+\/[^/]+(\/praticar)?$/;
const CRM_LESSON_PREVIEW_PATTERN =
  /^\/dashboard\/cursos\/[^/]+\/[^/]+\/[^/]+(\/praticar)?\/pre-visualizar$/;
const CRM_LEGACY_LESSON_PATTERN =
  /^\/dashboard\/cursos\/[^/]+\/aulas\/[^/]+(\/praticar)?(\/pre-visualizar)?$/;
const CRM_COURSE_SHELL_PATTERN = /^\/dashboard\/cursos\/([^/]+)(?:\/(.*))?$/;
const RESERVED_COURSE_CHILD_SEGMENTS = new Set(["visualizar", "aulas"]);

export function isCourseEditorShellPath(pathname: string): boolean {
  const match = pathname.match(CRM_COURSE_SHELL_PATTERN);
  if (!match) return false;
  const rest = match[2];
  if (!rest) return true;
  const firstChild = rest.split("/")[0];
  return !RESERVED_COURSE_CHILD_SEGMENTS.has(firstChild);
}

export function isLessonEditorPath(pathname: string): boolean {
  return (
    isCourseEditorShellPath(pathname) &&
    (CRM_LESSON_EDIT_PATTERN.test(pathname) ||
      CRM_LESSON_PREVIEW_PATTERN.test(pathname) ||
      CRM_LEGACY_LESSON_PATTERN.test(pathname))
  );
}
