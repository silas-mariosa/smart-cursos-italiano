import type { MockExam, MockExamAttempt } from "./mock-exam-types";

const EXAMS_KEY = "lms_demo_mock_exams";
const ATTEMPTS_KEY = "lms_demo_mock_exam_attempts";

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

export const seedMockExams: MockExam[] = [
  {
    id: "mock-a1-diagnostico",
    tenantId: "tenant-studio-italiano",
    title: "Simulado diagnóstico A1",
    description: "Avaliação inicial de vocabulário e gramática básica.",
    status: "published",
    durationMinutes: 30,
    passingScorePercent: 60,
    shuffleQuestions: true,
    showResultsAfter: "immediate",
    questionIds: ["MC-001", "MC-002", "TF-001"],
    tags: ["A1", "diagnóstico"],
    courseId: "course-a1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-a2-prova",
    tenantId: "tenant-studio-italiano",
    title: "Simulado A2 — Passato prossimo",
    description: "Foco em tempo verbal e conjugação.",
    status: "published",
    durationMinutes: 45,
    passingScorePercent: 70,
    shuffleQuestions: false,
    showResultsAfter: "immediate",
    questionIds: ["MC-001", "FB-001"],
    tags: ["A2", "gramática"],
    courseId: "course-a2",
    planTemplateIds: ["tpl-studio-intermediario", "tpl-studio-premium", "tpl-studio-anual"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedMockExamAttempts: MockExamAttempt[] = [
  {
    id: "attempt-1",
    mockExamId: "mock-a1-diagnostico",
    studentId: "persona-ana",
    studentName: "Ana Silva",
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString(),
    scorePercent: 78,
    passed: true,
    status: "submitted",
    answers: [
      { exerciseId: "MC-001", selected: "a", correct: true, timeSpentSec: 45 },
      { exerciseId: "MC-002", selected: "b", correct: false, timeSpentSec: 62 },
      { exerciseId: "TF-001", selected: true, correct: true, timeSpentSec: 30 },
    ],
  },
  {
    id: "attempt-2",
    mockExamId: "mock-a1-diagnostico",
    studentId: "persona-lucas",
    studentName: "Lucas Mendes",
    startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
    scorePercent: 55,
    passed: false,
    status: "submitted",
    answers: [
      { exerciseId: "MC-001", selected: "c", correct: false, timeSpentSec: 90 },
      { exerciseId: "MC-002", selected: "a", correct: true, timeSpentSec: 55 },
      { exerciseId: "TF-001", selected: false, correct: false, timeSpentSec: 40 },
    ],
  },
];

export function getStoredMockExams(): MockExam[] {
  return readJson(EXAMS_KEY, seedMockExams);
}

export function setStoredMockExams(exams: MockExam[]) {
  writeJson(EXAMS_KEY, exams);
}

export function getStoredMockExamAttempts(): MockExamAttempt[] {
  return readJson(ATTEMPTS_KEY, seedMockExamAttempts);
}

export function setStoredMockExamAttempts(attempts: MockExamAttempt[]) {
  writeJson(ATTEMPTS_KEY, attempts);
}

export function getMockExamById(id: string): MockExam | undefined {
  return getStoredMockExams().find((e) => e.id === id);
}

export function getPublishedMockExamsForTenant(tenantId: string): MockExam[] {
  return getStoredMockExams().filter((e) => e.tenantId === tenantId && e.status === "published");
}
