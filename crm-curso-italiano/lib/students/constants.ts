import type { StudentPlanStatus, StudentStatus } from "@lms-mocks/types";

export const STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Pendente",
};

export const STATUS_COLORS: Record<StudentStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-800",
};

export const PLAN_STATUS_LABELS: Record<StudentPlanStatus, string> = {
  active: "Em dia",
  overdue: "Inadimplente",
  trial: "Trial",
  cancelled: "Cancelado",
};

export const PLAN_STATUS_COLORS: Record<StudentPlanStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  trial: "bg-blue-100 text-blue-800",
  cancelled: "bg-slate-100 text-slate-600",
};

export const HISTORY_TYPE_LABELS = {
  lesson: "Aula",
  exercise: "Exercício",
  payment: "Pagamento",
  enrollment: "Matrícula",
  certificate: "Certificado",
  login: "Acesso",
} as const;
