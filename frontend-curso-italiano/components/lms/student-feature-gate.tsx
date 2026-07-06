"use client";

import type { ReactNode } from "react";
import type { StudentPlanFeature } from "@lms-mocks/types";
import {
  canStudentAccessFeature,
  FEATURE_BLOCK_LABELS,
  getFeatureBlockReason,
} from "@lms-mocks/student-plan-access";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface StudentFeatureGateProps {
  feature: StudentPlanFeature;
  children: ReactNode;
}

export function StudentFeatureGate({ feature, children }: StudentFeatureGateProps) {
  const { studentProfile } = useDemoStudent();

  if (!studentProfile) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          Faça login para acessar este recurso.
        </CardContent>
      </Card>
    );
  }

  const reason = getFeatureBlockReason(studentProfile, feature);
  if (reason && !canStudentAccessFeature(studentProfile, feature)) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-12 text-center space-y-3">
          <Lock className="size-10 mx-auto text-amber-600" />
          <p className="font-medium">{FEATURE_BLOCK_LABELS[reason]}</p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com sua escola para upgrade de plano.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
