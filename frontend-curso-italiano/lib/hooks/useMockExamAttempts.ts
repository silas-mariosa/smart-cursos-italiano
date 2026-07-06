"use client";

import { useEffect, useState } from "react";
import type { MockExamAttempt } from "@lms-mocks/mock-exam-types";
import { getStoredMockExamAttempts, seedMockExamAttempts } from "@lms-mocks/mock-exams";

export function useMockExamAttempts() {
  const [attempts, setAttempts] = useState<MockExamAttempt[]>(
    typeof window === "undefined" ? seedMockExamAttempts : getStoredMockExamAttempts(),
  );

  useEffect(() => {
    const refresh = () => setAttempts(getStoredMockExamAttempts());
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  return attempts;
}
