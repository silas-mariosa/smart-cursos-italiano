"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveSession, LiveSessionRecurrenceUnit, LiveSessionType } from "@lms-mocks/practice-types";
import { useMockStore } from "@/lib/mock-store";
import {
  defaultScheduleFields,
  formatSessionSchedule,
  scheduleFromIso,
  toScheduledIso,
} from "@/lib/live-session/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const recurrenceUnitLabels: Record<LiveSessionRecurrenceUnit, string> = {
  day: "dia(s)",
  week: "semana(s)",
  month: "mês(es)",
};

interface LiveSessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sessão existente para edição */
  session?: LiveSession | null;
  /** Pré-preenche data/hora ao criar a partir do calendário */
  initialDate?: Date;
  onSaved?: (sessionId: string, mode: "create" | "edit") => void;
}

export function LiveSessionFormDialog({
  open,
  onOpenChange,
  session,
  initialDate,
  onSaved,
}: LiveSessionFormDialogProps) {
  const { courses, persona, tenant, liveSessions, createLiveSession, updateLiveSession, toggleSessionRecordingPublished } =
    useMockStore();

  const isEdit = !!session;
  const liveSession = session ? liveSessions.find((s) => s.id === session.id) ?? session : null;
  const isEnded = liveSession?.status === "ended";

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [sessionType, setSessionType] = useState<LiveSessionType>("group");
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState("1");
  const [repeatUnit, setRepeatUnit] = useState<LiveSessionRecurrenceUnit>("week");
  const [repeatOccurrences, setRepeatOccurrences] = useState("4");
  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);

  useEffect(() => {
    if (!open) return;
    if (session) {
      setTitle(session.title);
      setTopic(session.topic);
      setDescription(session.description);
      setCourseId(session.courseId);
      setDurationMinutes(String(session.durationMinutes));
      const sched = scheduleFromIso(session.scheduledAt);
      setScheduleDate(sched.date);
      setScheduleTime(sched.time);
      setSessionType(session.sessionType);
      setRepeatEnabled(false);
    } else {
      const defaults = defaultScheduleFields(initialDate);
      setTitle("");
      setTopic("");
      setDescription("");
      setCourseId(tenantCourses[0]?.id ?? "");
      setDurationMinutes("45");
      setScheduleDate(defaults.date);
      setScheduleTime(defaults.time);
      setSessionType("group");
      setRepeatEnabled(false);
      setRepeatInterval("1");
      setRepeatUnit("week");
      setRepeatOccurrences("4");
    }
  }, [open, session, initialDate, tenantCourses]);

  function handleSubmit() {
    if (!title.trim() || !courseId || !scheduleDate || !scheduleTime) return;
    const course = tenantCourses.find((c) => c.id === courseId);
    if (!course) return;

    if (isEdit && session) {
      updateLiveSession({
        ...session,
        title: title.trim(),
        topic: topic.trim() || title.trim(),
        description: description.trim() || session.description,
        courseId: course.id,
        courseTitle: course.title,
        scheduledAt: toScheduledIso(scheduleDate, scheduleTime),
        durationMinutes: Number(durationMinutes) || 45,
        sessionType,
      });
      onSaved?.(session.id, "edit");
      onOpenChange(false);
      return;
    }

    const interval = Number(repeatInterval) || 1;
    const occurrences = Number(repeatOccurrences) || 4;
    const created = createLiveSession({
      tenantId: tenant.id,
      courseId: course.id,
      courseTitle: course.title,
      title: title.trim(),
      description: description.trim() || "Nova aula ao vivo",
      instructorName: persona?.name ?? "Professor",
      instructorAvatar: persona?.avatar ?? "PR",
      scheduledAt: toScheduledIso(scheduleDate, scheduleTime),
      durationMinutes: Number(durationMinutes) || 45,
      status: "scheduled",
      meetCode: `studio-${Date.now().toString(36)}`,
      topic: topic.trim() || title.trim(),
      sessionType,
      recordingPublished: false,
      recurrence: repeatEnabled ? { interval, unit: repeatUnit } : undefined,
      recurrenceOccurrences: repeatEnabled ? occurrences : undefined,
    });
    onSaved?.(created.id, "create");
    onOpenChange(false);
  }

  const editSchedule =
    isEdit && liveSession
      ? formatSessionSchedule(liveSession.scheduledAt, liveSession.durationMinutes)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar aula ao vivo" : "Nova aula ao vivo"}</DialogTitle>
        </DialogHeader>

        {isEdit && editSchedule && (
          <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Horário atual
            </p>
            <p className="font-medium capitalize mt-0.5">{editSchedule.dateLabel}</p>
            <p className="text-muted-foreground">
              {editSchedule.timeRangeLabel} · {editSchedule.durationLabel}
            </p>
          </div>
        )}

        {isEnded && liveSession && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
            <p className="text-sm font-medium">Gravação da aula encerrada</p>
            <div className="flex items-center justify-between gap-2">
              <Badge variant={liveSession.recordingPublished ? "default" : "secondary"}>
                {liveSession.recordingPublished ? "Gravação pública" : "Gravação oculta"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSessionRecordingPublished(liveSession.id)}
              >
                {liveSession.recordingPublished ? "Ocultar gravação" : "Publicar gravação"}
              </Button>
            </div>
            {liveSession.recordingUrl && (
              <p className="text-xs text-muted-foreground truncate">{liveSession.recordingUrl}</p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Conversação no café" />
          </div>
          <div className="space-y-2">
            <Label>Tópico</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tema da aula" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Curso</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={isEdit && isEnded}
            >
              {tenantCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                min={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as LiveSessionType)}
              >
                <option value="group">Grupo</option>
                <option value="individual">Individual</option>
              </select>
            </div>
          </div>

          {!isEdit && (
            <div className="rounded-lg border p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatEnabled}
                  onChange={(e) => setRepeatEnabled(e.target.checked)}
                />
                Repetir aula
              </label>
              {repeatEnabled && (
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(e.target.value)}
                  />
                  <select
                    className="border rounded-md px-2 py-2 text-sm"
                    value={repeatUnit}
                    onChange={(e) => setRepeatUnit(e.target.value as LiveSessionRecurrenceUnit)}
                  >
                    {(Object.keys(recurrenceUnitLabels) as LiveSessionRecurrenceUnit[]).map((u) => (
                      <option key={u} value={u}>
                        {recurrenceUnitLabels[u]}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={2}
                    max={12}
                    value={repeatOccurrences}
                    onChange={(e) => setRepeatOccurrences(e.target.value)}
                    title="Ocorrências"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !courseId}>
            {isEdit ? "Salvar alterações" : "Agendar aula"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
