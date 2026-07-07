"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Course } from "@lms-mocks/types";
import type { LiveSession } from "@lms-mocks/practice-types";
import {
  filterLiveSessions,
  paginate,
  type LiveSessionsFilters,
} from "@/lib/live-sessions-utils";
import { LiveSessionsToolbar } from "./live-sessions-toolbar";
import { PracticePagination } from "@/components/lms/practice-hub/practice-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Repeat, SearchX } from "lucide-react";

const PAGE_SIZE = 25;

const DEFAULT_FILTERS: LiveSessionsFilters = {
  search: "",
  statusFilter: "all",
  typeFilter: "all",
  courseFilter: "all",
  periodFilter: "all",
  sortField: "date",
  sortAsc: true,
};

const statusLabels = {
  scheduled: "Agendada",
  waiting: "Convocada",
  live: "Ao vivo",
  ended: "Encerrada",
} as const;

const statusBadgeClass: Record<LiveSession["status"], string> = {
  scheduled: "bg-slate-100 text-slate-700 border-slate-200",
  waiting: "bg-amber-100 text-amber-800 border-amber-200",
  live: "bg-red-600 text-white border-red-600",
  ended: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const recurrenceUnitLabels = {
  day: "dia(s)",
  week: "semana(s)",
  month: "mês(es)",
} as const;

interface LiveSessionsListProps {
  sessions: LiveSession[];
  courses: Course[];
  onConvoke: (sessionId: string) => void;
}

export function LiveSessionsList({ sessions, courses, onConvoke }: LiveSessionsListProps) {
  const [filters, setFilters] = useState<LiveSessionsFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const courseLevelById = useMemo(
    () => new Map(courses.map((course) => [course.id, course.level])),
    [courses],
  );

  const filteredSessions = useMemo(
    () => filterLiveSessions(sessions, filters),
    [sessions, filters],
  );

  const paginated = paginate(filteredSessions, page, PAGE_SIZE);

  function handleFiltersChange(next: LiveSessionsFilters) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <LiveSessionsToolbar
        filters={filters}
        courses={courses}
        resultCount={filteredSessions.length}
        onFiltersChange={handleFiltersChange}
      />

      {filteredSessions.length === 0 ? (
        <EmptyState hasSessions={sessions.length > 0} />
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Sessão</th>
                    <th className="px-4 py-3 font-medium">Curso</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Horário</th>
                    <th className="px-4 py-3 font-medium text-center">Duração</th>
                    <th className="px-4 py-3 font-medium text-center">Tipo</th>
                    <th className="px-4 py-3 font-medium text-center">Alunos</th>
                    <th className="px-4 py-3 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.items.map((session) => {
                    const date = new Date(session.scheduledAt);
                    const isActive =
                      session.status === "waiting" || session.status === "live";
                    const studentCount = session.participants.filter(
                      (p) => p.role === "student",
                    ).length;
                    const courseLevel = courseLevelById.get(session.courseId);

                    return (
                      <tr
                        key={session.id}
                        className={cn(
                          "border-b last:border-0 hover:bg-muted/20 transition-colors",
                          isActive && "bg-red-50/40",
                        )}
                      >
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={cn("font-normal", statusBadgeClass[session.status])}
                          >
                            {statusLabels[session.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 min-w-48">
                          <p className="font-medium truncate max-w-xs" title={session.title}>
                            {session.title}
                          </p>
                          {session.recurrence && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Repeat className="size-3 shrink-0" />
                              A cada {session.recurrence.interval}{" "}
                              {recurrenceUnitLabels[session.recurrence.unit]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-52">
                            <span
                              className="text-muted-foreground truncate"
                              title={session.courseTitle}
                            >
                              {session.courseTitle}
                            </span>
                            {courseLevel && (
                              <Badge variant="outline" className="text-[10px]">
                                {courseLevel}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                          {date.toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                          {date.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">
                          {session.durationMinutes} min
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="font-normal text-[10px]">
                            {session.sessionType === "group" ? "Grupo" : "Individual"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">
                          {studentCount > 0 ? studentCount : session.participants.length}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {session.status === "scheduled" && (
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 h-8"
                                onClick={() => onConvoke(session.id)}
                              >
                                Convocar
                              </Button>
                            )}
                            <Link href={`/dashboard/ao-vivo/${session.id}`}>
                              <Button size="sm" variant="outline" className="h-8">
                                Gerenciar
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <PracticePagination
            page={paginated.page}
            totalPages={paginated.totalPages}
            from={paginated.from}
            to={paginated.to}
            total={paginated.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function EmptyState({ hasSessions }: { hasSessions: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <SearchX className="size-10 text-muted-foreground/60" />
        <div>
          <p className="font-medium">Nenhuma sessão encontrada</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {hasSessions
              ? "Ajuste os filtros ou tente outro termo de busca."
              : "Crie uma nova sessão ao vivo para começar."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
