export function isCourseImmersivePath(pathname: string): boolean {
  return /^\/[^/]+\/cursos\/[^/]+/.test(pathname);
}

export function getCourseImmersiveBack(
  pathname: string,
): { href: string; label: string } | null {
  if (!isCourseImmersivePath(pathname)) return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 3 || segments[1] !== "cursos") return null;

  const tenant = segments[0];
  const courseId = segments[2];
  const rest = segments.slice(3);

  if (rest.length === 0) {
    return { href: `/${tenant}/dashboard`, label: "Dashboard" };
  }

  if (rest[0] === "aulas") {
    return { href: `/${tenant}/dashboard`, label: "Dashboard" };
  }

  const courseHref = `/${tenant}/cursos/${courseId}`;

  if (rest.length === 3 && rest[2] === "praticar") {
    return {
      href: `/${tenant}/cursos/${courseId}/${rest[0]}/${rest[1]}`,
      label: "Voltar à aula",
    };
  }

  return { href: courseHref, label: "Voltar ao curso" };
}
