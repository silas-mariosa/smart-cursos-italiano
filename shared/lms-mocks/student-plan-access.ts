import type { CrmModule, StudentPlanFeature, StudentPlanFeatures, StudentProfile, Tenant } from "./types";

export type StudentFeatureBlockReason =
  | "no_plan"
  | "plan_inactive"
  | "payment_overdue"
  | "plan_cancelled"
  | "feature_disabled"
  | "tenant_module_missing"
  | "live_quota_exceeded"
  | null;

export const STUDENT_FEATURE_LABELS: Record<Exclude<StudentPlanFeature, "courses">, string> = {
  liveParticipation: "Participar de lives",
  liveRecordings: "Lives gravadas",
  exerciseBank: "Banco de questões",
  mockExams: "Simulados",
};

const FEATURE_TENANT_MODULE: Partial<Record<Exclude<StudentPlanFeature, "courses">, CrmModule>> = {
  liveParticipation: "live",
  liveRecordings: "live",
  exerciseBank: "exerciseBank",
  mockExams: "mockExams",
};

export function defaultStudentPlanFeatures(
  overrides?: Partial<StudentPlanFeatures>,
): StudentPlanFeatures {
  return {
    live: {
      enabled: false,
      classTypes: [],
      sessionsPerCycle: null,
      ...overrides?.live,
    },
    access: {
      liveParticipation: false,
      liveRecordings: false,
      exerciseBank: false,
      mockExams: false,
      ...overrides?.access,
    },
  };
}

export function tenantSupportsStudentFeature(
  tenantModules: CrmModule[],
  feature: Exclude<StudentPlanFeature, "courses">,
): boolean {
  const required = FEATURE_TENANT_MODULE[feature];
  if (!required) return true;
  return tenantModules.includes(required);
}

export function getStudentPlanFeatures(student: StudentProfile): StudentPlanFeatures | null {
  return student.plan?.features ?? null;
}

export function getFeatureBlockReason(
  student: StudentProfile,
  feature: StudentPlanFeature,
  tenantModules?: CrmModule[],
): StudentFeatureBlockReason {
  if (feature === "courses") return null;

  if (!student.plan) return "no_plan";
  if (student.plan.status === "overdue") return "payment_overdue";
  if (student.plan.status === "cancelled") return "plan_cancelled";

  const features = student.plan.features;
  if (!features) return "feature_disabled";

  if (tenantModules && !tenantSupportsStudentFeature(tenantModules, feature)) {
    return "tenant_module_missing";
  }

  if (feature === "liveParticipation" || feature === "liveRecordings") {
    if (!features.access[feature]) return "feature_disabled";
    if (feature === "liveParticipation" && !features.live.enabled) return "feature_disabled";
    return null;
  }

  if (!features.access[feature]) return "feature_disabled";
  return null;
}

export function canStudentAccessFeature(
  student: StudentProfile,
  feature: StudentPlanFeature,
  tenantModules?: CrmModule[],
): boolean {
  return getFeatureBlockReason(student, feature, tenantModules) === null;
}

export const FEATURE_BLOCK_LABELS: Record<Exclude<StudentFeatureBlockReason, null>, string> = {
  no_plan: "Nenhum plano ativo vinculado à sua conta",
  plan_inactive: "Seu plano está inativo",
  payment_overdue: "Pagamento pendente — contate a escola",
  plan_cancelled: "Seu plano foi cancelado",
  feature_disabled: "Seu plano não inclui este recurso",
  tenant_module_missing: "Recurso indisponível para esta escola",
  live_quota_exceeded: "Limite de aulas ao vivo do plano atingido neste ciclo",
};

export function countLiveSessionsUsedInCycle(
  studentId: string,
  cycleStart: string,
  attendedSessionIds: string[],
): number {
  void studentId;
  void cycleStart;
  return attendedSessionIds.length;
}
