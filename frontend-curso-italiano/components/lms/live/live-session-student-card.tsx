"use client";

import Link from "next/link";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";
import type { LiveSession } from "@lms-mocks/practice-types";
import {
  formatLiveSessionDate,
  formatLiveSessionTime,
  getLiveSessionJoinHref,
} from "@/lib/live/student-live-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LiveSessionStudentCardProps {
  session: LiveSession;
  tenantSlug: string;
}

export function LiveSessionStudentCard({ session, tenantSlug }: LiveSessionStudentCardProps) {
  const isWaiting = session.status === "waiting";
  const isLive = session.status === "live";
  const isActive = isWaiting || isLive;
  const joinHref = getLiveSessionJoinHref(tenantSlug, session);
  const detailHref = `/${tenantSlug}/ao-vivo/${session.id}`;

  return (
    <Card className={isActive ? "border-red-300 bg-red-50/40" : undefined}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {isLive && (
                <Badge className="border-0 bg-red-600 text-white">AO VIVO</Badge>
              )}
              {isWaiting && (
                <Badge className="border-0 bg-red-600 text-white">Convocado</Badge>
              )}
              {session.status === "scheduled" && (
                <Badge variant="secondary">Agendada</Badge>
              )}
              {session.sessionType === "individual" && (
                <Badge variant="outline">Individual</Badge>
              )}
            </div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{session.courseTitle}</p>
          </div>
          <Avatar className="size-12 shrink-0">
            <AvatarFallback>{session.instructorAvatar}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-2">{session.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-4 shrink-0" />
            {formatLiveSessionDate(session.scheduledAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4 shrink-0" />
            {formatLiveSessionTime(session.scheduledAt)} · {session.durationMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-4 shrink-0" />
            {session.participants.filter((p) => p.role === "student").length} alunos
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {isActive ? (
            <Link href={joinHref}>
              <Button className="bg-red-600 hover:bg-red-700">
                {isLive ? "Participar agora" : "Entrar na sala"}
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <Link href={detailHref}>
              <Button>Ver detalhes</Button>
            </Link>
          )}
          {isActive && (
            <Link href={detailHref}>
              <Button variant="outline" size="default">
                Ver lobby
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
