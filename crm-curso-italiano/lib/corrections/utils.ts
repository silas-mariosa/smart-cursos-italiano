import type { WrittenAttempt } from "@lms-mocks/types";

export type CorrectionFilter = "all" | "pending" | "graded";

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "há 1 dia";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function filterAttempts(
  attempts: WrittenAttempt[],
  query: string,
  status: CorrectionFilter,
  courseId: string,
): WrittenAttempt[] {
  const q = query.trim().toLowerCase();
  return attempts
    .filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (courseId !== "all" && a.courseId !== courseId) return false;
      if (!q) return true;
      return (
        a.studentName.toLowerCase().includes(q) ||
        a.courseTitle.toLowerCase().includes(q) ||
        a.lessonTitle.toLowerCase().includes(q) ||
        a.prompt.toLowerCase().includes(q) ||
        a.answer.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function getCorrectionStats(attempts: WrittenAttempt[]) {
  const pending = attempts.filter((a) => a.status === "pending");
  const graded = attempts.filter((a) => a.status === "graded");
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const gradedThisWeek = graded.filter((a) => new Date(a.submittedAt).getTime() >= weekAgo);
  const avgScore =
    graded.length > 0
      ? graded.reduce((sum, a) => sum + (a.score ?? 0), 0) / graded.length
      : null;
  const oldestPending = pending.reduce<string | null>((oldest, a) => {
    if (!oldest) return a.submittedAt;
    return new Date(a.submittedAt) < new Date(oldest) ? a.submittedAt : oldest;
  }, null);

  return {
    pendingCount: pending.length,
    gradedCount: graded.length,
    gradedThisWeek: gradedThisWeek.length,
    avgScore,
    oldestPending,
    total: attempts.length,
  };
}
