"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Film, Video } from "lucide-react";
import { useTenant } from "@/lib/context/TenantContext";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { useLiveSessions } from "@/lib/hooks/useLiveSessions";
import { useLiveRecordings } from "@/lib/hooks/useLiveRecordings";
import {
  filterStudentLibraryRecordings,
  filterStudentLiveSessions,
  filterStudentSessionReplays,
  studentEnrolledCourseIds,
} from "@/lib/live/student-live-utils";
import { LiveNowBanner } from "@/components/lms/live/live-now-banner";
import { LiveSessionStudentCard } from "@/components/lms/live/live-session-student-card";
import { RecordingsCatalog } from "@/components/lms/live/recordings-catalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface StudentLiveHubProps {
  tenantSlug: string;
  defaultTab?: "aulas" | "gravacoes";
}

export function StudentLiveHub({ tenantSlug, defaultTab = "aulas" }: StudentLiveHubProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "gravacoes" ? "gravacoes" : defaultTab;

  const { tenant } = useTenant();
  const { persona, studentProfile, canAccessFeature } = useDemoStudent();
  const allSessions = useLiveSessions();
  const libraryRecordings = useLiveRecordings(tenant.id);

  const enrolledCourseIds = studentEnrolledCourseIds(studentProfile);
  const studentId = persona?.id;

  const liveSessions = useMemo(
    () => filterStudentLiveSessions(allSessions, tenant.id, studentId, enrolledCourseIds),
    [allSessions, tenant.id, studentId, enrolledCourseIds],
  );

  const activeSession = useMemo(
    () => liveSessions.find((s) => s.status === "live" || s.status === "waiting"),
    [liveSessions],
  );

  const upcomingSessions = useMemo(
    () => liveSessions.filter((s) => s.id !== activeSession?.id),
    [liveSessions, activeSession],
  );

  const replays = useMemo(
    () => filterStudentSessionReplays(allSessions, tenant.id, studentId, enrolledCourseIds),
    [allSessions, tenant.id, studentId, enrolledCourseIds],
  );

  const library = useMemo(
    () => filterStudentLibraryRecordings(libraryRecordings, tenant.id, enrolledCourseIds),
    [libraryRecordings, tenant.id, enrolledCourseIds],
  );

  const canSeeLive = canAccessFeature("liveParticipation");
  const canSeeRecordings = canAccessFeature("liveRecordings");
  const recordingCount = replays.length + library.length;
  const resolvedTab =
    initialTab === "gravacoes" && canSeeRecordings
      ? "gravacoes"
      : canSeeLive
        ? "aulas"
        : canSeeRecordings
          ? "gravacoes"
          : "aulas";

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Video className="size-7 text-red-600" />
          Aulas ao vivo
        </h1>
        <p className="mt-1 text-muted-foreground">
          Participe das aulas em tempo real e acesse gravações disponibilizadas pela escola.
        </p>
      </div>

      {activeSession && <LiveNowBanner session={activeSession} tenantSlug={tenantSlug} />}

      <Tabs defaultValue={resolvedTab} key={resolvedTab} className="w-full">
        <TabsList
          className={
            canSeeLive && canSeeRecordings
              ? "grid w-full max-w-md grid-cols-2"
              : "inline-flex w-full max-w-md"
          }
        >
          {canSeeLive && (
          <TabsTrigger value="aulas" className="gap-2">
            <CalendarDays className="size-4" />
            Minhas aulas
            {liveSessions.length > 0 && (
              <span className="text-xs opacity-70">({liveSessions.length})</span>
            )}
          </TabsTrigger>
          )}
          {canSeeRecordings && (
          <TabsTrigger value="gravacoes" className="gap-2">
            <Film className="size-4" />
            Gravações
            {canSeeRecordings && recordingCount > 0 && (
              <span className="text-xs opacity-70">({recordingCount})</span>
            )}
          </TabsTrigger>
          )}
        </TabsList>

        {canSeeLive && (
        <TabsContent value="aulas" className="space-y-6">
          {liveSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-2">
                <CalendarDays className="mx-auto size-10 text-muted-foreground/50" />
                <p className="font-medium">Nenhuma aula agendada</p>
                <p className="text-sm text-muted-foreground">
                  Quando seu professor convocar você para uma live, ela aparecerá aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.length > 0 && activeSession && (
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Próximas aulas
                </h2>
              )}
              {(activeSession ? upcomingSessions : liveSessions).map((session) => (
                <LiveSessionStudentCard key={session.id} session={session} tenantSlug={tenantSlug} />
              ))}
            </div>
          )}
        </TabsContent>
        )}

        {canSeeRecordings && (
        <TabsContent value="gravacoes">
          <RecordingsCatalog replays={replays} library={library} />
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
