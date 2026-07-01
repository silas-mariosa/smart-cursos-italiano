"use client";

import { useEffect, useState } from "react";
import type { LiveSession } from "@lms-mocks/practice-types";
import { seedLiveSessions } from "@lms-mocks/live-sessions";
import { getStoredLiveSessions } from "@lms-mocks/live-sessions";

export function useLiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>(seedLiveSessions);

  useEffect(() => {
    setSessions(getStoredLiveSessions());
    const interval = setInterval(() => setSessions(getStoredLiveSessions()), 2000);
    return () => clearInterval(interval);
  }, []);

  return sessions;
}

export function useLiveSession(sessionId: string) {
  const sessions = useLiveSessions();
  return sessions.find((s) => s.id === sessionId);
}

export function useActiveLiveSession() {
  const sessions = useLiveSessions();
  return sessions.find((s) => s.status === "waiting" || s.status === "live");
}
