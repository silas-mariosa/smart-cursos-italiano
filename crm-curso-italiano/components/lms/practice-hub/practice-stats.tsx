"use client";

import Link from "next/link";
import type { Course } from "@lms-mocks/types";
import { computePracticeMetrics } from "@/lib/practice-hub-utils";
import { Card, CardContent } from "@/components/ui/card";
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
  const metrics = computePracticeMetrics(courses);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <MetricChip
          icon={<HelpCircle className="size-4 text-blue-600" />}
          label="Banco"
          value={exerciseCount}
          hint={`${metrics.quizzes} vinculados`}
        />
        <MetricChip
          icon={<Layers className="size-4 text-emerald-600" />}
          label="Flashcards"
          value={metrics.flashcards}
        />
        <MetricChip
          icon={<MessageCircle className="size-4 text-violet-600" />}
          label="Simulador"
          value={metrics.scenarios}
        />
        <MetricChip
          icon={<Trophy className="size-4 text-amber-600" />}
          label="Cobertura"
          value={`${metrics.coverage}%`}
          hint={`${metrics.lessonsWithPractice}/${metrics.lessonsTotal} aulas`}
        />
        <MetricChip
          icon={<Sparkles className="size-4 text-primary" />}
          label="Aulas"
          value={metrics.lessonsTotal}
          hint="no catálogo"
        />
      </div>

      <Card>
        <CardContent className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Cobertura de prática</p>
              <span className="text-xs text-muted-foreground tabular-nums">{metrics.coverage}%</span>
            </div>
            <Progress value={metrics.coverage} className="h-1.5" />
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {pendingCorrections > 0 && (
              <Link href="/dashboard/correcoes">
                <Button size="sm" variant="outline" className="border-amber-200 bg-amber-50/50">
                  <ClipboardCheck className="size-4 mr-1.5 text-amber-700" />
                  {pendingCorrections} correção(ões)
                </Button>
              </Link>
            )}
            <Link href="/dashboard/exercicios">
              <Button size="sm" variant="outline">
                <Sparkles className="size-4 mr-1.5" />
                Gamificação
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricChip({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="py-3 px-3">
        <div className="flex items-center gap-2">
          {icon}
          <div className="min-w-0">
            <p className="text-lg font-bold leading-none tabular-nums">{value}</p>
            <p className="text-[11px] font-medium text-muted-foreground truncate">{label}</p>
            {hint && <p className="text-[10px] text-muted-foreground truncate">{hint}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
