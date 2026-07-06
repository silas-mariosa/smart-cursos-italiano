import type { Course, Grade, StudentPlanTemplate, SupportConversation, Tenant, TenantAiConfig, WebhookEvent, WrittenAttempt } from "./types";
import type { LessonPracticeSettings } from "./lesson-practice-types";
import { courses as seedCourses } from "./courses";
import { normalizeCourses } from "./course-slugs";
import { defaultTenant, getDemoTenant } from "./tenant";
import { initialGrades, initialWrittenAttempts, studentProfiles as seedStudents } from "./students";
import { exercises as seedExercises } from "./exercises";
import { seedPlanTemplates } from "./student-plan-templates";
import { seedSupportConversations } from "./support-conversations";
import { seedWebhookEvents } from "./integrations";
const STORAGE_KEYS = {
  tenant: "lms_demo_tenant",
  tenants: "lms_demo_tenants",
  courses: "lms_demo_courses",
  attempts: "lms_demo_attempts",
  grades: "lms_demo_grades",
  progress: (personaId: string) => `lms_demo_progress_${personaId}`,
  persona: "lms_demo_persona",
  crmPersona: "lms_demo_crm_persona",
  lessonPractice: "lms_demo_lesson_practice",
  exercises: "lms_demo_exercises",
  students: "lms_demo_students",
  planTemplates: "lms_demo_plan_templates",
  supportConversations: "lms_demo_support_conversations",
  webhookEvents: "lms_demo_webhook_events",
  aiConfig: (tenantId: string) => `lms_demo_ai_config_${tenantId}`,
} as const;

export const DEFAULT_TENANT_AI_CONFIG: TenantAiConfig = {
  enabled: false,
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  lastValidatedAt: null,
};

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

export function getStoredTenantForId(tenantId: string): Tenant {
  const seed = getDemoTenant(tenantId) ?? defaultTenant;
  const map = readJson<Record<string, Partial<Tenant>>>(STORAGE_KEYS.tenants, {});
  const overrides = map[tenantId];
  if (!overrides) return seed;
  return {
    ...seed,
    ...overrides,
    subscription: overrides.subscription ?? seed.subscription,
  };
}

export function setStoredTenantForId(tenant: Tenant) {
  const map = readJson<Record<string, Partial<Tenant>>>(STORAGE_KEYS.tenants, {});
  map[tenant.id] = tenant;
  writeJson(STORAGE_KEYS.tenants, map);
}

export function getStoredTenant(): Tenant {
  const legacy = readJson<Tenant | null>(STORAGE_KEYS.tenant, null);
  if (legacy?.id && legacy.subscription) {
    return getStoredTenantForId(legacy.id);
  }
  return getStoredTenantForId(defaultTenant.id);
}

export function setStoredTenant(tenant: Tenant) {
  setStoredTenantForId(tenant);
  writeJson(STORAGE_KEYS.tenant, { id: tenant.id });
}

export function getStoredCourses(): Course[] {
  return normalizeCourses(readJson(STORAGE_KEYS.courses, seedCourses));
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

export function getStoredPlanTemplates() {
  return readJson(STORAGE_KEYS.planTemplates, seedPlanTemplates);
}

export function setStoredPlanTemplates(templates: StudentPlanTemplate[]) {
  writeJson(STORAGE_KEYS.planTemplates, templates);
}

export function getStoredSupportConversations() {
  return readJson(STORAGE_KEYS.supportConversations, seedSupportConversations);
}

export function setStoredSupportConversations(conversations: SupportConversation[]) {
  writeJson(STORAGE_KEYS.supportConversations, conversations);
}

export function getStoredWebhookEvents() {
  return readJson(STORAGE_KEYS.webhookEvents, seedWebhookEvents);
}

export function setStoredWebhookEvents(events: WebhookEvent[]) {
  writeJson(STORAGE_KEYS.webhookEvents, events);
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

export function getStoredAiConfig(tenantId: string): TenantAiConfig {
  return readJson(STORAGE_KEYS.aiConfig(tenantId), DEFAULT_TENANT_AI_CONFIG);
}

export function setStoredAiConfig(tenantId: string, config: TenantAiConfig) {
  writeJson(STORAGE_KEYS.aiConfig(tenantId), config);
}

export { STORAGE_KEYS };
