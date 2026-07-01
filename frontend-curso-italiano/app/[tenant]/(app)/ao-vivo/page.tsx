"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Clock, Video, Users } from "lucide-react";
import { useLiveSessions, useActiveLiveSession } from "@/lib/hooks/useLiveSessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LiveSessionsPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const sessions = useLiveSessions().filter(
    (s) => s.status === "waiting" || s.status === "live" || s.status === "scheduled",
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="size-7 text-red-600" />
          Aulas ao vivo
        </h1>
        <p className="text-muted-foreground mt-1">
          Participe das aulas em tempo real com seu professor e colegas de turma.
        </p>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const date = new Date(session.scheduledAt);
          const isWaiting = session.status === "waiting";
          const isLive = session.status === "live";

          return (
            <Card
              key={session.id}
              className={isWaiting || isLive ? "border-red-300 bg-red-50/50" : undefined}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {(isWaiting || isLive) && (
                        <Badge className="bg-red-600 text-white border-0">
                          {isLive ? "AO VIVO" : "Convocado"}
                        </Badge>
                      )}
                      {session.status === "scheduled" && (
                        <Badge variant="secondary">Agendada</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{session.courseTitle}</p>
                  </div>
                  <Avatar className="size-12">
                    <AvatarFallback>{session.instructorAvatar}</AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{session.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {session.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {session.participants.length} participantes
                  </span>
                </div>
                <Link href={`/${tenantSlug}/ao-vivo/${session.id}`}>
                  <Button className={isWaiting || isLive ? "bg-red-600 hover:bg-red-700" : ""}>
                    {isWaiting || isLive ? "Entrar na sala →" : "Ver detalhes"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
