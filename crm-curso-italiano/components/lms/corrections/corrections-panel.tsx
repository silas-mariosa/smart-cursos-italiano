"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMockStore } from "@/lib/mock-store";
import {
  filterAttempts,
  formatRelativeTime,
  getCorrectionStats,
  type CorrectionFilter,
} from "@/lib/corrections/utils";
import { CorrectionCard } from "./correction-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export function CorrectionsPanel() {
  const { attempts, courses, refreshAttempts } = useMockStore();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [tab, setTab] = useState<CorrectionFilter>("pending");

  useEffect(() => {
    refreshAttempts();
    const interval = setInterval(refreshAttempts, 5000);
    return () => clearInterval(interval);
  }, [refreshAttempts]);

  const stats = useMemo(() => getCorrectionStats(attempts), [attempts]);

  const courseOptions = useMemo(() => {
    const ids = new Set(attempts.map((a) => a.courseId));
    return courses.filter((c) => ids.has(c.id));
  }, [attempts, courses]);

  const filtered = useMemo(
    () => filterAttempts(attempts, search, tab, courseFilter),
    [attempts, search, tab, courseFilter],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="size-7 text-amber-600" />
            Correções
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Avalie redações enviadas pelos alunos. Feedback e nota ficam disponíveis no perfil e no
            histórico de notas.
          </p>
        </div>
        {stats.pendingCount > 0 && (
          <Badge variant="warning" className="self-start text-sm px-3 py-1">
            {stats.pendingCount} aguardando correção
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock className="size-5 text-amber-600" />}
          label="Pendentes"
          value={stats.pendingCount}
          hint={stats.oldestPending ? `mais antiga ${formatRelativeTime(stats.oldestPending)}` : "nenhuma na fila"}
          highlight={stats.pendingCount > 0}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5 text-emerald-600" />}
          label="Corrigidas"
          value={stats.gradedCount}
          hint={`${stats.gradedThisWeek} nos últimos 7 dias`}
        />
        <StatCard
          icon={<TrendingUp className="size-5 text-blue-600" />}
          label="Média geral"
          value={stats.avgScore != null ? stats.avgScore.toFixed(1) : "—"}
          hint="nota 0–10 das corrigidas"
        />
        <StatCard
          icon={<ClipboardCheck className="size-5 text-violet-600" />}
          label="Total"
          value={stats.total}
          hint="submissões registradas"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar aluno, curso, aula ou trecho da resposta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border px-3 text-sm bg-background min-w-[180px]"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="all">Todos os cursos</option>
          {courseOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as CorrectionFilter)}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            Pendentes
            {stats.pendingCount > 0 && (
              <Badge variant="warning" className="ml-1 h-5 px-1.5 text-[10px]">
                {stats.pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="graded">Corrigidas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        {(["pending", "graded", "all"] as const).map((value) => (
          <TabsContent key={value} value={value} className="space-y-4 mt-6">
            {filtered.length === 0 ? (
              <EmptyState tab={value} hasFilters={Boolean(search) || courseFilter !== "all"} />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "submissão" : "submissões"}
                </p>
                <div className="space-y-3">
                  {filtered.map((attempt) => (
                    <CorrectionCard
                      key={attempt.id}
                      attempt={attempt}
                      variant={attempt.status === "pending" ? "pending" : "graded"}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-dashed">
        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-sm flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Sugestão de nota com IA — Fase 2
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Em breve: rascunho de feedback e nota sugerida com base no enunciado e na resposta.
            </p>
          </div>
          <Link href="/dashboard/exercicios">
            <Button variant="outline" size="sm">
              Ver exercícios de redação
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-amber-200 bg-amber-50/40")}>
      <CardContent className="pt-4 pb-4">
        <div className="mb-2">{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium mt-0.5">{label}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-2">{hint}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ tab, hasFilters }: { tab: CorrectionFilter; hasFilters: boolean }) {
  const messages = {
    pending: {
      title: "Nenhuma correção pendente",
      description: "Quando alunos enviarem redações, elas aparecerão aqui para você avaliar.",
    },
    graded: {
      title: "Nenhuma redação corrigida ainda",
      description: "As correções concluídas ficam registradas nesta aba.",
    },
    all: {
      title: "Nenhuma submissão encontrada",
      description: "Ainda não há redações registradas no sistema demo.",
    },
  }[tab];

  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <ClipboardCheck className="size-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="font-medium">{hasFilters ? "Nenhum resultado" : messages.title}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {hasFilters ? "Tente outros filtros ou limpe a busca." : messages.description}
        </p>
      </CardContent>
    </Card>
  );
}
