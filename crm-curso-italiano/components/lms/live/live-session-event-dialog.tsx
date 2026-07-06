"use client";

import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Film,
  Pencil,
  Radio,
  User,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import type { LiveSession } from "@lms-mocks/practice-types";
import { useMockStore } from "@/lib/mock-store";
import { formatSessionSchedule } from "@/lib/live-session/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

interface LiveSessionEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: LiveSession | null;
  onEdit: (session: LiveSession) => void;
}

export function LiveSessionEventDialog({
  open,
  onOpenChange,
  session,
  onEdit,
}: LiveSessionEventDialogProps) {
  const {
    liveSessions,
    convokeSession,
    startLiveSession,
    endLiveSession,
    toggleSessionRecordingPublished,
  } = useMockStore();

  const liveSession = session ? liveSessions.find((s) => s.id === session.id) ?? session : null;

  if (!liveSession) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aula não encontrada</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta aula pode ter sido removida ou não está mais disponível.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const schedule = formatSessionSchedule(liveSession.scheduledAt, liveSession.durationMinutes);
  const studentParticipants = liveSession.participants.filter((p) => p.role === "student");
  const teacher = liveSession.participants.find((p) => p.role === "teacher");

  function handleAction(action: () => void) {
    action();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={liveSession.status === "live" ? "bg-red-600 text-white border-0" : undefined}
              variant={statusVariant[liveSession.status]}
            >
              {statusLabels[liveSession.status]}
            </Badge>
            <Badge variant="outline">
              {liveSession.sessionType === "group" ? "Grupo" : "Individual"}
            </Badge>
            {liveSession.status === "ended" && (
              <Badge variant={liveSession.recordingPublished ? "default" : "secondary"}>
                {liveSession.recordingPublished ? "Gravação pública" : "Gravação oculta"}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl leading-snug">{liveSession.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{liveSession.courseTitle}</p>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data</p>
              <p className="text-sm font-medium capitalize">{schedule.dateLabel}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Horário</p>
              <p className="text-sm font-medium">{schedule.timeRangeLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Duração: {schedule.durationLabel}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <User className="size-3.5" />
              Professor
            </div>
            <p className="text-sm font-medium">{teacher?.name ?? liveSession.instructorName}</p>
          </div>
          <div className="rounded-lg border px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Users className="size-3.5" />
              Participantes
            </div>
            <p className="text-sm font-medium">
              {studentParticipants.length} aluno(s) · {liveSession.participants.length} total
            </p>
          </div>
        </div>

        {studentParticipants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {liveSession.participants.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-full border px-2.5 py-1">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">{p.avatar}</AvatarFallback>
                </Avatar>
                <span className="text-xs">{p.name.split(" ")[0]}</span>
              </div>
            ))}
            {liveSession.participants.length > 6 && (
              <span className="text-xs text-muted-foreground self-center">
                +{liveSession.participants.length - 6}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <BookOpen className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground">Tópico</p>
              <p>{liveSession.topic || "—"}</p>
            </div>
          </div>
          {liveSession.description ? (
            <p className="text-muted-foreground leading-relaxed">{liveSession.description}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">Código da sala: {liveSession.meetCode}</p>
        </div>

        {(liveSession.status === "scheduled" ||
          liveSession.status === "waiting" ||
          liveSession.status === "live" ||
          liveSession.status === "ended") && (
          <div className="flex flex-wrap gap-2">
            {liveSession.status === "scheduled" && (
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleAction(() => convokeSession(liveSession.id))}
              >
                <Radio className="size-4 mr-2" />
                Convocar alunos
              </Button>
            )}
            {(liveSession.status === "waiting" || liveSession.status === "scheduled") && (
              <Button size="sm" onClick={() => handleAction(() => startLiveSession(liveSession.id))}>
                <Video className="size-4 mr-2" />
                Iniciar aula
              </Button>
            )}
            {liveSession.status === "live" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(() => endLiveSession(liveSession.id))}
              >
                <VideoOff className="size-4 mr-2" />
                Encerrar aula
              </Button>
            )}
            {liveSession.status === "ended" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(() => toggleSessionRecordingPublished(liveSession.id))}
              >
                <Film className="size-4 mr-2" />
                {liveSession.recordingPublished ? "Ocultar gravação" : "Publicar gravação"}
              </Button>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onEdit(liveSession);
            }}
          >
            <Pencil className="size-4 mr-2" />
            Editar
          </Button>
          <Button asChild>
            <Link href={`/dashboard/ao-vivo/${liveSession.id}`}>
              <ExternalLink className="size-4 mr-2" />
              Gerenciar aula
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
