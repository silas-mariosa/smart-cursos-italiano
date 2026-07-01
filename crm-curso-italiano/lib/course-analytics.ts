import type { Course, Grade, StudentEnrollment, StudentProfile } from "@lms-mocks/types";
import { countLessons } from "@lms-mocks/courses";

export interface CourseStudentMetrics {
  student: StudentProfile;
  enrollment: StudentEnrollment;
  accuracyPercent: number | null;
  watchMinutes: number;
  exercisesDone: number;
  lastActivity: string;
}

export interface CourseAnalytics {
  courseId: string;
  enrolledCount: number;
  avgProgressPercent: number;
  avgAccuracyPercent: number | null;
  avgWatchMinutes: number;
  totalWatchMinutes: number;
  students: CourseStudentMetrics[];
  totalLessons: number;
  publishedLessons: number;
  totalDurationMinutes: number;
}

const LAST_ACTIVITY: Record<string, string> = {
  "persona-ana:course-a1": "há 2h",
  "persona-lucas:course-a1": "há 4h",
  "persona-maria:course-a1": "há 1d",
  "persona-ana:course-a2": "há 3d",
};

function getCourseTotalDuration(course: Course): number {
  return course.modules.flatMap((m) => m.lessons).reduce((sum, l) => sum + l.durationMinutes, 0);
}

function getPublishedLessons(course: Course): number {
  return course.modules.flatMap((m) => m.lessons).filter((l) => l.status === "published").length;
}

function estimateWatchMinutes(enrollment: StudentEnrollment, course: Course): number {
  let minutes = enrollment.completedLessonIds.reduce((sum, id) => {
    const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === id);
    return sum + (lesson?.durationMinutes ?? 0);
  }, 0);

  if (enrollment.lastLessonId && !enrollment.completedLessonIds.includes(enrollment.lastLessonId)) {
    const last = course.modules.flatMap((m) => m.lessons).find((l) => l.id === enrollment.lastLessonId);
    minutes += Math.round((last?.durationMinutes ?? 0) * 0.6);
  }

  const totalDuration = getCourseTotalDuration(course);
  const fromProgress = Math.round((totalDuration * enrollment.progressPercent) / 100);
  return Math.max(minutes, fromProgress);
}

function getStudentAccuracy(studentId: string, courseId: string, grades: Grade[]): number | null {
  const courseGrades = grades.filter((g) => g.studentId === studentId && g.courseId === courseId);
  if (courseGrades.length === 0) return null;
  const total = courseGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0);
  return Math.round(total / courseGrades.length);
}

export function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function getCourseAnalytics(
  course: Course,
  students: StudentProfile[],
  grades: Grade[],
): CourseAnalytics {
  const enrolled = students
    .map((student) => {
      const enrollment = student.enrollments.find((e) => e.courseId === course.id);
      if (!enrollment) return null;
      return {
        student,
        enrollment,
        accuracyPercent: getStudentAccuracy(student.id, course.id, grades),
        watchMinutes: estimateWatchMinutes(enrollment, course),
        exercisesDone: grades.filter((g) => g.studentId === student.id && g.courseId === course.id).length,
        lastActivity: LAST_ACTIVITY[`${student.id}:${course.id}`] ?? "há 3d",
      } satisfies CourseStudentMetrics;
    })
    .filter((row): row is CourseStudentMetrics => row !== null);

  const avgProgress =
    enrolled.length > 0
      ? Math.round(enrolled.reduce((sum, s) => sum + s.enrollment.progressPercent, 0) / enrolled.length)
      : 0;

  const withAccuracy = enrolled.filter((s) => s.accuracyPercent !== null);
  const avgAccuracy =
    withAccuracy.length > 0
      ? Math.round(withAccuracy.reduce((sum, s) => sum + (s.accuracyPercent ?? 0), 0) / withAccuracy.length)
      : null;

  const totalWatch = enrolled.reduce((sum, s) => sum + s.watchMinutes, 0);
  const avgWatch = enrolled.length > 0 ? Math.round(totalWatch / enrolled.length) : 0;

  return {
    courseId: course.id,
    enrolledCount: enrolled.length,
    avgProgressPercent: avgProgress,
    avgAccuracyPercent: avgAccuracy,
    avgWatchMinutes: avgWatch,
    totalWatchMinutes: totalWatch,
    students: enrolled,
    totalLessons: countLessons(course),
    publishedLessons: getPublishedLessons(course),
    totalDurationMinutes: getCourseTotalDuration(course),
  };
}
