import type { LiveSession } from "./practice-types";

const STORAGE_KEY = "lms_demo_live_sessions";

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

export const seedLiveSessions: LiveSession[] = [
  {
    id: "live-1",
    tenantId: "tenant-studio-italiano",
    courseId: "course-a1",
    courseTitle: "Italiano A1 — Primeiros passos",
    title: "Conversação: No restaurante",
    description:
      "Aula ao vivo de conversação prática. Vamos simular situações reais no restaurante italiano com participação ativa.",
    instructorName: "Prof. Marco Rossi",
    instructorAvatar: "MR",
    scheduledAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    status: "waiting",
    meetCode: "studio-a1-rest",
    topic: "Al ristorante — Ordinare e pagare il conto",
    lessonId: "lesson-a1-3",
    participants: [
      { id: "p-teacher", name: "Prof. Marco Rossi", avatar: "MR", role: "teacher", isMuted: false, isCameraOn: true, isSpeaking: true },
      { id: "persona-ana", name: "Ana Silva", avatar: "AS", role: "student", isMuted: true, isCameraOn: true },
      { id: "persona-lucas", name: "Lucas Mendes", avatar: "LM", role: "student", isMuted: true, isCameraOn: false },
      { id: "persona-maria", name: "Maria Costa", avatar: "MC", role: "student", isMuted: true, isCameraOn: true },
    ],
  },
  {
    id: "live-2",
    tenantId: "tenant-studio-italiano",
    courseId: "course-a1",
    courseTitle: "Italiano A1 — Primeiros passos",
    title: "Revisão: Saudações e apresentações",
    description: "Revisão coletiva das saudações aprendidas no Módulo 1.",
    instructorName: "Prof. Marco Rossi",
    instructorAvatar: "MR",
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    status: "scheduled",
    meetCode: "studio-a1-ciao",
    topic: "Ciao! Presentazioni",
    lessonId: "lesson-a1-1",
    participants: [
      { id: "p-teacher", name: "Prof. Marco Rossi", avatar: "MR", role: "teacher", isMuted: false, isCameraOn: true },
    ],
  },
];

/** @deprecated Use seedLiveSessions or getStoredLiveSessions */
export const liveSessions = seedLiveSessions;

export function getStoredLiveSessions(): LiveSession[] {
  return readJson(STORAGE_KEY, seedLiveSessions);
}

export function setStoredLiveSessions(sessions: LiveSession[]) {
  writeJson(STORAGE_KEY, sessions);
}

export function getLiveSessionById(id: string): LiveSession | undefined {
  return getStoredLiveSessions().find((s) => s.id === id);
}

export function getUpcomingLiveSessions(): LiveSession[] {
  return getStoredLiveSessions().filter(
    (s) => s.status === "waiting" || s.status === "live" || s.status === "scheduled",
  );
}

export function getActiveLiveSession(): LiveSession | undefined {
  return getStoredLiveSessions().find((s) => s.status === "waiting" || s.status === "live");
}
