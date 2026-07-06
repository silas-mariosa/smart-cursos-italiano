"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMockStore } from "@/lib/mock-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface MockExamResultsPanelProps {
  examId?: string;
}

export function MockExamResultsPanel({ examId }: MockExamResultsPanelProps) {
  const { tenant, mockExams, mockExamAttempts, exercises } = useMockStore();
  const [examFilter, setExamFilter] = useState(examId ?? "all");
  const [search, setSearch] = useState("");

  const tenantExams = mockExams.filter((e) => e.tenantId === tenant.id);

  const attempts = useMemo(() => {
    return mockExamAttempts
      .filter((a) => {
        const exam = tenantExams.find((e) => e.id === a.mockExamId);
        if (!exam) return false;
        if (examFilter !== "all" && a.mockExamId !== examFilter) return false;
        if (search && !a.studentName.toLowerCase().includes(search.toLowerCase())) return false;
        return a.status === "submitted";
      })
      .sort((a, b) => new Date(b.submittedAt ?? b.startedAt).getTime() - new Date(a.submittedAt ?? a.startedAt).getTime());
  }, [mockExamAttempts, tenantExams, examFilter, search]);

  const aggregates = useMemo(() => {
    const byQuestion: Record<string, { correct: number; total: number }> = {};
    for (const att of attempts) {
      for (const ans of att.answers) {
        if (!byQuestion[ans.exerciseId]) byQuestion[ans.exerciseId] = { correct: 0, total: 0 };
        byQuestion[ans.exerciseId].total++;
        if (ans.correct) byQuestion[ans.exerciseId].correct++;
      }
    }
    const hardest = Object.entries(byQuestion)
      .map(([id, stats]) => ({
        id,
        title: exercises.find((e) => e.id === id)?.title ?? id,
        errorRate: stats.total ? Math.round((1 - stats.correct / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);
    const passRate =
      attempts.length > 0
        ? Math.round((attempts.filter((a) => a.passed).length / attempts.length) * 100)
        : 0;
    return { hardest, passRate };
  }, [attempts, exercises]);

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const selectedAttempt = attempts.find((a) => a.id === selectedAttemptId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/simulados">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Resultados e análises</h1>
          <p className="text-muted-foreground text-sm">
            Tentativas, acertos por questão e taxa de aprovação.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
        >
          <option value="all">Todos os simulados</option>
          {tenantExams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        <Input
          placeholder="Buscar aluno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{aggregates.passRate}%</p>
            <p className="text-sm text-muted-foreground">Taxa de aprovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{attempts.length}</p>
            <p className="text-sm text-muted-foreground">Tentativas concluídas</p>
          </CardContent>
        </Card>
      </div>

      {aggregates.hardest.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questões mais erradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aggregates.hardest.map((q) => (
              <div key={q.id} className="flex justify-between text-sm">
                <span className="truncate">{q.title}</span>
                <Badge variant="outline">{q.errorRate}% erros</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tentativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma tentativa registrada.</p>
            ) : (
              attempts.map((a) => {
                const exam = tenantExams.find((e) => e.id === a.mockExamId);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAttemptId(a.id)}
                    className={`w-full text-left border rounded-lg p-3 text-sm hover:bg-muted/50 ${selectedAttemptId === a.id ? "border-primary" : ""}`}
                  >
                    <p className="font-medium">{a.studentName}</p>
                    <p className="text-muted-foreground">{exam?.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={a.passed ? "default" : "secondary"}>
                        {a.scorePercent}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.submittedAt ?? a.startedAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhe por questão</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedAttempt ? (
              <p className="text-sm text-muted-foreground">Selecione uma tentativa para ver acertos e erros.</p>
            ) : (
              <ul className="space-y-3">
                {selectedAttempt.answers.map((ans, i) => {
                  const ex = exercises.find((e) => e.id === ans.exerciseId);
                  return (
                    <li key={ans.exerciseId} className="border rounded-lg p-3 text-sm">
                      <div className="flex items-start gap-2">
                        {ans.correct ? (
                          <CheckCircle2 className="size-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">
                            {i + 1}. {ex?.title ?? ans.exerciseId}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            Resposta: {String(ans.selected ?? "—")} · {ans.timeSpentSec}s
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
