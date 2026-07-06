import type { Course, CourseLevel, CourseStatus } from "@lms-mocks/types";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";

export type PracticeFilter = "all" | "with-practice" | "without-practice";
export type PracticeViewMode = "grouped" | "table";
export type PracticeSortField = "course" | "lesson" | "items" | "coverage";

export interface PracticeLessonRow {
  courseId: string;
  courseTitle: string;
  courseLevel: CourseLevel;
  courseStatus: CourseStatus;
  moduleTitle: string;
  moduleSlug: string;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  exCount: number;
  fcCount: number;
  simCount: number;
  totalItems: number;
  hasPractice: boolean;
  activeModules: number;
}

export interface PracticeCourseGroup {
  courseId: string;
  courseTitle: string;
  courseLevel: CourseLevel;
  courseStatus: CourseStatus;
  lessons: PracticeLessonRow[];
  lessonsTotal: number;
  lessonsWithPractice: number;
  coverage: number;
}

export interface PracticeHubFilters {
  search: string;
  practiceFilter: PracticeFilter;
  levelFilter: CourseLevel | "all";
  statusFilter: CourseStatus | "all";
  sortField: PracticeSortField;
  sortAsc: boolean;
}

export interface PracticeMetrics {
  lessonsTotal: number;
  lessonsWithPractice: number;
  quizzes: number;
  flashcards: number;
  scenarios: number;
  coverage: number;
}

export function buildPracticeLessonRows(courses: Course[]): PracticeLessonRow[] {
  const rows: PracticeLessonRow[] = [];

  for (const course of courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        const settings = resolveLessonPractice(lesson.id);
        const exCount = getLessonExerciseIds(lesson).length;
        const fcCount = getFlashcardsByLesson(lesson.id).length;
        const simCount = getSimulatorByLesson(lesson.id).length;
        const totalItems = exCount + fcCount + simCount;
        const hasPractice = totalItems > 0;
        const activeModules = [
          settings.modules.quizzes.enabled && exCount > 0,
          settings.modules.flashcards.enabled && fcCount > 0,
          settings.modules.simulator.enabled && simCount > 0,
        ].filter(Boolean).length;

        rows.push({
          courseId: course.id,
          courseTitle: course.title,
          courseLevel: course.level,
          courseStatus: course.status,
          moduleTitle: mod.title,
          moduleSlug: mod.slug,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonSlug: lesson.slug,
          exCount,
          fcCount,
          simCount,
          totalItems,
          hasPractice,
          activeModules,
        });
      }
    }
  }

  return rows;
}

export function computePracticeMetrics(courses: Course[]): PracticeMetrics {
  const rows = buildPracticeLessonRows(courses);
  const lessonsWithPractice = rows.filter((r) => r.hasPractice).length;

  return {
    lessonsTotal: rows.length,
    lessonsWithPractice,
    quizzes: rows.reduce((sum, r) => sum + r.exCount, 0),
    flashcards: rows.reduce((sum, r) => sum + r.fcCount, 0),
    scenarios: rows.reduce((sum, r) => sum + r.simCount, 0),
    coverage: rows.length > 0 ? Math.round((lessonsWithPractice / rows.length) * 100) : 0,
  };
}

function matchesSearch(row: PracticeLessonRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    row.courseTitle,
    row.moduleTitle,
    row.lessonTitle,
    row.courseLevel,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function filterPracticeRows(
  rows: PracticeLessonRow[],
  filters: PracticeHubFilters,
): PracticeLessonRow[] {
  const query = filters.search.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    if (filters.practiceFilter === "with-practice" && !row.hasPractice) return false;
    if (filters.practiceFilter === "without-practice" && row.hasPractice) return false;
    if (filters.levelFilter !== "all" && row.courseLevel !== filters.levelFilter) return false;
    if (filters.statusFilter !== "all" && row.courseStatus !== filters.statusFilter) return false;
    if (!matchesSearch(row, query)) return false;
    return true;
  });

  return sortPracticeRows(filtered, filters.sortField, filters.sortAsc);
}

function sortPracticeRows(
  rows: PracticeLessonRow[],
  field: PracticeSortField,
  asc: boolean,
): PracticeLessonRow[] {
  const direction = asc ? 1 : -1;

  return [...rows].sort((a, b) => {
    switch (field) {
      case "course":
        return direction * a.courseTitle.localeCompare(b.courseTitle, "pt-BR");
      case "lesson":
        return direction * a.lessonTitle.localeCompare(b.lessonTitle, "pt-BR");
      case "items":
        return direction * (a.totalItems - b.totalItems);
      case "coverage": {
        const aHas = a.hasPractice ? 1 : 0;
        const bHas = b.hasPractice ? 1 : 0;
        return direction * (aHas - bHas);
      }
      default:
        return 0;
    }
  });
}

export function groupPracticeRowsByCourse(rows: PracticeLessonRow[]): PracticeCourseGroup[] {
  const map = new Map<string, PracticeCourseGroup>();

  for (const row of rows) {
    const existing = map.get(row.courseId);
    if (existing) {
      existing.lessons.push(row);
      existing.lessonsTotal += 1;
      if (row.hasPractice) existing.lessonsWithPractice += 1;
    } else {
      map.set(row.courseId, {
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        courseLevel: row.courseLevel,
        courseStatus: row.courseStatus,
        lessons: [row],
        lessonsTotal: 1,
        lessonsWithPractice: row.hasPractice ? 1 : 0,
        coverage: 0,
      });
    }
  }

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      coverage:
        group.lessonsTotal > 0
          ? Math.round((group.lessonsWithPractice / group.lessonsTotal) * 100)
          : 0,
    }))
    .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle, "pt-BR"));
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}
