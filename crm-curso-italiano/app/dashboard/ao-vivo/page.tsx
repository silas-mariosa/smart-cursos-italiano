"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Plus, Users, Video } from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function LiveSessionsCrmPage() {
  const { liveSessions, courses, persona, tenant, convokeSession, createLiveSession } = useMockStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [durationMinutes, setDurationMinutes] = useState("45");

  const sorted = [...liveSessions].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  function handleCreate() {
    if (!title.trim() || !courseId) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const session = createLiveSession({
      tenantId: tenant.id,
      courseId: course.id,
      courseTitle: course.title,
      title: title.trim(),
      description: description.trim() || "Nova aula ao vivo",
      instructorName: persona?.name ?? "Professor",
      instructorAvatar: persona?.avatar ?? "PR",
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      durationMinutes: Number(durationMinutes) || 45,
      status: "scheduled",
      meetCode: `studio-${Date.now().toString(36)}`,
      topic: topic.trim() || title.trim(),
    });

    setOpen(false);
    setTitle("");
    setTopic("");
    setDescription("");
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
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="size-4 mr-2" />
              Nova sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar aula ao vivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Conversação no café" />
              </div>
              <div>
                <Label>Tópico</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: Ordinare al bar" />
              </div>
              <div>
                <Label>Curso</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleCreate}>
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
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {session.participants.length} participantes
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
