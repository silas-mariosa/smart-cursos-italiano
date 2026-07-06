import type { StudentProfile } from "./types";

export type CourseAccessBlockReason =
  | "not_enrolled"
  | "account_pending"
  | "account_inactive"
  | "payment_overdue"
  | "plan_cancelled"
  | null;

export function canStudentAccessCourse(student: StudentProfile, courseId: string): boolean {
  return getCourseAccessBlockReason(student, courseId) === null;
}

export function getCourseAccessBlockReason(
  student: StudentProfile,
  courseId: string,
): CourseAccessBlockReason {
  if (student.status === "inactive") return "account_inactive";
  if (student.status === "pending") return "account_pending";
  if (!student.enrollments.some((e) => e.courseId === courseId)) return "not_enrolled";
  if (student.plan?.status === "overdue") return "payment_overdue";
  if (student.plan?.status === "cancelled") return "plan_cancelled";
  return null;
}

export const ACCESS_BLOCK_LABELS: Record<Exclude<CourseAccessBlockReason, null>, string> = {
  not_enrolled: "Você não está matriculado neste curso",
  account_pending: "Seu cadastro ainda está pendente de liberação",
  account_inactive: "Seu acesso está suspenso",
  payment_overdue: "Pagamento pendente — contate a escola",
  plan_cancelled: "Seu plano foi cancelado",
};

export const PLAN_CYCLE_LABELS: Record<"monthly" | "semester" | "yearly", string> = {
  monthly: "Mensal",
  semester: "Semestral",
  yearly: "Anual",
};

export const ACCESS_SOURCE_LABELS: Record<"manual" | "kiwify" | "hotmart", string> = {
  manual: "Manual",
  kiwify: "Kiwify",
  hotmart: "Hotmart",
};
