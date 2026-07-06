"use client";

import { useMemo, useState } from "react";
import type { LiveSession, LiveSessionType } from "@lms-mocks/practice-types";
import type { StudentProfile } from "@lms-mocks/types";
import { useMockStore } from "@/lib/mock-store";
import {
  getPlanLabel,
  studentEligibleForLiveSession,
  studentMatchesLiveFilters,
} from "@/lib/live-session/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, UserPlus } from "lucide-react";

interface InviteStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: LiveSession;
  onAdd: (students: StudentProfile[]) => void;
}

export function InviteStudentsDialog({
  open,
  onOpenChange,
  session,
  onAdd,
}: InviteStudentsDialogProps) {
  const { students, courses, planTemplates, tenant } = useMockStore();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>(session.courseId);
  const [typeFilter, setTypeFilter] = useState<LiveSessionType | "all">("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const participantIds = useMemo(
    () => new Set(session.participants.map((p) => p.id)),
    [session.participants],
  );

  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);
  const tenantPlans = planTemplates.filter((t) => t.tenantId === tenant.id && t.active);

  const availableStudents = useMemo(() => {
    return students
      .filter((s) => !participantIds.has(s.id))
      .filter((s) => {
        const q = search.trim().toLowerCase();
        if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
        return studentMatchesLiveFilters(
          s,
          session,
          {
            courseId: courseFilter as string | "all",
            sessionType: typeFilter,
            planTemplateId: planFilter as string | "all",
          },
        );
      });
  }, [students, participantIds, search, courseFilter, typeFilter, planFilter, session, tenantPlans]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleAddSelected() {
    const toAdd = students.filter((s) => selectedIds.includes(s.id));
    onAdd(toAdd);
    setSelectedIds([]);
    onOpenChange(false);
  }

  function resetOnClose(next: boolean) {
    if (!next) {
      setSearch("");
      setSelectedIds([]);
      setCourseFilter(session.courseId);
      setTypeFilter("all");
      setPlanFilter("all");
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={resetOnClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Convocar alunos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Módulo / curso</label>
              <select
                className="w-full border rounded-md px-2 py-1.5 text-sm"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                {tenantCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tipo de aula</label>
              <select
                className="w-full border rounded-md px-2 py-1.5 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as LiveSessionType | "all")}
              >
                <option value="all">Todos elegíveis</option>
                <option value="group">Grupo</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Plano</label>
              <select
                className="w-full border rounded-md px-2 py-1.5 text-sm"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                {tenantPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Mostrando alunos com plano que inclui lives ({session.sessionType === "group" ? "grupo" : "individual"}).
          </p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg divide-y max-h-64">
          {availableStudents.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              Nenhum aluno elegível com os filtros selecionados.
            </p>
          ) : (
            availableStudents.map((student) => {
              const eligible = studentEligibleForLiveSession(student, session);
              return (
                <label
                  key={student.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => toggleSelect(student.id)}
                    disabled={!eligible}
                  />
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{student.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {getPlanLabel(student, tenantPlans)}
                  </Badge>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => resetOnClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddSelected} disabled={selectedIds.length === 0}>
            Adicionar {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
