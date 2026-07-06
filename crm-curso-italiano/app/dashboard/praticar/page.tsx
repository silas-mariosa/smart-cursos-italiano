"use client";

import Link from "next/link";
import {
  BookOpen,
  Dumbbell,
  HelpCircle,
  Layers,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { ExerciseBankPanel } from "@/components/lms/exercise-bank/exercise-bank-panel";
import { PracticeStats } from "@/components/lms/practice-hub/practice-stats";
import { LessonPracticeList } from "@/components/lms/practice-hub/lesson-practice-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MODULE_GUIDES = [
  {
    icon: HelpCircle,
    title: "Quizzes",
    color: "text-blue-600 bg-blue-50 border-blue-100",
    description: "Exercícios do banco global com feedback imediato e XP configurável.",
  },
  {
    icon: Layers,
    title: "Flashcards",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    description: "Vocabulário por aula — frente/verso com dicas opcionais.",
  },
  {
    icon: MessageCircle,
    title: "Simulador",
    color: "text-violet-600 bg-violet-50 border-violet-100",
    description: "Diálogos situacionais com respostas sugeridas e orientação ao professor.",
  },
] as const;

export default function PracticeHubCrmPage() {
  const { courses, exercises, attempts } = useMockStore();
  const pendingCorrections = attempts.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="size-7 text-primary" />
            Central de prática
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Busque, filtre e gerencie quizzes, flashcards e simulador por curso ou aula.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/exercicios">
            <Button variant="outline">
              <HelpCircle className="size-4 mr-2" />
              Banco de questões
            </Button>
          </Link>
          {pendingCorrections > 0 && (
            <Link href="/dashboard/correcoes">
              <Button variant="outline">
                Corrigir redações ({pendingCorrections})
              </Button>
            </Link>
          )}
        </div>
      </div>

      <PracticeStats
        courses={courses}
        exerciseCount={exercises.length}
        pendingCorrections={pendingCorrections}
      />

      <Tabs defaultValue="aulas">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="aulas" className="gap-1.5">
            <BookOpen className="size-3.5" />
            Por aula
          </TabsTrigger>
          <TabsTrigger value="banco" className="gap-1.5">
            <HelpCircle className="size-3.5" />
            Banco de questões
          </TabsTrigger>
          <TabsTrigger value="guia" className="gap-1.5">
            <Sparkles className="size-3.5" />
            Guia rápido
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aulas" className="mt-4">
          <LessonPracticeList courses={courses} />
        </TabsContent>

        <TabsContent value="banco" className="mt-4">
          <ExerciseBankPanel variant="compact" showHeader={false} />
        </TabsContent>

        <TabsContent value="guia" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            {MODULE_GUIDES.map(({ icon: Icon, title, color, description }) => (
              <Card key={title} className={color}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="size-5" />
                    <p className="font-semibold text-sm">{title}</p>
                  </div>
                  <p className="text-xs opacity-90">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="py-6 space-y-6">
              <section className="space-y-2">
                <h3 className="font-semibold">Fluxo recomendado para professores</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
                  <li>Crie questões no banco global com dificuldade, XP e tags temáticas.</li>
                  <li>Em cada aula, abra o editor de prática e vincule quizzes do banco.</li>
                  <li>Adicione flashcards e cenários do simulador específicos da aula.</li>
                  <li>Ative ou desative módulos e ajuste a ordem de exibição ao aluno.</li>
                  <li>Use Preview aluno para validar antes de publicar o curso.</li>
                  <li>Corrija redações em Correções pendentes quando os alunos responderem.</li>
                </ol>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold">Gamificação</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <Badge variant="secondary" className="mb-2">
                      XP por questão
                    </Badge>
                    <p className="text-muted-foreground text-xs">
                      Fácil (5 XP), Médio (10 XP) e Difícil (20 XP) — personalizável por questão.
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <Badge variant="secondary" className="mb-2">
                      Tags
                    </Badge>
                    <p className="text-muted-foreground text-xs">
                      Organize por tópico (gramática, vocabulário, restaurante…) para montar baterias.
                    </p>
                  </div>
                </div>
              </section>

              <div className="rounded-lg border border-dashed bg-muted/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    Geração com IA — Fase 2
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Em breve: gerar questões, flashcards e cenários a partir do conteúdo da aula.
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Em breve
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
