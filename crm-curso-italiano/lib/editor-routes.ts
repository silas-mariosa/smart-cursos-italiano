const LESSON_EDITOR_PATTERN = /^\/dashboard\/cursos\/[^/]+\/aulas\/[^/]+(\/praticar)?$/;
const LESSON_PREVIEW_PATTERN = /^\/dashboard\/cursos\/[^/]+\/aulas\/[^/]+(\/praticar)?\/pre-visualizar$/;

export function isLessonEditorPath(pathname: string): boolean {
  return LESSON_EDITOR_PATTERN.test(pathname) || LESSON_PREVIEW_PATTERN.test(pathname);
}

export function getLessonEditorHref(
  courseId: string,
  lessonId: string,
  mode: "conteudo" | "praticar" = "conteudo",
): string {
  const base = `/dashboard/cursos/${courseId}/aulas/${lessonId}`;
  return mode === "praticar" ? `${base}/praticar` : base;
}

export function getLessonPreviewHref(
  courseId: string,
  lessonId: string,
  mode: "conteudo" | "praticar" = "conteudo",
): string {
  const base = `/dashboard/cursos/${courseId}/aulas/${lessonId}`;
  return mode === "praticar" ? `${base}/praticar/pre-visualizar` : `${base}/pre-visualizar`;
}
