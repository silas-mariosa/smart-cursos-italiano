"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Course } from "@lms-mocks/types";
import { formatWatchTime, type CourseAnalytics } from "@/lib/course-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseAnalyticsPanelProps {
  course: Course;
  analytics: CourseAnalytics;
}

export function CourseAnalyticsPanel({ course, analytics }: CourseAnalyticsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="size-4" />
              Alunos matriculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.enrolledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" />
              Progresso médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.avgProgressPercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="size-4" />
              Média de acertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {analytics.avgAccuracyPercent !== null ? `${analytics.avgAccuracyPercent}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="size-4" />
              Tempo médio de exibição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatWatchTime(analytics.avgWatchMinutes)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {formatWatchTime(analytics.totalWatchMinutes)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-4" />
              Alunos neste curso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {analytics.students.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Nenhum aluno matriculado neste curso.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Aluno</th>
                      <th className="text-left p-3 font-medium">Progresso</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Acertos</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Tempo</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Exercícios</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Última atividade</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.students.map((row) => (
                      <tr key={row.student.id} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">{row.student.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{row.student.name}</p>
                              <p className="text-xs text-muted-foreground">{row.student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <Progress value={row.enrollment.progressPercent} className="flex-1 h-2" />
                            <span className="text-xs shrink-0">{row.enrollment.progressPercent}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {row.enrollment.completedLessonIds.length} aulas · streak {row.enrollment.streakDays}d
                          </p>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {row.accuracyPercent !== null ? (
                            <Badge variant={row.accuracyPercent >= 70 ? "success" : "warning"}>
                              {row.accuracyPercent}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">
                          {formatWatchTime(row.watchMinutes)}
                        </td>
                        <td className="p-3 hidden lg:table-cell">{row.exercisesDone}</td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">{row.lastActivity}</td>
                        <td className="p-3">
                          <Link href={`/dashboard/alunos/${row.student.id}`}>
                            <Button variant="ghost" size="sm">
                              Detalhes
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4" />
              Dados do curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nível</span>
              <Badge>{course.level}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={course.status === "published" ? "success" : "secondary"}>
                {course.status === "published" ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Módulos</span>
              <span className="font-medium">{course.modules.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aulas totais</span>
              <span className="font-medium">{analytics.totalLessons}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aulas publicadas</span>
              <span className="font-medium">{analytics.publishedLessons}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duração total</span>
              <span className="font-medium">{formatWatchTime(analytics.totalDurationMinutes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Instrutor</span>
              <span className="font-medium">{course.instructorName}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-muted-foreground mb-1">Descrição</p>
              <p>{course.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
