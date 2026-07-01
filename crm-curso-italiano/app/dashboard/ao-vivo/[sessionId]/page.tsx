"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, Radio, Users, Video, VideoOff } from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { studentProfiles } from "@lms-mocks/students";
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
  } = useMockStore();

  const session = liveSessions.find((s) => s.id === sessionId);
  const frontendBase = `http://localhost:3000/${tenant.slug}`;

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

  const activeSession = session;

  const studentParticipants = activeSession.participants.filter((p) => p.role === "student");
  const availableStudents = studentProfiles.filter(
    (s) => !activeSession.participants.some((p) => p.id === s.id),
  );

  function addParticipant(student: (typeof studentProfiles)[0]) {
    updateLiveSession({
      ...activeSession,
      participants: [
        ...activeSession.participants,
        {
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          role: "student",
          isMuted: true,
          isCameraOn: false,
        },
      ],
    });
  }

  function removeParticipant(participantId: string) {
    updateLiveSession({
      ...activeSession,
      participants: activeSession.participants.filter((p) => p.id !== participantId),
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/dashboard/ao-vivo" className="text-xs text-primary hover:underline">
          ← Aulas ao vivo
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <Badge
              className={activeSession.status === "live" ? "bg-red-600 text-white border-0" : undefined}
              variant="secondary"
            >
              {statusLabels[activeSession.status]}
            </Badge>
            <h1 className="text-2xl font-bold">{activeSession.title}</h1>
            <p className="text-muted-foreground">{activeSession.courseTitle}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações da sessão</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {activeSession.status === "scheduled" && (
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => convokeSession(activeSession.id)}>
              <Radio className="size-4 mr-2" />
              Convocar alunos
            </Button>
          )}
          {(activeSession.status === "waiting" || activeSession.status === "scheduled") && (
            <Button onClick={() => startLiveSession(activeSession.id)}>
              <Video className="size-4 mr-2" />
              Iniciar aula
            </Button>
          )}
          {activeSession.status === "live" && (
            <Button variant="outline" onClick={() => endLiveSession(activeSession.id)}>
              <VideoOff className="size-4 mr-2" />
              Encerrar aula
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4" />
            Participantes ({activeSession.participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {activeSession.participants.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
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
          </div>

          {availableStudents.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Convocar alunos</p>
              <div className="flex flex-wrap gap-2">
                {availableStudents.map((student) => (
                  <Button key={student.id} variant="outline" size="sm" onClick={() => addParticipant(student)}>
                    + {student.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {studentParticipants.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum aluno convocado ainda.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links do aluno (frontend)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Lobby / convocação</p>
              <p className="text-xs text-muted-foreground truncate">{frontendBase}/ao-vivo/{activeSession.id}</p>
            </div>
            <a href={`${frontendBase}/ao-vivo/${activeSession.id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="size-4 mr-1" />
                Abrir
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Sala ao vivo</p>
              <p className="text-xs text-muted-foreground truncate">
                {frontendBase}/ao-vivo/{activeSession.id}/sala
              </p>
            </div>
            <a href={`${frontendBase}/ao-vivo/${activeSession.id}/sala`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="size-4 mr-1" />
                Abrir
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <strong>Tópico:</strong> {activeSession.topic}
        </p>
        <p>
          <strong>Código Meet:</strong> {activeSession.meetCode}
        </p>
        <p>{activeSession.description}</p>
      </div>
    </div>
  );
}
