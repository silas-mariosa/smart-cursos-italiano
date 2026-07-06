"use client";

import type { MockExamAttempt } from "@lms-mocks/mock-exam-types";
import { getAttemptStats } from "@/lib/mock-exam/student-mock-exam-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, XCircle } from "lucide-react";

interface MockExamResultViewProps {
  attempt: MockExamAttempt;
  passingScorePercent: number;
  onViewDetails: () => void;
  onBackToList: () => void;
}

export function MockExamResultView({
  attempt,
  passingScorePercent,
  onViewDetails,
  onBackToList,
}: MockExamResultViewProps) {
  const stats = getAttemptStats(attempt);

  return (
    <Card>
      <CardContent className="space-y-6 py-10 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          {attempt.passed ? (
            <Trophy className="size-8 text-primary" />
          ) : (
            <XCircle className="size-8 text-amber-600" />
          )}
        </div>
        <div>
          <p className="text-4xl font-bold">{attempt.scorePercent}%</p>
          <Badge className="mt-2" variant={attempt.passed ? "default" : "secondary"}>
            {attempt.passed ? "Aprovado" : "Reprovado"}
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            Nota mínima: {passingScorePercent}% · {stats.correct} de {stats.total} questões corretas
          </p>
        </div>
        <Progress value={attempt.scorePercent} className="max-w-xs mx-auto" />
        {stats.wrong > 0 && (
          <p className="text-sm text-red-700">
            Você errou {stats.wrong} questão{stats.wrong !== 1 ? "ões" : ""}. Revise os detalhes para
            melhorar.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={onViewDetails}>Ver detalhes e correções</Button>
          <Button variant="outline" onClick={onBackToList}>
            Voltar à lista
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
