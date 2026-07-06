"use client";

import { useMemo } from "react";
import { useMockStore } from "@/lib/mock-store";
import {
  canAccessConfiguration,
  canAccessModule,
  canAccessPath,
  canAddStudent,
  getStudentLimitMessage,
  getStudentUsage,
  isAiGenerationReady,
  resolveTenantPlan,
} from "./plans";

export function useTenantPlan() {
  const { tenant, students, aiConfig, persona } = useMockStore();
  const isAdmin = persona?.role === "admin";

  return useMemo(() => {
    const plan = resolveTenantPlan(tenant);
    const usage = getStudentUsage(tenant, students.length);
    const studentLimitMessage = getStudentLimitMessage(tenant, students.length);

    return {
      plan,
      tenant,
      usage,
      studentLimitMessage,
      canAddStudent: canAddStudent(tenant, students.length),
      canAccessModule: (module: Parameters<typeof canAccessModule>[1]) =>
        canAccessModule(tenant, module),
      canAccessPath: (pathname: string) => canAccessPath(tenant, pathname),
      canAccessConfiguration: canAccessConfiguration(tenant, isAdmin),
      canUseAiGeneration: isAiGenerationReady(tenant, aiConfig),
      hasAiGenerationModule: canAccessModule(tenant, "aiGeneration"),
    };
  }, [tenant, students.length, aiConfig, isAdmin]);
}
