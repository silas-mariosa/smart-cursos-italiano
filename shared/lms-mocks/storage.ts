import type { Course, Grade, Tenant, WrittenAttempt } from "./types";
import type { LessonPracticeSettings } from "./lesson-practice-types";
import { courses as seedCourses } from "./courses";
import { defaultTenant } from "./tenant";
import { initialGrades, initialWrittenAttempts, studentProfiles as seedStudents } from "./students";
import { exercises as seedExercises } from "./exercises";

const STORAGE_KEYS = {
  tenant: "lms_demo_tenant",
  courses: "lms_demo_courses",
  attempts: "lms_demo_attempts",
  grades: "lms_demo_grades",
  progress: (personaId: string) => `lms_demo_progress_${personaId}`,
  persona: "lms_demo_persona",
  crmPersona: "lms_demo_crm_persona",
  lessonPractice: "lms_demo_lesson_practice",
  exercises: "lms_demo_exercises",
  students: "lms_demo_students",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredTenant(): Tenant {
  return readJson(STORAGE_KEYS.tenant, defaultTenant);
}

export function setStoredTenant(tenant: Tenant) {
  writeJson(STORAGE_KEYS.tenant, tenant);
}

export function getStoredCourses(): Course[] {
  return readJson(STORAGE_KEYS.courses, seedCourses);
}

export function setStoredCourses(courses: Course[]) {
  writeJson(STORAGE_KEYS.courses, courses);
}

export function resetCoursesToSeed() {
  writeJson(STORAGE_KEYS.courses, seedCourses);
}

export function getStoredAttempts(): WrittenAttempt[] {
  return readJson(STORAGE_KEYS.attempts, initialWrittenAttempts);
}

export function setStoredAttempts(attempts: WrittenAttempt[]) {
  writeJson(STORAGE_KEYS.attempts, attempts);
}

export function getStoredGrades(): Grade[] {
  return readJson(STORAGE_KEYS.grades, initialGrades);
}

export function setStoredGrades(grades: Grade[]) {
  writeJson(STORAGE_KEYS.grades, grades);
}

export interface StoredProgress {
  completedLessonIds: string[];
  lastLessonId: string | null;
}

export function getStoredProgress(personaId: string, fallback: StoredProgress): StoredProgress {
  return readJson(STORAGE_KEYS.progress(personaId), fallback);
}

export function setStoredProgress(personaId: string, progress: StoredProgress) {
  writeJson(STORAGE_KEYS.progress(personaId), progress);
}

export function getStoredPersonaId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEYS.persona);
}

export function setStoredPersonaId(id: string) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.persona, id);
}

export function clearStoredPersonaId() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.persona);
}

export function getStoredCrmPersonaId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEYS.crmPersona);
}

export function setStoredCrmPersonaId(id: string) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.crmPersona, id);
}

export function clearStoredCrmPersonaId() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.crmPersona);
}

export function getSeedExercises() {
  return seedExercises;
}

export function getStoredExercises() {
  return readJson(STORAGE_KEYS.exercises, seedExercises);
}

export function setStoredExercises(exercises: typeof seedExercises) {
  writeJson(STORAGE_KEYS.exercises, exercises);
}

export function getStoredStudents() {
  return readJson(STORAGE_KEYS.students, seedStudents);
}

export function setStoredStudents(students: typeof seedStudents) {
  writeJson(STORAGE_KEYS.students, students);
}

export type StoredLessonPracticeMap = Record<string, LessonPracticeSettings>;

export function getStoredLessonPracticeMap(): StoredLessonPracticeMap {
  return readJson(STORAGE_KEYS.lessonPractice, {});
}

export function setStoredLessonPracticeMap(map: StoredLessonPracticeMap) {
  writeJson(STORAGE_KEYS.lessonPractice, map);
}

export function setStoredLessonPractice(settings: LessonPracticeSettings) {
  const map = getStoredLessonPracticeMap();
  map[settings.lessonId] = settings;
  setStoredLessonPracticeMap(map);
}

export { STORAGE_KEYS };
