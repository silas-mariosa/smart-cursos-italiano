"use client";

import type { CourseLevel, CourseStatus } from "@lms-mocks/types";
import type {
  PracticeFilter,
  PracticeHubFilters,
  PracticeSortField,
  PracticeViewMode,
} from "@/lib/practice-hub-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";

const LEVELS: CourseLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface PracticeHubToolbarProps {
  filters: PracticeHubFilters;
  viewMode: PracticeViewMode;
  resultCount: number;
  onFiltersChange: (filters: PracticeHubFilters) => void;
  onViewModeChange: (mode: PracticeViewMode) => void;
}

export function PracticeHubToolbar({
  filters,
  viewMode,
  resultCount,
  onFiltersChange,
  onViewModeChange,
}: PracticeHubToolbarProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.practiceFilter !== "all" ||
    filters.levelFilter !== "all" ||
    filters.statusFilter !== "all";

  function patch(partial: Partial<PracticeHubFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function clearFilters() {
    onFiltersChange({
      ...filters,
      search: "",
      practiceFilter: "all",
      levelFilter: "all",
      statusFilter: "all",
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Buscar por curso, módulo ou aula..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0 rounded-lg border p-1 bg-muted/30">
          <Button
            type="button"
            size="sm"
            variant={viewMode === "grouped" ? "default" : "ghost"}
            className="h-8 gap-1.5"
            onClick={() => onViewModeChange("grouped")}
          >
            <LayoutGrid className="size-3.5" />
            Por curso
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "table" ? "default" : "ghost"}
            className="h-8 gap-1.5"
            onClick={() => onViewModeChange("table")}
          >
            <List className="size-3.5" />
            Tabela
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="size-3.5" />
            Filtros
          </span>

          <FilterPills
            value={filters.practiceFilter}
            options={[
              ["all", "Todas"],
              ["with-practice", "Com prática"],
              ["without-practice", "Sem prática"],
            ]}
            onChange={(value) => patch({ practiceFilter: value as PracticeFilter })}
          />

          <FilterPills
            value={filters.statusFilter}
            options={[
              ["all", "Status"],
              ["published", "Publicado"],
              ["draft", "Rascunho"],
            ]}
            onChange={(value) => patch({ statusFilter: value as CourseStatus | "all" })}
          />

          <select
            value={filters.levelFilter}
            onChange={(e) => patch({ levelFilter: e.target.value as CourseLevel | "all" })}
            className="h-8 rounded-full border bg-background px-3 text-xs"
          >
            <option value="all">Nível</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            value={`${filters.sortField}:${filters.sortAsc ? "asc" : "desc"}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(":");
              patch({
                sortField: field as PracticeSortField,
                sortAsc: dir === "asc",
              });
            }}
            className="h-8 rounded-full border bg-background px-3 text-xs"
          >
            <option value="course:asc">Curso A–Z</option>
            <option value="course:desc">Curso Z–A</option>
            <option value="lesson:asc">Aula A–Z</option>
            <option value="lesson:desc">Aula Z–A</option>
            <option value="items:desc">Mais itens</option>
            <option value="items:asc">Menos itens</option>
            <option value="coverage:desc">Com prática primeiro</option>
            <option value="coverage:asc">Sem prática primeiro</option>
          </select>

          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
              <X className="size-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground xl:ml-auto shrink-0">
          {resultCount} {resultCount === 1 ? "aula encontrada" : "aulas encontradas"}
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
