export const COURSE_EDITOR_MOBILE_TITLE = "Edição disponível apenas em telas maiores";

export const COURSE_EDITOR_MOBILE_DESCRIPTION =
  "O sistema de edição de cursos funciona apenas em desktops e telas maiores. Use um computador para criar e editar aulas, conteúdo e prática.";

export function isCourseLessonEditRoute(pathname: string): boolean {
  return (
    /^\/dashboard\/cursos\/[^/]+\/[^/]+\/[^/]+\/editar(\/praticar)?$/.test(pathname) ||
    /^\/dashboard\/cursos\/[^/]+\/[^/]+\/[^/]+\/praticar\/editar$/.test(pathname)
  );
}
