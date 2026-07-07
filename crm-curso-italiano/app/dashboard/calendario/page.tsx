"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Plus } from "lucide-react";
import type { LiveSession, LiveSessionType } from "@lms-mocks/practice-types";
import { useMockStore } from "@/lib/mock-store";
import { LiveSessionFormDialog } from "@/components/lms/live/live-session-form-dialog";
import { LiveSessionEventDialog } from "@/components/lms/live/live-session-event-dialog";
import { LiveSessionsCalendar } from "@/components/lms/live/live-sessions-calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusLegend = [
  { key: "scheduled" as const, label: "Agendada", className: "bg-slate-500" },
  { key: "waiting" as const, label: "Convocada", className: "bg-amber-500" },
  { key: "live" as const, label: "Ao vivo", className: "bg-red-600" },
  { key: "ended" as const, label: "Encerrada", className: "bg-emerald-600" },
];

export default function LiveCalendarPage() {
  const router = useRouter();
  const { liveSessions, courses, tenant } = useMockStore();
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<LiveSessionType | "all">("all");

  const [formOpen, setFormOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [createInitialDate, setCreateInitialDate] = useState<Date | undefined>();

  const tenantSessions = useMemo(
    () =>
      liveSessions
        .filter((s) => s.tenantId === tenant.id)
        .filter((s) => courseFilter === "all" || s.courseId === courseFilter)
        .filter((s) => typeFilter === "all" || s.sessionType === typeFilter),
    [liveSessions, tenant.id, courseFilter, typeFilter],
  );

  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);

  function openCreate(date?: Date) {
    setEditingSession(null);
    setCreateInitialDate(date);
    setFormOpen(true);
  }

  function openEvent(session: LiveSession) {
    setSelectedSession(session);
    setEventOpen(true);
  }

  function openEdit(session: LiveSession) {
    setEditingSession(session);
    setCreateInitialDate(undefined);
    setFormOpen(true);
  }

  function handleSaved(sessionId: string, mode: "create" | "edit") {
    if (mode === "create") {
      router.push(`/dashboard/ao-vivo/${sessionId}`);
    }
  }

  const currentEditing = editingSession
    ? liveSessions.find((s) => s.id === editingSession.id) ?? editingSession
    : null;

  const currentSelected = selectedSession
    ? liveSessions.find((s) => s.id === selectedSession.id) ?? selectedSession
    : null;

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[480px] flex-col gap-3 overflow-hidden sm:gap-4 lg:h-[calc(100dvh-8rem)]">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Calendar className="size-6 shrink-0 text-red-600 sm:size-7" />
            <span className="truncate">Calendário de aulas</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Clique em um horário vazio para agendar ou em uma aula para ver os detalhes.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" onClick={() => openCreate()}>
            <Plus className="mr-2 size-4" />
            Nova aula
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/ao-vivo">Sessões</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/ao-vivo/gravacoes">Gravações</Link>
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:w-auto sm:min-w-[180px]"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="all">Todos os cursos</option>
          {tenantCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:w-auto sm:min-w-[180px]"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as LiveSessionType | "all")}
        >
          <option value="all">Grupo e individual</option>
          <option value="group">Grupo</option>
          <option value="individual">Individual</option>
        </select>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {statusLegend.map((item) => (
            <Badge key={item.key} variant="outline" className="gap-1.5 font-normal">
              <span className={`size-2 rounded-full ${item.className}`} />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>

      <LiveSessionsCalendar
        sessions={tenantSessions}
        onCreateSession={openCreate}
        onSessionClick={openEvent}
        className="min-h-0 flex-1"
      />

      <LiveSessionEventDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        session={currentSelected}
        onEdit={openEdit}
      />

      <LiveSessionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        session={currentEditing}
        initialDate={createInitialDate}
        onSaved={handleSaved}
      />
    </div>
  );
}
