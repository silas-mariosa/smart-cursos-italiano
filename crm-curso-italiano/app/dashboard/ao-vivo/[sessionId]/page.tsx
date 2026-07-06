"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  Film,
  Pencil,
  Radio,
  UserPlus,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import type { StudentProfile } from "@lms-mocks/types";
import { useMockStore } from "@/lib/mock-store";
import { LiveSessionFormDialog } from "@/components/lms/live/live-session-form-dialog";
import { InviteStudentsDialog } from "@/components/lms/live/invite-students-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusLabels = {
  scheduled: "Agendada",
  waiting: "Convocada",
  live: "Ao vivo",
  ended: "Encerrada",
} as const;

const statusVariant: Record<keyof typeof statusLabels, "default" | "secondary" | "outline"> = {
  scheduled: "secondary",
  waiting: "outline",
  live: "default",
  ended: "secondary",
};

export default function LiveSessionManagePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const {
    liveSessions,
    tenant,
    convokeSession,
    startLiveSession,
    endLiveSession,
    updateLiveSession,
    toggleSessionRecordingPublished,
  } = useMockStore();

  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const session = liveSessions.find((s) => s.id === sessionId);
  const frontendBase =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000/${tenant.slug}`
      : `http://localhost:3000/${tenant.slug}`;

  if (!session) {
    return (
      <div className="space-y-4">
        <p>Sessão não encontrada.</p>
        <Link href="/dashboard/ao-vivo" className="text-primary hover:underline text-sm">
          ← Voltar
        </Link>
      </div>
    );
  }

  const scheduledDate = new Date(session.scheduledAt);
  const studentParticipants = session.participants.filter((p) => p.role === "student");

  function addParticipants(students: StudentProfile[]) {
    const current = liveSessions.find((s) => s.id === sessionId);
    if (!current) return;
    updateLiveSession({
      ...current,
      participants: [
        ...current.participants,
        ...students.map((s) => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          role: "student" as const,
          isMuted: true,
          isCameraOn: false,
        })),
      ],
    });
  }

  function removeParticipant(participantId: string) {
    const current = liveSessions.find((s) => s.id === sessionId);
    if (!current) return;
    updateLiveSession({
      ...current,
      participants: current.participants.filter((p) => p.id !== participantId),
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link href="/dashboard/ao-vivo" className="text-xs text-primary hover:underline">
              ← Aulas ao vivo
            </Link>
            <span className="text-muted-foreground text-xs">·</span>
            <Link href="/dashboard/ao-vivo/calendario" className="text-xs text-primary hover:underline">
              Calendário
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              className={session.status === "live" ? "bg-red-600 text-white border-0" : undefined}
              variant={statusVariant[session.status]}
            >
              {statusLabels[session.status]}
            </Badge>
            <Badge variant="outline">{session.sessionType === "group" ? "Grupo" : "Individual"}</Badge>
            {session.status === "ended" && (
              <Badge variant={session.recordingPublished ? "default" : "secondary"}>
                {session.recordingPublished ? "Gravação pública" : "Gravação oculta"}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-muted-foreground">{session.courseTitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4 mr-2" />
          Editar aula
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Calendar className="size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="text-sm font-medium">
                {scheduledDate.toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "long",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Clock className="size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Horário</p>
              <p className="text-sm font-medium">
                {scheduledDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {session.durationMinutes} min
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Users className="size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Participantes</p>
              <p className="text-sm font-medium">
                {studentParticipants.length} aluno(s) · {session.participants.length} total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ações da sessão</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {session.status === "scheduled" && (
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => convokeSession(session.id)}>
              <Radio className="size-4 mr-2" />
              Convocar alunos
            </Button>
          )}
          {(session.status === "waiting" || session.status === "scheduled") && (
            <Button onClick={() => startLiveSession(session.id)}>
              <Video className="size-4 mr-2" />
              Iniciar aula
            </Button>
          )}
          {session.status === "live" && (
            <Button variant="outline" onClick={() => endLiveSession(session.id)}>
              <VideoOff className="size-4 mr-2" />
              Encerrar aula
            </Button>
          )}
          {session.status === "ended" && (
            <Button variant="outline" onClick={() => toggleSessionRecordingPublished(session.id)}>
              <Film className="size-4 mr-2" />
              {session.recordingPublished ? "Ocultar gravação" : "Publicar gravação"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4" />
            Participantes ({session.participants.length})
          </CardTitle>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4 mr-2" />
            Adicionar alunos
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">{p.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.role === "teacher" ? "Professor" : "Aluno"}
                  </p>
                </div>
              </div>
              {p.role === "student" && (
                <Button variant="ghost" size="sm" onClick={() => removeParticipant(p.id)}>
                  Remover
                </Button>
              )}
            </div>
          ))}

          {studentParticipants.length === 0 && (
            <div className="rounded-lg border border-dashed py-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Nenhum aluno convocado ainda.</p>
              <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-4 mr-2" />
                Convocar alunos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Tópico:</span> {session.topic}
          </p>
          <p>
            <span className="text-muted-foreground">Código:</span> {session.meetCode}
          </p>
          {session.description && (
            <p className="text-muted-foreground pt-1">{session.description}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Links do aluno (frontend)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">Lobby / convocação</p>
              <p className="text-xs text-muted-foreground truncate">
                {frontendBase}/ao-vivo/{session.id}
              </p>
            </div>
            <a href={`${frontendBase}/ao-vivo/${session.id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="size-4 mr-1" />
                Abrir
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">Sala ao vivo</p>
              <p className="text-xs text-muted-foreground truncate">
                {frontendBase}/ao-vivo/{session.id}/sala
              </p>
            </div>
            <a href={`${frontendBase}/ao-vivo/${session.id}/sala`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="size-4 mr-1" />
                Abrir
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <LiveSessionFormDialog open={editOpen} onOpenChange={setEditOpen} session={session} />

      <InviteStudentsDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        session={session}
        onAdd={addParticipants}
      />
    </div>
  );
}
