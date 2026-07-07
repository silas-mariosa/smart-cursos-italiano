"use client";

import type { Course } from "@lms-mocks/types";
import type {
  LiveSessionPeriodFilter,
  LiveSessionSortField,
  LiveSessionsFilters,
} from "@/lib/live-sessions-utils";
import type { LiveSessionStatus, LiveSessionType } from "@lms-mocks/practice-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface LiveSessionsToolbarProps {
  filters: LiveSessionsFilters;
  courses: Course[];
  resultCount: number;
  onFiltersChange: (filters: LiveSessionsFilters) => void;
}

export function LiveSessionsToolbar({
  filters,
  courses,
  resultCount,
  onFiltersChange,
}: LiveSessionsToolbarProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.statusFilter !== "all" ||
    filters.typeFilter !== "all" ||
    filters.courseFilter !== "all" ||
    filters.periodFilter !== "all";

  function patch(partial: Partial<LiveSessionsFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function clearFilters() {
    onFiltersChange({
      ...filters,
      search: "",
      statusFilter: "all",
      typeFilter: "all",
      courseFilter: "all",
      periodFilter: "all",
    });
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => patch({ search: e.target.value })}
          placeholder="Buscar por título, curso ou tópico..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="size-3.5" />
            Filtros
          </span>

          <FilterPills
            value={filters.statusFilter}
            options={[
              ["all", "Status"],
              ["scheduled", "Agendada"],
              ["waiting", "Convocada"],
              ["live", "Ao vivo"],
              ["ended", "Encerrada"],
            ]}
            onChange={(value) => patch({ statusFilter: value as LiveSessionStatus | "all" })}
          />

          <FilterPills
            value={filters.typeFilter}
            options={[
              ["all", "Tipo"],
              ["group", "Grupo"],
              ["individual", "Individual"],
            ]}
            onChange={(value) => patch({ typeFilter: value as LiveSessionType | "all" })}
          />

          <FilterPills
            value={filters.periodFilter}
            options={[
              ["all", "Período"],
              ["today", "Hoje"],
              ["upcoming", "Próximas"],
              ["past", "Passadas"],
            ]}
            onChange={(value) => patch({ periodFilter: value as LiveSessionPeriodFilter })}
          />

          <select
            value={filters.courseFilter}
            onChange={(e) => patch({ courseFilter: e.target.value })}
            className="h-8 rounded-full border bg-background px-3 text-xs max-w-48 truncate"
          >
            <option value="all">Curso</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={`${filters.sortField}:${filters.sortAsc ? "asc" : "desc"}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(":");
              patch({
                sortField: field as LiveSessionSortField,
                sortAsc: dir === "asc",
              });
            }}
            className="h-8 rounded-full border bg-background px-3 text-xs"
          >
            <option value="date:asc">Data (antigas primeiro)</option>
            <option value="date:desc">Data (recentes primeiro)</option>
            <option value="title:asc">Título A–Z</option>
            <option value="title:desc">Título Z–A</option>
            <option value="course:asc">Curso A–Z</option>
            <option value="course:desc">Curso Z–A</option>
          </select>

          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
              <X className="size-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground xl:ml-auto shrink-0">
          {resultCount} {resultCount === 1 ? "sessão encontrada" : "sessões encontradas"}
        </p>
      </div>
    </div>
  );
}

function FilterPills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border transition-colors",
            value === optionValue
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-accent bg-background",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
