"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Plus, Video } from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LiveRecordingsPage() {
  const {
    tenant,
    courses,
    liveSessions,
    liveRecordings,
    addLiveRecording,
    toggleLiveRecordingPublished,
    toggleSessionRecordingPublished,
  } = useMockStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [courseId, setCourseId] = useState("");

  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);
  const sessionReplays = liveSessions.filter(
    (s) => s.tenantId === tenant.id && s.status === "ended" && s.recordingUrl,
  );
  const library = liveRecordings.filter((r) => r.tenantId === tenant.id);

  function handleAddLibrary() {
    if (!title.trim() || !videoUrl.trim()) return;
    const course = tenantCourses.find((c) => c.id === courseId);
    addLiveRecording({
      tenantId: tenant.id,
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      durationMinutes: Number(durationMinutes) || 45,
      published: false,
      source: "library",
      courseId: course?.id,
      courseTitle: course?.title,
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    setVideoUrl("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Film className="size-7 text-red-600" />
            Lives gravadas
          </h1>
          <p className="text-muted-foreground mt-1">
            Replay de sessões encerradas e biblioteca de conteúdo assíncrono.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/ao-vivo">Sessões</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/ao-vivo/calendario">Calendário</Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-2" />
                Nova gravação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar à biblioteca</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>URL do vídeo</Label>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Curso (opcional)</Label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                    >
                      <option value="">—</option>
                      {tenantCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddLibrary} disabled={!title.trim() || !videoUrl.trim()}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Video className="size-5" />
          Replay de sessões
        </h2>
        {sessionReplays.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Nenhuma sessão encerrada com gravação disponível.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sessionReplays.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{s.courseTitle}</p>
                  <p>{new Date(s.scheduledAt).toLocaleDateString("pt-BR")}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.recordingPublished ? "default" : "secondary"}>
                      {s.recordingPublished ? "Publicada" : "Rascunho"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSessionRecordingPublished(s.id)}
                    >
                      {s.recordingPublished ? "Despublicar" : "Publicar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Film className="size-5" />
          Biblioteca assíncrona
        </h2>
        {library.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Biblioteca vazia. Adicione gravações pré-produzidas.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {library.map((r) => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{r.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {r.description && <p className="text-muted-foreground">{r.description}</p>}
                  {r.courseTitle && <p>{r.courseTitle}</p>}
                  <p>{r.durationMinutes} min</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.published ? "default" : "secondary"}>
                      {r.published ? "Publicada" : "Rascunho"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => toggleLiveRecordingPublished(r.id)}>
                      {r.published ? "Despublicar" : "Publicar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
