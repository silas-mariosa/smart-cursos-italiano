import type { BusinessPlanTier, CrmModule } from "./types";

export interface BusinessPlanDefinition {
  tier: BusinessPlanTier;
  label: string;
  description: string;
  priceMonthly: number | null;
  maxStudents: number | null;
  maxCourses: number | null;
  modules: CrmModule[];
}

export const BUSINESS_PLANS: Record<BusinessPlanTier, BusinessPlanDefinition> = {
  basic: {
    tier: "basic",
    label: "Básico",
    description: "Essencial para professores autônomos iniciando online.",
    priceMonthly: 97,
    maxStudents: 25,
    maxCourses: 3,
    modules: ["overview", "courses", "students"],
  },
  basic_plus: {
    tier: "basic_plus",
    label: "Básico+",
    description: "Prática e correções para escolas em crescimento.",
    priceMonthly: 197,
    maxStudents: 50,
    maxCourses: 8,
    modules: ["overview", "courses", "students", "practice", "corrections"],
  },
  pro: {
    tier: "pro",
    label: "Pro",
    description: "Ao vivo e banco de questões para operação completa.",
    priceMonthly: 397,
    maxStudents: 150,
    maxCourses: 20,
    modules: [
      "overview",
      "courses",
      "students",
      "practice",
      "corrections",
      "live",
      "exerciseBank",
    ],
  },
  enterprise: {
    tier: "enterprise",
    label: "Enterprise",
    description: "Recursos ilimitados e branding personalizado.",
    priceMonthly: 997,
    maxStudents: null,
    maxCourses: null,
    modules: [
      "overview",
      "courses",
      "students",
      "practice",
      "corrections",
      "live",
      "exerciseBank",
      "branding",
    ],
  },
  custom: {
    tier: "custom",
    label: "Personalizado",
    description: "Limites e módulos negociados sob medida.",
    priceMonthly: null,
    maxStudents: null,
    maxCourses: null,
    modules: [
      "overview",
      "courses",
      "students",
      "practice",
      "corrections",
      "live",
      "exerciseBank",
      "branding",
    ],
  },
};

export const CRM_MODULE_LABELS: Record<CrmModule, string> = {
  overview: "Visão geral",
  courses: "Meus cursos",
  live: "Ao vivo",
  practice: "Prática",
  exerciseBank: "Banco de questões",
  corrections: "Correções",
  students: "Alunos",
  branding: "Configuração / Branding",
};

export function getPlanDefinition(tier: BusinessPlanTier): BusinessPlanDefinition {
  return BUSINESS_PLANS[tier];
}
