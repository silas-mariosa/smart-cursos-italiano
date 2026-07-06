"use client";

import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { StudentFeatureGate } from "@/components/lms/student-feature-gate";
import { StudentMockExamHub } from "@/components/lms/mock-exams/student-mock-exam-hub";

function SimuladosContent() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardList className="size-7 text-primary" />
          Simulados
        </h1>
        <p className="mt-1 text-muted-foreground">
          Provas formais para avaliar seu progresso, com histórico e revisão das questões.
        </p>
      </div>
      <StudentMockExamHub />
    </div>
  );
}

export default function SimuladosStudentPage() {
  return (
    <StudentFeatureGate feature="mockExams">
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-8 text-muted-foreground">Carregando...</div>
        }
      >
        <SimuladosContent />
      </Suspense>
    </StudentFeatureGate>
  );
}
