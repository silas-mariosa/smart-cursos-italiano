"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Course } from "@lms-mocks/types";
import {
  buildPracticeLessonRows,
  filterPracticeRows,
  groupPracticeRowsByCourse,
  paginate,
  type PracticeHubFilters,
  type PracticeViewMode,
} from "@/lib/practice-hub-utils";
import { PracticeHubToolbar } from "./practice-hub-toolbar";
import { PracticePagination } from "./practice-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCrmLessonEditHref } from "@lms-mocks/course-routes";
import { HelpCircle, Layers, MessageCircle, SearchX } from "lucide-react";

const TABLE_PAGE_SIZE = 25;
const GROUPED_PAGE_SIZE = 10;

const DEFAULT_FILTERS: PracticeHubFilters = {
  search: "",
  practiceFilter: "all",
  levelFilter: "all",
  statusFilter: "all",
  sortField: "course",
  sortAsc: true,
};

interface LessonPracticeListProps {
  courses: Course[];
}

export function LessonPracticeList({ courses }: LessonPracticeListProps) {
  const [filters, setFilters] = useState<PracticeHubFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<PracticeViewMode>("grouped");
  const [page, setPage] = useState(1);

  const allRows = useMemo(() => buildPracticeLessonRows(courses), [courses]);
  const filteredRows = useMemo(
    () => filterPracticeRows(allRows, filters),
    [allRows, filters],
  );

  const courseGroups = useMemo(
    () => groupPracticeRowsByCourse(filteredRows),
    [filteredRows],
  );

  const pageSize = viewMode === "table" ? TABLE_PAGE_SIZE : GROUPED_PAGE_SIZE;
  const paginatedRows = paginate(filteredRows, page, pageSize);
  const paginatedGroups = paginate(courseGroups, page, pageSize);

  function handleFiltersChange(next: PracticeHubFilters) {
    setFilters(next);
    setPage(1);
  }

  function handleViewModeChange(next: PracticeViewMode) {
    setViewMode(next);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <PracticeHubToolbar
        filters={filters}
        viewMode={viewMode}
        resultCount={filteredRows.length}
        onFiltersChange={handleFiltersChange}
        onViewModeChange={handleViewModeChange}
      />

      {filteredRows.length === 0 ? (
        <EmptyState hasCourses={courses.length > 0} />
      ) : viewMode === "table" ? (
        <>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Curso</th>
                    <th className="px-4 py-3 font-medium">Módulo</th>
                    <th className="px-4 py-3 font-medium">Aula</th>
                    <th className="px-4 py-3 font-medium text-center">Quizzes</th>
                    <th className="px-4 py-3 font-medium text-center">Flashcards</th>
                    <th className="px-4 py-3 font-medium text-center">Simulador</th>
                    <th className="px-4 py-3 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.items.map((row) => (
                    <tr
                      key={row.lessonId}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium truncate max-w-48" title={row.courseTitle}>
                            {row.courseTitle}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {row.courseLevel}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-40 truncate" title={row.moduleTitle}>
                        {row.moduleTitle}
                      </td>
                      <td className="px-4 py-3">
                        <span className={row.hasPractice ? "font-medium" : "text-muted-foreground"}>
                          {row.lessonTitle}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">{row.exCount}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{row.fcCount}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{row.simCount}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={getCrmLessonEditHref(row.courseId, row.moduleSlug, row.lessonSlug, "praticar")}
                        >
                          <Button size="sm" variant={row.hasPractice ? "default" : "outline"}>
                            {row.hasPractice ? "Gerenciar" : "Configurar"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PracticePagination
            page={paginatedRows.page}
            totalPages={paginatedRows.totalPages}
            from={paginatedRows.from}
            to={paginatedRows.to}
            total={paginatedRows.total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <>
          <Accordion
            type="multiple"
            defaultValue={paginatedGroups.items.slice(0, 3).map((g) => g.courseId)}
            className="space-y-2"
          >
            {paginatedGroups.items.map((group) => (
              <AccordionItem key={group.courseId} value={group.courseId} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left mr-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{group.courseLevel}</Badge>
                        <Badge variant={group.courseStatus === "published" ? "success" : "secondary"}>
                          {group.courseStatus === "published" ? "Publicado" : "Rascunho"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {group.lessons.length} aula(s) nesta página
                        </Badge>
                      </div>
                      <p className="font-semibold truncate">{group.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.lessonsWithPractice} de {group.lessonsTotal} aulas com prática · {group.coverage}%
                        cobertura
                      </p>
                    </div>
                    <div className="w-full sm:w-32 shrink-0">
                      <Progress value={group.coverage} className="h-1.5" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pb-2">
                    {group.lessons.map((row) => (
                      <LessonRow key={row.lessonId} row={row} compact />
                    ))}
                    <div className="pt-2">
                      <Link href={`/dashboard/cursos/${group.courseId}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Ver curso completo
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <PracticePagination
            page={paginatedGroups.page}
            totalPages={paginatedGroups.totalPages}
            from={paginatedGroups.from}
            to={paginatedGroups.to}
            total={paginatedGroups.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function LessonRow({
  row,
  compact = false,
}: {
  row: ReturnType<typeof buildPracticeLessonRows>[number];
  compact?: boolean;
}) {
  return (
    <Card className={row.hasPractice ? undefined : "border-dashed bg-muted/20"}>
      <CardContent className={compact ? "py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3" : "py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{row.moduleTitle}</p>
          <p className="font-medium">{row.lessonTitle}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <HelpCircle className="size-3" />
              {row.exCount}
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Layers className="size-3" />
              {row.fcCount}
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <MessageCircle className="size-3" />
              {row.simCount}
            </Badge>
            {row.hasPractice ? (
              <Badge variant="secondary" className="text-[10px]">
                {row.activeModules} módulo(s)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Sem prática
              </Badge>
            )}
          </div>
        </div>
        <Link href={getCrmLessonEditHref(row.courseId, row.moduleSlug, row.lessonSlug, "praticar")}>
          <Button size="sm" variant={row.hasPractice ? "default" : "outline"}>
            {row.hasPractice ? "Gerenciar" : "Configurar"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasCourses }: { hasCourses: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <SearchX className="size-10 text-muted-foreground/60" />
        <div>
          <p className="font-medium">Nenhuma aula encontrada</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {hasCourses
              ? "Ajuste os filtros ou tente outro termo de busca."
              : "Crie um curso e adicione aulas para configurar a prática."}
          </p>
        </div>
        {hasCourses && (
          <Link href="/dashboard/cursos">
            <Button variant="outline" size="sm">
              Ir para cursos
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
