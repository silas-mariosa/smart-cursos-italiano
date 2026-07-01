"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock-store";
import { countWords, formatRelativeTime } from "@/lib/corrections/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Sparkles, User } from "lucide-react";

const QUICK_FEEDBACK = [
  "Ótimo uso de vocabulário! Continue praticando a conjugação dos verbos.",
  "Boa estrutura. Tente incluir mais conectivos para fluidez.",
  "Expressões corretas. Revise acentuação e concordância de gênero.",
  "Resposta incompleta — inclua mais frases conforme o enunciado.",
];

export default function CorrectionDetailPage() {
  const params = useParams();
  const attemptId = params.id as string;
  const router = useRouter();
  const { attempts, gradeAttempt } = useMockStore();
  const attempt = attempts.find((a) => a.id === attemptId);
  const [score, setScore] = useState("8.5");
  const [feedback, setFeedback] = useState(
    "Ótimo uso de expressões do restaurante. Tente incluir 'grazie' no final para soar mais natural.",
  );

  if (!attempt) {
    return (
      <div className="space-y-4">
        <p>Correção não encontrada</p>
        <Link href="/dashboard/correcoes">
          <Button variant="outline">← Voltar</Button>
        </Link>
      </div>
    );
  }

  const wordCount = countWords(attempt.answer);
  const isPending = attempt.status === "pending";

  function handleSubmit() {
    if (!attempt) return;
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > attempt.maxScore) return;
    gradeAttempt(attemptId, numScore, feedback);
    router.push("/dashboard/correcoes");
  }

  function initials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/correcoes" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
        ← Voltar às correções
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="font-semibold bg-primary/10 text-primary">
              {initials(attempt.studentName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{attempt.studentName}</h1>
              {isPending ? <Badge variant="warning">Pendente</Badge> : <Badge variant="success">Corrigida</Badge>}
            </div>
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" />
                {attempt.courseTitle}
              </span>
              <span>·</span>
              <span>{attempt.lessonTitle}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatRelativeTime(attempt.submittedAt)}
              </span>
            </p>
          </div>
        </div>
        <Link href={`/dashboard/alunos/${attempt.studentId}`}>
          <Button variant="outline" size="sm">
            <User className="size-4 mr-2" />
            Ver perfil do aluno
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enunciado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{attempt.prompt}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Resposta do aluno</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {wordCount} palavra(s)
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-xl p-4 border leading-relaxed italic">
            {attempt.answer}
          </p>
        </CardContent>
      </Card>

      {isPending ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sua avaliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Nota (0–{attempt.maxScore})</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max={attempt.maxScore}
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <div className="flex flex-wrap gap-1.5">
                  {[6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(String(n))}
                      className="text-xs px-2.5 py-1 rounded-full border hover:bg-accent transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback para o aluno</Label>
              <Textarea
                id="feedback"
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explique o que o aluno acertou e o que pode melhorar..."
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Sugestões rápidas</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_FEEDBACK.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => setFeedback(text)}
                    className="text-left text-xs px-3 py-2 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors max-w-full sm:max-w-[280px]"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <Button disabled title="Disponível na Fase 2" variant="outline">
                <Sparkles className="size-4 mr-2" />
                Sugerir com IA
              </Button>
              <Button onClick={handleSubmit} disabled={!feedback.trim()}>
                Enviar correção ao aluno
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Correção enviada
              <Badge variant="success">
                {attempt.score}/{attempt.maxScore}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{attempt.feedback}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
