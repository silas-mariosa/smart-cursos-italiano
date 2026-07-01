"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Course } from "@lms-mocks/types";
import { getFlashcardsByLesson } from "@lms-mocks/flashcards";
import { getSimulatorByLesson } from "@lms-mocks/simulator";
import { getLessonExerciseIds } from "@lms-mocks/lesson-utils";
import { resolveLessonPractice } from "@lms-mocks/lesson-practice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardCheck,
  HelpCircle,
  Layers,
  MessageCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

interface PracticeStatsProps {
  courses: Course[];
  exerciseCount: number;
  pendingCorrections: number;
}

export function PracticeStats({ courses, exerciseCount, pendingCorrections }: PracticeStatsProps) {
  const metrics = useMemo(() => {
    let lessonsTotal = 0;
    let lessonsWithPractice = 0;
    let quizzes = 0;
    let flashcards = 0;
    let scenarios = 0;
    let enabledModules = 0;

    for (const course of courses) {
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          lessonsTotal += 1;
          const settings = resolveLessonPractice(lesson.id);
          const exCount = getLessonExerciseIds(lesson).length;
          const fcCount = getFlashcardsByLesson(lesson.id).length;
          const simCount = getSimulatorByLesson(lesson.id).length;
          const hasPractice = exCount > 0 || fcCount > 0 || simCount > 0;

          if (hasPractice) lessonsWithPractice += 1;
          quizzes += exCount;
          flashcards += fcCount;
          scenarios += simCount;
          if (settings.modules.quizzes.enabled) enabledModules += 1;
          if (settings.modules.flashcards.enabled) enabledModules += 1;
          if (settings.modules.simulator.enabled) enabledModules += 1;
        }
      }
    }

    const coverage = lessonsTotal > 0 ? Math.round((lessonsWithPractice / lessonsTotal) * 100) : 0;

    return { lessonsTotal, lessonsWithPractice, quizzes, flashcards, scenarios, enabledModules, coverage };
  }, [courses]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<HelpCircle className="size-5 text-blue-600" />}
          label="Quizzes no banco"
          value={exerciseCount}
          hint={`${metrics.quizzes} vinculados às aulas`}
        />
        <MetricCard
          icon={<Layers className="size-5 text-emerald-600" />}
          label="Flashcards"
          value={metrics.flashcards}
          hint="cartões ativos"
        />
        <MetricCard
          icon={<MessageCircle className="size-5 text-violet-600" />}
          label="Cenários simulador"
          value={metrics.scenarios}
          hint="diálogos configurados"
        />
        <MetricCard
          icon={<Trophy className="size-5 text-amber-600" />}
          label="Cobertura"
          value={`${metrics.coverage}%`}
          hint={`${metrics.lessonsWithPractice}/${metrics.lessonsTotal} aulas com prática`}
        />
      </div>

      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Cobertura de prática por aula</p>
              <p className="text-xs text-muted-foreground">
                Aulas com pelo menos um módulo de prática configurado
              </p>
            </div>
            <Badge variant="secondary">{metrics.coverage}%</Badge>
          </div>
          <Progress value={metrics.coverage} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {pendingCorrections > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="size-5 text-amber-700 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{pendingCorrections} correção(ões) pendente(s)</p>
                  <p className="text-xs text-muted-foreground">Redações aguardando sua avaliação</p>
                </div>
              </div>
              <Link href="/dashboard/correcoes">
                <Button size="sm" variant="outline">
                  Corrigir
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="border-dashed">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Gamificação automática</p>
                <p className="text-xs text-muted-foreground">
                  XP, dificuldade e tags por questão no banco global
                </p>
              </div>
            </div>
            <Link href="/dashboard/exercicios">
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium mt-0.5">{label}</p>
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
