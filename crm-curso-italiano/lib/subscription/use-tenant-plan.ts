"use client";

import { useMemo } from "react";
import { useMockStore } from "@/lib/mock-store";
import {
  canAccessModule,
  canAccessPath,
  canAddStudent,
  getStudentLimitMessage,
  getStudentUsage,
  resolveTenantPlan,
} from "./plans";

export function useTenantPlan() {
  const { tenant, students } = useMockStore();

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
    };
  }, [tenant, students.length]);
}
