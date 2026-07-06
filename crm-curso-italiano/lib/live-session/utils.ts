import type { LiveSession, LiveSessionType } from "@lms-mocks/practice-types";
import { canStudentAccessFeature } from "@lms-mocks/student-plan-access";
import type { StudentPlanTemplate, StudentProfile } from "@lms-mocks/types";

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function defaultScheduleFields(baseDate?: Date) {
  const d = baseDate ? new Date(baseDate) : new Date();
  if (!baseDate) {
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
  }
  return {
    date: toLocalDateInputValue(d),
    time: toLocalTimeInputValue(d),
  };
}

export function toScheduledIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function scheduleFromIso(iso: string) {
  const d = new Date(iso);
  return {
    date: toLocalDateInputValue(d),
    time: toLocalTimeInputValue(d),
  };
}

export function formatSessionSchedule(scheduledAt: string, durationMinutes: number) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  return {
    dateLabel: start.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    timeRangeLabel: `${start.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })} – ${end.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    durationLabel: `${durationMinutes} min`,
    startLabel: start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    endLabel: end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function studentEligibleForLiveSession(
  student: StudentProfile,
  session: Pick<LiveSession, "courseId" | "sessionType">,
): boolean {
  if (student.status === "inactive" || student.status === "pending") return false;
  if (!canStudentAccessFeature(student, "liveParticipation")) return false;
  if (!student.enrollments.some((e) => e.courseId === session.courseId)) return false;
  const live = student.plan?.features?.live;
  if (!live?.enabled) return false;
  return live.classTypes.includes(session.sessionType);
}

export function studentMatchesLiveFilters(
  student: StudentProfile,
  session: Pick<LiveSession, "courseId" | "sessionType">,
  filters: {
    courseId: string | "all";
    sessionType: LiveSessionType | "all";
    planTemplateId: string | "all";
  },
): boolean {
  if (filters.planTemplateId !== "all" && student.planTemplateId !== filters.planTemplateId) {
    return false;
  }

  const typeToCheck = filters.sessionType === "all" ? session.sessionType : filters.sessionType;
  const live = student.plan?.features?.live;
  if (filters.sessionType !== "all" && live && !live.classTypes.includes(filters.sessionType)) {
    return false;
  }

  if (filters.courseId !== "all") {
    if (!student.enrollments.some((e) => e.courseId === filters.courseId)) return false;
    return studentEligibleForLiveSession(student, {
      courseId: filters.courseId,
      sessionType: typeToCheck,
    });
  }

  return student.enrollments.some((e) =>
    studentEligibleForLiveSession(student, { courseId: e.courseId, sessionType: typeToCheck }),
  );
}

export function getPlanLabel(student: StudentProfile, planTemplates: StudentPlanTemplate[]) {
  const tpl = planTemplates.find((t) => t.id === student.planTemplateId);
  return tpl?.name ?? student.plan?.name ?? "Sem plano";
}
