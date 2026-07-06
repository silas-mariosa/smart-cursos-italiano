"use client";

import { useEffect, useState } from "react";
import type { StudentProfile } from "@lms-mocks/types";
import { studentProfiles as seedStudents } from "@lms-mocks/students";
import { getStoredStudents } from "@lms-mocks/storage";

export function useStoredStudentProfile(studentId: string | undefined): StudentProfile | undefined {
  const [profile, setProfile] = useState<StudentProfile | undefined>(() =>
    studentId ? getStoredStudents().find((s) => s.id === studentId) ?? getSeedProfile(studentId) : undefined,
  );

  useEffect(() => {
    if (!studentId) return;
    const load = () => {
      const stored = getStoredStudents().find((s) => s.id === studentId);
      setProfile(stored ?? getSeedProfile(studentId));
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [studentId]);

  return profile;
}

function getSeedProfile(studentId: string) {
  return seedStudents.find((s) => s.id === studentId);
}
