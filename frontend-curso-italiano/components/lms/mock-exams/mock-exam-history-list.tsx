"use client";

import { useMemo, useState } from "react";
import type { MockExam, MockExamAttempt } from "@lms-mocks/mock-exam-types";
import { formatAttemptDate } from "@/lib/mock-exam/exercise-answer-utils";
import { getAttemptStats } from "@/lib/mock-exam/student-mock-exam-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { History, Search, ChevronRight } from "lucide-react";

interface MockExamHistoryListProps {
  attempts: MockExamAttempt[];
  exams: MockExam[];
  onSelectAttempt: (attemptId: string) => void;
}

export function MockExamHistoryList({ attempts, exams, onSelectAttempt }: MockExamHistoryListProps) {
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState<"all" | "passed" | "failed">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attempts.filter((attempt) => {
      const exam = exams.find((e) => e.id === attempt.mockExamId);
      if (!exam) return false;
      if (examFilter !== "all" && attempt.mockExamId !== examFilter) return false;
      if (resultFilter === "passed" && !attempt.passed) return false;
      if (resultFilter === "failed" && attempt.passed) return false;
      if (q && !exam.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [attempts, exams, search, examFilter, resultFilter]);

  const stats = useMemo(() => {
    const passed = attempts.filter((a) => a.passed).length;
    return { total: attempts.length, passed, failed: attempts.length - passed };
  }, [attempts]);

  if (attempts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center space-y-2">
          <History className="mx-auto size-10 text-muted-foreground/50" />
          <p className="font-medium">Nenhum simulado realizado ainda</p>
          <p className="text-sm text-muted-foreground">
            Quando você concluir um simulado, o histórico aparecerá aqui com nota e detalhes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Tentativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-emerald-600">{stats.passed}</p>
            <p className="text-sm text-muted-foreground">Aprovações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-amber-600">{stats.failed}</p>
            <p className="text-sm text-muted-foreground">Reprovações</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar simulado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Todos os simulados</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "all" as const, label: "Todos" },
              { value: "passed" as const, label: "Aprovados" },
              { value: "failed" as const, label: "Reprovados" },
            ] as const
          ).map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={resultFilter === opt.value ? "default" : "outline"}
              onClick={() => setResultFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Histórico de tentativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma tentativa encontrada com os filtros atuais.
            </p>
          ) : (
            filtered.map((attempt) => {
              const exam = exams.find((e) => e.id === attempt.mockExamId);
              const { correct, wrong, total } = getAttemptStats(attempt);
              return (
                <button
                  key={attempt.id}
                  type="button"
                  onClick={() => onSelectAttempt(attempt.id)}
                  className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium truncate">{exam?.title ?? "Simulado"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatAttemptDate(attempt.submittedAt ?? attempt.startedAt)}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant={attempt.passed ? "default" : "secondary"}>
                        {attempt.scorePercent}%
                      </Badge>
                      <Badge variant="outline">
                        {correct}/{total} acertos
                      </Badge>
                      {wrong > 0 && (
                        <Badge variant="outline" className="text-red-700 border-red-200">
                          {wrong} erro{wrong !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </button>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
