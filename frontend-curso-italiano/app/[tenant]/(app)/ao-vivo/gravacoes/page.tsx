"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { StudentFeatureGate } from "@/components/lms/student-feature-gate";
import { StudentLiveHub } from "@/components/lms/live/student-live-hub";

export default function LiveRecordingsStudentPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;

  return (
    <StudentFeatureGate feature="liveRecordings">
      <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-8 text-muted-foreground">Carregando...</div>}>
        <StudentLiveHub tenantSlug={tenantSlug} defaultTab="gravacoes" />
      </Suspense>
    </StudentFeatureGate>
  );
}
