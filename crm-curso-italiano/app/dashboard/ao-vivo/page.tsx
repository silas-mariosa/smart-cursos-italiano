"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Plus, Repeat, Users, Video } from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { getStudentGroupsForCourse } from "@lms-mocks/student-groups";
import type { LiveSessionRecurrenceUnit } from "@lms-mocks/practice-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusLabels = {
  scheduled: "Agendada",
  waiting: "Convocada",
  live: "Ao vivo",
  ended: "Encerrada",
} as const;

const recurrenceUnitLabels: Record<LiveSessionRecurrenceUnit, string> = {
  day: "dia(s)",
  week: "semana(s)",
  month: "mês(es)",
};

function defaultScheduleFields() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

function toScheduledIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function LiveSessionsCrmPage() {
  const { liveSessions, courses, students, persona, tenant, convokeSession, createLiveSession } =
    useMockStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [scheduleDate, setScheduleDate] = useState(defaultScheduleFields().date);
  const [scheduleTime, setScheduleTime] = useState(defaultScheduleFields().time);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState("1");
  const [repeatUnit, setRepeatUnit] = useState<LiveSessionRecurrenceUnit>("week");
  const [repeatOccurrences, setRepeatOccurrences] = useState("4");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const sorted = [...liveSessions].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  const courseStudents = useMemo(
    () => students.filter((s) => s.enrollments.some((e) => e.courseId === courseId)),
    [students, courseId],
  );

  const courseGroups = useMemo(
    () => getStudentGroupsForCourse(tenant.id, courseId),
    [tenant.id, courseId],
  );

  function resetForm() {
    const defaults = defaultScheduleFields();
    setTitle("");
    setTopic("");
    setDescription("");
    setCourseId(courses[0]?.id ?? "");
    setDurationMinutes("45");
    setScheduleDate(defaults.date);
    setScheduleTime(defaults.time);
    setRepeatEnabled(false);
    setRepeatInterval("1");
    setRepeatUnit("week");
    setRepeatOccurrences("4");
    setSelectedStudentIds([]);
  }

  function toggleStudent(studentId: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  }

  function toggleGroup(groupStudentIds: string[]) {
    const allSelected = groupStudentIds.every((id) => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !groupStudentIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => [...new Set([...prev, ...groupStudentIds])]);
    }
  }

  function isGroupSelected(groupStudentIds: string[]) {
    return groupStudentIds.length > 0 && groupStudentIds.every((id) => selectedStudentIds.includes(id));
  }

  function handleCreate() {
    if (!title.trim() || !courseId || !scheduleDate || !scheduleTime) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const interval = Number(repeatInterval) || 1;
    const occurrences = Number(repeatOccurrences) || 4;

    const session = createLiveSession({
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
      sessionType: selectedStudentIds.length <= 1 ? "individual" : "group",
      recordingPublished: false,
      invitedStudentIds: selectedStudentIds,
      recurrence: repeatEnabled
        ? { interval, unit: repeatUnit }
        : undefined,
      recurrenceOccurrences: repeatEnabled ? occurrences : undefined,
    });

    setOpen(false);
    resetForm();
    window.location.href = `/dashboard/ao-vivo/${session.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="size-7 text-red-600" />
            Aulas ao vivo
          </h1>
          <p className="text-muted-foreground mt-1">
            Agende, convoque alunos e gerencie sessões em tempo real.
          </p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/ao-vivo/calendario">Calendário</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/ao-vivo/gravacoes">Gravações</Link>
            </Button>
          </div>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="size-4 mr-2" />
              Nova sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar aula ao vivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Conversação no café"
                />
              </div>
              <div>
                <Label>Tópico</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Ordinare al bar"
                />
              </div>
              <div>
                <Label>Curso</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setSelectedStudentIds([]);
                  }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data de início</Label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  min={15}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repeatEnabled}
                    onChange={(e) => setRepeatEnabled(e.target.checked)}
                    className="rounded border"
                  />
                  <Repeat className="size-4 text-muted-foreground" />
                  Repetir sessão
                </label>
                {repeatEnabled && (
                  <div className="grid grid-cols-3 gap-2 pl-6">
                    <div>
                      <Label className="text-xs">A cada</Label>
                      <Input
                        type="number"
                        min={1}
                        value={repeatInterval}
                        onChange={(e) => setRepeatInterval(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Período</Label>
                      <select
                        className="w-full rounded-md border px-2 py-2 text-sm"
                        value={repeatUnit}
                        onChange={(e) => setRepeatUnit(e.target.value as LiveSessionRecurrenceUnit)}
                      >
                        <option value="day">Dias</option>
                        <option value="week">Semanas</option>
                        <option value="month">Meses</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Ocorrências</Label>
                      <Input
                        type="number"
                        min={2}
                        max={52}
                        value={repeatOccurrences}
                        onChange={(e) => setRepeatOccurrences(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Participantes</Label>
                <p className="text-xs text-muted-foreground">
                  {selectedStudentIds.length > 0
                    ? `${selectedStudentIds.length} aluno(s) selecionado(s)`
                    : "Opcional — você pode convocar alunos depois"}
                </p>
                <Tabs defaultValue="students">
                  <TabsList className="w-full">
                    <TabsTrigger value="students" className="flex-1">
                      Alunos
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="flex-1">
                      Grupos
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="students">
                    <ScrollArea className="h-36 rounded-md border">
                      <div className="p-2 space-y-1">
                        {courseStudents.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-2">
                            Nenhum aluno matriculado neste curso.
                          </p>
                        ) : (
                          courseStudents.map((student) => (
                            <label
                              key={student.id}
                              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(student.id)}
                                onChange={() => toggleStudent(student.id)}
                                className="rounded border"
                              />
                              <span>{student.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="groups">
                    <ScrollArea className="h-36 rounded-md border">
                      <div className="p-2 space-y-1">
                        {courseGroups.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-2">Nenhum grupo disponível.</p>
                        ) : (
                          courseGroups.map((group) => (
                            <label
                              key={group.id}
                              className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isGroupSelected(group.studentIds)}
                                onChange={() => toggleGroup(group.studentIds)}
                                className="rounded border mt-0.5"
                              />
                              <span>
                                <span className="font-medium">{group.name}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {group.studentIds.length} aluno(s)
                                  {group.description ? ` · ${group.description}` : ""}
                                </span>
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleCreate} disabled={!title.trim() || !courseId}>
                Criar sessão
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sorted.map((session) => {
          const date = new Date(session.scheduledAt);
          const isActive = session.status === "waiting" || session.status === "live";
          const studentCount = session.participants.filter((p) => p.role === "student").length;

          return (
            <Card key={session.id} className={isActive ? "border-red-300 bg-red-50/40" : undefined}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={isActive ? "bg-red-600 text-white border-0" : undefined} variant="secondary">
                        {statusLabels[session.status]}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{session.courseTitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{session.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {date.toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                    {session.durationMinutes} min
                  </span>
                  {session.recurrence && (
                    <span className="flex items-center gap-1">
                      <Repeat className="size-4" />
                      A cada {session.recurrence.interval} {recurrenceUnitLabels[session.recurrence.unit]}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {studentCount > 0 ? `${studentCount} aluno(s)` : `${session.participants.length} participantes`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/ao-vivo/${session.id}`}>
                    <Button variant="outline" size="sm">
                      Gerenciar
                    </Button>
                  </Link>
                  {session.status === "scheduled" && (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => convokeSession(session.id)}>
                      Convocar alunos
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
