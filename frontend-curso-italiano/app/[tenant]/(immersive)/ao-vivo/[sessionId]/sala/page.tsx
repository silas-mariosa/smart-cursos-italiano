"use client";

import { useParams } from "next/navigation";
import { useLiveSession } from "@/lib/hooks/useLiveSessions";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { MeetRoom } from "@/components/lms/meet-room";

export default function LiveRoomPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const sessionId = params.sessionId as string;
  const { persona } = useDemoStudent();
  const session = useLiveSession(sessionId);

  if (!session || !persona) {
    return null;
  }

  return (
    <MeetRoom
      session={session}
      tenantSlug={tenantSlug}
      studentName={persona.name}
      studentAvatar={persona.avatar}
    />
  );
}
