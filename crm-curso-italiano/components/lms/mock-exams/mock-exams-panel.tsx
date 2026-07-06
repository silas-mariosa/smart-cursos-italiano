"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { MockExam } from "@lms-mocks/mock-exam-types";
import { useMockStore } from "@/lib/mock-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Copy, Pencil, Plus, Trash2, BarChart3 } from "lucide-react";

const STATUS_LABELS: Record<MockExam["status"], string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function MockExamsPanel() {
  const { tenant, mockExams, mockExamAttempts, deleteMockExam, duplicateMockExam, updateMockExam } =
    useMockStore();
  const router = useRouter();
  const [tab, setTab] = useState<"exams" | "results">("exams");

  const tenantExams = mockExams.filter((e) => e.tenantId === tenant.id);
  const attemptCount = mockExamAttempts.filter((a) =>
    tenantExams.some((e) => e.id === a.mockExamId),
  ).length;

  const stats = useMemo(() => {
    const submitted = mockExamAttempts.filter((a) => a.status === "submitted");
    const passRate =
      submitted.length > 0
        ? Math.round((submitted.filter((a) => a.passed).length / submitted.length) * 100)
        : 0;
    return { total: tenantExams.length, attempts: attemptCount, passRate };
  }, [tenantExams, mockExamAttempts, attemptCount]);

  function handleArchive(exam: MockExam) {
    updateMockExam({ ...exam, status: exam.status === "archived" ? "draft" : "archived" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="size-7 text-primary" />
            Simulados
          </h1>
          <p className="text-muted-foreground mt-1">
            Provas formais com banco de questões, geração automática e análise de desempenho.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/simulados/resultados">
              <BarChart3 className="size-4 mr-2" />
              Resultados
            </Link>
          </Button>
          <Button onClick={() => router.push("/dashboard/simulados/novo")}>
            <Plus className="size-4 mr-2" />
            Novo simulado
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Simulados cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{stats.attempts}</p>
            <p className="text-sm text-muted-foreground">Tentativas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{stats.passRate}%</p>
            <p className="text-sm text-muted-foreground">Taxa de aprovação</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === "exams" ? "default" : "ghost"} size="sm" onClick={() => setTab("exams")}>
          Meus simulados
        </Button>
        <Button variant={tab === "results" ? "default" : "ghost"} size="sm" onClick={() => setTab("results")}>
          Resultados e análises
        </Button>
      </div>

      {tab === "results" ? (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-muted-foreground">Acesse o painel completo de resultados e drill-down por questão.</p>
            <Button asChild>
              <Link href="/dashboard/simulados/resultados">Abrir painel de resultados</Link>
            </Button>
          </CardContent>
        </Card>
      ) : tenantExams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum simulado cadastrado. Crie o primeiro com questões do banco ou geração automática.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tenantExams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  {exam.title}
                  <Badge variant={exam.status === "published" ? "default" : "secondary"}>
                    {STATUS_LABELS[exam.status]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground line-clamp-2">{exam.description || "—"}</p>
                <p>
                  {exam.questionIds.length} questões · {exam.durationMinutes} min · nota mínima{" "}
                  {exam.passingScorePercent}%
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/simulados/${exam.id}/editar`}>
                      <Pencil className="size-3.5 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/simulados/${exam.id}/resultados`}>Resultados</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateMockExam(exam.id)}
                  >
                    <Copy className="size-3.5 mr-1" />
                    Duplicar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleArchive(exam)}>
                    {exam.status === "archived" ? "Restaurar" : "Arquivar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMockExam(exam.id)}
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
