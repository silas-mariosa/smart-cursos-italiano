"use client";

import { useEffect, useState } from "react";
import type { LiveRecording } from "@lms-mocks/practice-types";
import { getPublishedRecordingsForTenant, seedLiveRecordings } from "@lms-mocks/live-recordings";

export function useLiveRecordings(tenantId: string) {
  const [recordings, setRecordings] = useState<LiveRecording[]>(() =>
    typeof window === "undefined" ? seedLiveRecordings : getPublishedRecordingsForTenant(tenantId),
  );

  useEffect(() => {
    const refresh = () => setRecordings(getPublishedRecordingsForTenant(tenantId));
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [tenantId]);

  return recordings;
}
