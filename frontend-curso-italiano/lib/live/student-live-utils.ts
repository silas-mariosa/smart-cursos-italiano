import type { LiveRecording, LiveSession } from "@lms-mocks/practice-types";
import type { StudentProfile } from "@lms-mocks/types";

const LIVE_STATUS_ORDER: Record<LiveSession["status"], number> = {
  live: 0,
  waiting: 1,
  scheduled: 2,
  ended: 3,
};

export function studentEnrolledCourseIds(profile: StudentProfile | null): string[] {
  if (!profile) return [];
  return profile.enrollments.map((e) => e.courseId);
}

export function studentIsSessionParticipant(session: LiveSession, studentId: string | undefined): boolean {
  if (!studentId) return false;
  return session.participants.some((p) => p.id === studentId && p.role === "student");
}

export function studentCanSeeLiveSession(
  session: LiveSession,
  tenantId: string,
  studentId: string | undefined,
  enrolledCourseIds: string[],
): boolean {
  if (session.tenantId !== tenantId) return false;
  if (studentIsSessionParticipant(session, studentId)) return true;
  if (session.sessionType === "group" && enrolledCourseIds.includes(session.courseId)) return true;
  return false;
}

export function filterStudentLiveSessions(
  sessions: LiveSession[],
  tenantId: string,
  studentId: string | undefined,
  enrolledCourseIds: string[],
): LiveSession[] {
  return sessions
    .filter(
      (s) =>
        (s.status === "waiting" || s.status === "live" || s.status === "scheduled") &&
        studentCanSeeLiveSession(s, tenantId, studentId, enrolledCourseIds),
    )
    .sort((a, b) => {
      const statusDiff = LIVE_STATUS_ORDER[a.status] - LIVE_STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
}

export function filterStudentSessionReplays(
  sessions: LiveSession[],
  tenantId: string,
  studentId: string | undefined,
  enrolledCourseIds: string[],
): LiveSession[] {
  return sessions
    .filter(
      (s) =>
        s.tenantId === tenantId &&
        s.status === "ended" &&
        s.recordingPublished &&
        Boolean(s.recordingUrl) &&
        (studentIsSessionParticipant(s, studentId) ||
          (s.sessionType === "group" && enrolledCourseIds.includes(s.courseId))),
    )
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

export function filterStudentLibraryRecordings(
  recordings: LiveRecording[],
  tenantId: string,
  enrolledCourseIds: string[],
): LiveRecording[] {
  return recordings
    .filter(
      (r) =>
        r.tenantId === tenantId &&
        r.published &&
        (!r.courseId || enrolledCourseIds.length === 0 || enrolledCourseIds.includes(r.courseId)),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getLiveSessionJoinHref(tenantSlug: string, session: LiveSession): string {
  if (session.status === "live") {
    return `/${tenantSlug}/ao-vivo/${session.id}/sala`;
  }
  return `/${tenantSlug}/ao-vivo/${session.id}`;
}

export function formatLiveSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatLiveSessionTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
