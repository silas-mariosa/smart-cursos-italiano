"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Exercise, ExerciseType } from "@lms-mocks/types";
import {
  getExercisePromptText,
  getExerciseUsageInCourses,
  resolveExerciseGamification,
} from "@lms-mocks/exercises";
import { useMockStore } from "@/lib/mock-store";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  FILTER_TYPES,
  TYPE_COLORS,
  TYPE_LABELS,
  TYPE_SHORT,
} from "@/lib/exercise-bank/constants";
import { ExerciseFormDialog } from "./exercise-form-dialog";
import { ExercisePreview } from "./exercise-preview";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Copy,
  Eye,
  HelpCircle,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";

interface ExerciseBankPanelProps {
  variant?: "full" | "compact";
  showHeader?: boolean;
}

export function ExerciseBankPanel({ variant = "full", showHeader = true }: ExerciseBankPanelProps) {
  const { exercises, courses, tenant, addExercise, updateExercise, deleteExercise, duplicateExercise } =
    useMockStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const byType = exercises.reduce(
      (acc, ex) => {
        acc[ex.type] = (acc[ex.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<ExerciseType, number>,
    );
    const totalXp = exercises.reduce((sum, ex) => sum + resolveExerciseGamification(ex).xpReward, 0);
    const manualGrading = exercises.filter((ex) => ex.type === "written_response").length;
    const inUse = exercises.filter((ex) => getExerciseUsageInCourses(ex.id, courses).length > 0).length;
    return { total: exercises.length, byType, totalXp, manualGrading, inUse };
  }, [exercises, courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (typeFilter !== "all" && ex.type !== typeFilter) return false;
      if (!q) return true;
      const gamification = resolveExerciseGamification(ex);
      return (
        ex.title.toLowerCase().includes(q) ||
        ex.id.toLowerCase().includes(q) ||
        getExercisePromptText(ex).toLowerCase().includes(q) ||
        gamification.tags.some((t) => t.includes(q))
      );
    });
  }, [exercises, search, typeFilter]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(exercise: Exercise) {
    setEditing(exercise);
    setFormOpen(true);
  }

  function handleSave(input: Parameters<typeof addExercise>[0] | Parameters<typeof updateExercise>[0]) {
    if ("id" in input && input.id) {
      updateExercise(input as Parameters<typeof updateExercise>[0]);
    } else {
      addExercise(input as Parameters<typeof addExercise>[0]);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const result = deleteExercise(deleteTarget.id);
    if (!result.ok) {
      setDeleteError(result.error ?? "Não foi possível excluir.");
      return;
    }
    setDeleteTarget(null);
    setDeleteError(null);
  }

  const isCompact = variant === "compact";

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className={cn("font-bold flex items-center gap-2", isCompact ? "text-xl" : "text-2xl")}>
              <HelpCircle className={cn("text-primary", isCompact ? "size-6" : "size-7")} />
              Banco de questões
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Crie, organize e gamifique exercícios reutilizáveis em qualquer aula.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled title="Disponível na Fase 2">
              <Sparkles className="size-4 mr-2" />
              Gerar com IA
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4 mr-2" />
              Nova questão
            </Button>
          </div>
        </div>
      )}

      {!isCompact && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Em uso" value={stats.inUse} hint="vinculadas a aulas" />
          <StatCard label="Redações" value={stats.manualGrading} hint="correção manual" />
          <StatCard label="XP configurado" value={stats.totalXp} icon={<Trophy className="size-4 text-amber-600" />} />
          <StatCard
            label="Tipos"
            value={Object.keys(stats.byType).length}
            hint={Object.entries(stats.byType)
              .map(([t, n]) => `${TYPE_SHORT[t as ExerciseType]}: ${n}`)
              .join(" · ")}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título, enunciado, ID ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                "text-xs px-3 py-2 rounded-full border transition-colors whitespace-nowrap",
                typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
              )}
            >
              {t === "all" ? "Todos" : TYPE_SHORT[t as ExerciseType]}
            </button>
          ))}
        </div>
        {!isCompact && (
          <div className="flex border rounded-lg overflow-hidden shrink-0">
            <button
              type="button"
              className={cn("px-3 py-2", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
              aria-label="Lista"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              className={cn("px-3 py-2 border-l", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
              aria-label="Grade"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        )}
      </div>

      {!showHeader && (
        <div className="flex justify-end">
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4 mr-1" />
            Nova questão
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <HelpCircle className="size-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">Nenhuma questão encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || typeFilter !== "all"
                ? "Tente outros filtros ou limpe a busca."
                : "Comece criando sua primeira questão."}
            </p>
            {!search && typeFilter === "all" && (
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="size-4 mr-2" />
                Criar questão
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" && !isCompact ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              courses={courses}
              layout="grid"
              onPreview={() => setPreviewExercise(ex)}
              onEdit={() => openEdit(ex)}
              onDuplicate={() => duplicateExercise(ex.id)}
              onDelete={() => {
                setDeleteError(null);
                setDeleteTarget(ex);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              courses={courses}
              layout="list"
              compact={isCompact}
              onPreview={() => setPreviewExercise(ex)}
              onEdit={() => openEdit(ex)}
              onDuplicate={() => duplicateExercise(ex.id)}
              onDelete={() => {
                setDeleteError(null);
                setDeleteTarget(ex);
              }}
            />
          ))}
        </div>
      )}

      <ExerciseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        exercise={editing}
        tenantId={tenant.id}
        onSave={handleSave}
      />

      <Dialog open={Boolean(previewExercise)} onOpenChange={(open) => !open && setPreviewExercise(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewExercise?.title}</DialogTitle>
          </DialogHeader>
          {previewExercise && <ExercisePreview exercise={previewExercise} />}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir questão?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.title} ({deleteTarget?.id}) será removida permanentemente do banco.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {hint && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function ExerciseCard({
  exercise,
  courses,
  layout,
  compact,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  exercise: Exercise;
  courses: ReturnType<typeof useMockStore>["courses"];
  layout: "list" | "grid";
  compact?: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const gamification = resolveExerciseGamification(exercise);
  const usage = getExerciseUsageInCourses(exercise.id, courses);
  const prompt = getExercisePromptText(exercise);

  return (
    <Card className={cn("group transition-shadow hover:shadow-md", layout === "grid" && "h-full")}>
      <CardContent className={cn("py-4", layout === "grid" && "flex flex-col h-full")}>
        <div className={cn("flex gap-4", layout === "list" ? "items-start justify-between" : "flex-col flex-1")}>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="font-mono text-[10px]">
                {exercise.id}
              </Badge>
              <Badge className={cn("text-[10px]", TYPE_COLORS[exercise.type])}>
                {compact ? TYPE_SHORT[exercise.type] : TYPE_LABELS[exercise.type]}
              </Badge>
              <Badge className={cn("text-[10px]", DIFFICULTY_COLORS[gamification.difficulty])}>
                {DIFFICULTY_LABELS[gamification.difficulty]}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {gamification.xpReward} XP
              </Badge>
            </div>
            <p className="font-semibold">{exercise.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
            <div className="flex flex-wrap gap-1.5">
              {gamification.tags.slice(0, compact ? 2 : 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  #{tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {usage.length === 0 ? (
                "Não vinculada a nenhuma aula"
              ) : (
                <>
                  Usada em {usage.length} aula(s):{" "}
                  {usage.slice(0, 2).map((u) => u.lessonTitle).join(", ")}
                  {usage.length > 2 && ` +${usage.length - 2}`}
                </>
              )}
            </p>
            {usage.length > 0 && layout === "list" && !compact && (
              <div className="flex flex-wrap gap-1">
                {usage.map((u) => (
                  <Link key={u.lessonId} href={`/dashboard/cursos/${u.courseId}/aulas/${u.lessonId}/praticar`}>
                    <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-accent">
                      {u.courseTitle} → {u.lessonTitle}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={cn("flex gap-1 shrink-0", layout === "grid" && "mt-auto pt-3 border-t")}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPreview} title="Preview">
              <Eye className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit} title="Editar">
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onDuplicate} title="Duplicar">
              <Copy className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onDelete} title="Excluir">
              <Trash2 className="size-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
