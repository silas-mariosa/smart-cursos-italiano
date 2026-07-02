import type { BusinessPlanDefinition } from "@lms-mocks/business-plans";
import { BUSINESS_PLANS, getPlanDefinition } from "@lms-mocks/business-plans";
import type { CrmModule, Tenant } from "@lms-mocks/types";

export type ResolvedTenantPlan = BusinessPlanDefinition & {
  label: string;
  maxStudents: number | null;
  maxCourses: number | null;
  modules: CrmModule[];
  subscriptionStatus: Tenant["subscription"]["status"];
  nextBillingDate: string;
  startedAt: string;
};

export function resolveTenantPlan(tenant: Tenant): ResolvedTenantPlan {
  const base = getPlanDefinition(tenant.subscription.tier);
  const customLabel =
    tenant.subscription.tier === "custom" && tenant.subscription.customLabel
      ? tenant.subscription.customLabel
      : base.label;

  return {
    ...base,
    label: customLabel,
    maxStudents: tenant.subscription.maxStudents ?? base.maxStudents,
    maxCourses: tenant.subscription.maxCourses ?? base.maxCourses,
    modules: tenant.subscription.modules ?? base.modules,
    subscriptionStatus: tenant.subscription.status,
    nextBillingDate: tenant.subscription.nextBillingDate,
    startedAt: tenant.subscription.startedAt,
  };
}

export function canAccessModule(tenant: Tenant, module: CrmModule): boolean {
  const plan = resolveTenantPlan(tenant);
  if (plan.subscriptionStatus === "expired") {
    return module === "overview";
  }
  return plan.modules.includes(module);
}

export function canAddStudent(tenant: Tenant, currentCount: number): boolean {
  const { maxStudents, subscriptionStatus } = resolveTenantPlan(tenant);
  if (subscriptionStatus === "expired") return false;
  if (maxStudents === null) return true;
  return currentCount < maxStudents;
}

export function getStudentLimitMessage(tenant: Tenant, currentCount: number): string | null {
  const plan = resolveTenantPlan(tenant);
  if (plan.subscriptionStatus === "expired") {
    return "Seu plano expirou. Renove para cadastrar novos alunos.";
  }
  if (plan.maxStudents === null) return null;
  if (currentCount >= plan.maxStudents) {
    return `Limite de ${plan.maxStudents} alunos atingido no plano ${plan.label}. Faça upgrade para cadastrar mais.`;
  }
  return null;
}

export function getStudentUsage(tenant: Tenant, currentCount: number) {
  const plan = resolveTenantPlan(tenant);
  return {
    current: currentCount,
    max: plan.maxStudents,
    percent: plan.maxStudents ? Math.min(100, Math.round((currentCount / plan.maxStudents) * 100)) : null,
  };
}

/** Mapeia rotas do dashboard para módulos do plano */
export const ROUTE_MODULE_MAP: Record<string, CrmModule> = {
  "/dashboard": "overview",
  "/dashboard/cursos": "courses",
  "/dashboard/ao-vivo": "live",
  "/dashboard/praticar": "practice",
  "/dashboard/exercicios": "exerciseBank",
  "/dashboard/correcoes": "corrections",
  "/dashboard/alunos": "students",
  "/dashboard/configuracao": "branding",
};

export function getModuleForPath(pathname: string): CrmModule | null {
  const entries = Object.entries(ROUTE_MODULE_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [route, module] of entries) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return module;
    }
  }
  return null;
}

export function canAccessPath(tenant: Tenant, pathname: string): boolean {
  const module = getModuleForPath(pathname);
  if (!module) return true;
  return canAccessModule(tenant, module);
}

export { BUSINESS_PLANS };
