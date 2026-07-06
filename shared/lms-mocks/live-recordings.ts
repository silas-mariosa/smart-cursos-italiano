import type { LiveRecording } from "./practice-types";

const STORAGE_KEY = "lms_demo_live_recordings";

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

export const seedLiveRecordings: LiveRecording[] = [
  {
    id: "rec-lib-1",
    tenantId: "tenant-studio-italiano",
    title: "Workshop: Pronúncia italiana",
    description: "Gravação de workshop aberto sobre sons difíceis do italiano.",
    courseId: "course-a1",
    courseTitle: "Italiano A1 — Primeiros passos",
    videoUrl: "https://example.com/videos/pronuncia",
    durationMinutes: 52,
    published: true,
    source: "library",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getStoredLiveRecordings(): LiveRecording[] {
  return readJson(STORAGE_KEY, seedLiveRecordings);
}

export function setStoredLiveRecordings(recordings: LiveRecording[]) {
  writeJson(STORAGE_KEY, recordings);
}

export function getPublishedRecordingsForTenant(tenantId: string): LiveRecording[] {
  return getStoredLiveRecordings().filter((r) => r.tenantId === tenantId && r.published);
}
