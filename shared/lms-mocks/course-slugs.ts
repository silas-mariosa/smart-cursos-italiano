import type { Course, CourseModule, Lesson } from "./types";

export function slugifyCoursePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base || "item";
  let i = 2;
  while (used.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  used.add(slug);
  return slug;
}

export function normalizeCourseSlugs(course: Course): Course {
  const usedModuleSlugs = new Set<string>();
  const modules = course.modules.map((mod, modIndex) => {
    const moduleSlug = uniqueSlug(
      mod.slug?.trim() || slugifyCoursePart(mod.title) || `modulo-${modIndex + 1}`,
      usedModuleSlugs,
    );
    const usedLessonSlugs = new Set<string>();
    const lessons = mod.lessons.map((lesson, lessonIndex) => {
      const lessonSlug = uniqueSlug(
        lesson.slug?.trim() || slugifyCoursePart(lesson.title) || `aula-${lessonIndex + 1}`,
        usedLessonSlugs,
      );
      return { ...lesson, slug: lessonSlug, moduleId: mod.id };
    });
    return {
      ...mod,
      slug: moduleSlug,
      courseId: course.id,
      order: mod.order ?? modIndex + 1,
      lessons,
    };
  });
  return { ...course, modules };
}

export function normalizeCourses(courses: Course[]): Course[] {
  return courses.map(normalizeCourseSlugs);
}

export type LessonContext = {
  course: Course;
  module: CourseModule;
  lesson: Lesson;
};

export function getModuleBySlug(course: Course, moduleSlug: string): CourseModule | undefined {
  return course.modules.find((m) => m.slug === moduleSlug || m.id === moduleSlug);
}

export function getLessonBySlugs(
  course: Course,
  moduleSlug: string,
  lessonSlug: string,
): LessonContext | undefined {
  const module = getModuleBySlug(course, moduleSlug);
  if (!module) return undefined;
  const lesson = module.lessons.find((l) => l.slug === lessonSlug || l.id === lessonSlug);
  if (!lesson) return undefined;
  return { course, module, lesson };
}

export function getLessonByIdInCourses(
  courses: Course[],
  courseId: string,
  lessonId: string,
): LessonContext | undefined {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return undefined;
  for (const module of course.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, module, lesson };
  }
  return undefined;
}

export function getLessonById(courseId: string, lessonId: string, courses?: Course[]): LessonContext | undefined {
  if (courses) return getLessonByIdInCourses(courses, courseId, lessonId);
  return undefined;
}
