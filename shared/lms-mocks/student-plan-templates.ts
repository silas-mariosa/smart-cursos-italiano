import { defaultStudentPlanFeatures } from "./student-plan-access";
import type { StudentPlanTemplate } from "./types";

export const seedPlanTemplates: StudentPlanTemplate[] = [
  {
    id: "tpl-studio-essencial",
    tenantId: "tenant-studio-italiano",
    name: "Essencial",
    description: "Acesso aos cursos assíncronos.",
    amount: 97.0,
    cycle: "monthly",
    courseIds: ["course-a1"],
    active: true,
    features: defaultStudentPlanFeatures(),
  },
  {
    id: "tpl-studio-intermediario",
    tenantId: "tenant-studio-italiano",
    name: "Intermediário",
    description: "Cursos + banco de questões + simulados.",
    amount: 149.9,
    cycle: "monthly",
    courseIds: ["course-a1", "course-a2"],
    active: true,
    features: defaultStudentPlanFeatures({
      access: {
        liveParticipation: false,
        liveRecordings: false,
        exerciseBank: true,
        mockExams: true,
      },
    }),
  },
  {
    id: "tpl-studio-mensal",
    tenantId: "tenant-studio-italiano",
    name: "Mensal A1+A2",
    amount: 149.9,
    cycle: "monthly",
    courseIds: ["course-a1", "course-a2"],
    active: true,
    features: defaultStudentPlanFeatures({
      access: {
        liveParticipation: false,
        liveRecordings: false,
        exerciseBank: true,
        mockExams: false,
      },
    }),
  },
  {
    id: "tpl-studio-premium",
    tenantId: "tenant-studio-italiano",
    name: "Premium",
    description: "Acesso completo: lives em grupo, gravações, banco e simulados.",
    amount: 249.9,
    cycle: "monthly",
    courseIds: ["course-a1", "course-a2"],
    active: true,
    features: defaultStudentPlanFeatures({
      live: {
        enabled: true,
        classTypes: ["group"],
        sessionsPerCycle: 4,
      },
      access: {
        liveParticipation: true,
        liveRecordings: true,
        exerciseBank: true,
        mockExams: true,
      },
    }),
  },
  {
    id: "tpl-studio-semestral",
    tenantId: "tenant-studio-italiano",
    name: "Semestral A1",
    amount: 799.0,
    cycle: "semester",
    courseIds: ["course-a1"],
    active: true,
    features: defaultStudentPlanFeatures({
      access: {
        liveParticipation: false,
        liveRecordings: true,
        exerciseBank: true,
        mockExams: true,
      },
    }),
  },
  {
    id: "tpl-studio-anual",
    tenantId: "tenant-studio-italiano",
    name: "Anual Premium",
    amount: 1199.0,
    cycle: "yearly",
    courseIds: ["course-a1", "course-a2"],
    active: true,
    features: defaultStudentPlanFeatures({
      live: {
        enabled: true,
        classTypes: ["group", "individual"],
        sessionsPerCycle: null,
      },
      access: {
        liveParticipation: true,
        liveRecordings: true,
        exerciseBank: true,
        mockExams: true,
      },
    }),
  },
  {
    id: "tpl-roma-basico",
    tenantId: "tenant-roma-basica",
    name: "Mensal Básico",
    amount: 97.0,
    cycle: "monthly",
    courseIds: ["course-a1"],
    active: true,
    features: defaultStudentPlanFeatures(),
  },
];

export function getPlanTemplatesForTenant(tenantId: string, templates: StudentPlanTemplate[]) {
  return templates.filter((t) => t.tenantId === tenantId && t.active);
}

export function planFromTemplate(template: StudentPlanTemplate) {
  const months =
    template.cycle === "monthly" ? 1 : template.cycle === "semester" ? 6 : 12;
  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + months);
  return {
    name: template.name,
    amount: template.amount,
    cycle: template.cycle,
    status: "trial" as const,
    nextDueDate: nextDue.toISOString().slice(0, 10),
    features: structuredClone(template.features),
  };
}
