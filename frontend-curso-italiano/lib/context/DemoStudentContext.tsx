"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { DemoPersona, Grade, StudentPlanFeature, StudentProfile, WrittenAttempt } from "@lms-mocks/types";
import {
  demoPersonas,
  getStudentProfile,
  initialGrades,
} from "@lms-mocks/students";
import { canStudentAccessFeature } from "@lms-mocks/student-plan-access";
import { getStoredStudents } from "@lms-mocks/storage";
import {
  getStoredAttempts,
  getStoredGrades,
  getStoredPersonaId,
  getStoredProgress,
  setStoredAttempts,
  setStoredGrades,
  setStoredPersonaId,
  setStoredProgress,
  clearStoredPersonaId,
  type StoredProgress,
} from "@lms-mocks/storage";
import { countLessons, getCourseById } from "@lms-mocks/courses";

type DemoStudentContextValue = {
  persona: DemoPersona | null;
  studentProfile: StudentProfile | null;
  canAccessFeature: (feature: StudentPlanFeature) => boolean;
  login: (personaId: string) => void;
  logout: () => void;
  progress: StoredProgress;
  completedLessonIds: string[];
  completeLesson: (lessonId: string) => void;
  getCourseProgress: (courseId: string) => number;
  grades: Grade[];
  submitWrittenAttempt: (attempt: Omit<WrittenAttempt, "id" | "status" | "score" | "feedback" | "submittedAt">) => void;
  refreshGrades: () => void;
};

const DemoStudentContext = createContext<DemoStudentContextValue | null>(null);

function defaultProgressForPersona(personaId: string): StoredProgress {
  const profile = getStudentProfile(personaId);
  const enrollment = profile?.enrollments.find((e) => e.courseId === "course-a1");
  return {
    completedLessonIds: enrollment?.completedLessonIds ?? [],
    lastLessonId: enrollment?.lastLessonId ?? null,
  };
}

function resolveStudentProfile(personaId: string): StudentProfile | undefined {
  return getStoredStudents().find((s) => s.id === personaId) ?? getStudentProfile(personaId);
}

export function DemoStudentProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<DemoPersona | null>(null);
  const [progress, setProgress] = useState<StoredProgress>({ completedLessonIds: [], lastLessonId: null });
  const [grades, setGrades] = useState<Grade[]>(initialGrades);

  const refreshGrades = useCallback(() => {
    setGrades(getStoredGrades());
  }, []);

  useEffect(() => {
    const id = getStoredPersonaId();
    if (!id) return;
    const p = demoPersonas.find((x) => x.id === id && x.role === "student");
    if (p) {
      setPersona(p);
      setProgress(getStoredProgress(id, defaultProgressForPersona(id)));
      setGrades(getStoredGrades());
    }
  }, []);

  const login = useCallback((personaId: string) => {
    const p = demoPersonas.find((x) => x.id === personaId);
    if (!p || p.role !== "student") return;
    setStoredPersonaId(personaId);
    setPersona(p);
    const prog = getStoredProgress(personaId, defaultProgressForPersona(personaId));
    setProgress(prog);
    setGrades(getStoredGrades());
  }, []);

  const logout = useCallback(() => {
    clearStoredPersonaId();
    setPersona(null);
    setProgress({ completedLessonIds: [], lastLessonId: null });
  }, []);

  const completeLesson = useCallback(
    (lessonId: string) => {
      if (!persona) return;
      setProgress((prev) => {
        const completedLessonIds = prev.completedLessonIds.includes(lessonId)
          ? prev.completedLessonIds
          : [...prev.completedLessonIds, lessonId];
        const next = { completedLessonIds, lastLessonId: lessonId };
        setStoredProgress(persona.id, next);
        return next;
      });
    },
    [persona],
  );

  const getCourseProgress = useCallback(
    (courseId: string) => {
      const course = getCourseById(courseId);
      if (!course) return 0;
      const total = countLessons(course);
      if (total === 0) return 0;
      const completed = progress.completedLessonIds.filter((lid) =>
        course.modules.some((m) => m.lessons.some((l) => l.id === lid)),
      ).length;
      return Math.round((completed / total) * 100);
    },
    [progress.completedLessonIds],
  );

  const submitWrittenAttempt = useCallback(
    (data: Omit<WrittenAttempt, "id" | "status" | "score" | "feedback" | "submittedAt">) => {
      const attempts = getStoredAttempts();
      const newAttempt: WrittenAttempt = {
        ...data,
        id: `attempt-${Date.now()}`,
        status: "pending",
        score: null,
        feedback: null,
        submittedAt: new Date().toISOString(),
      };
      setStoredAttempts([newAttempt, ...attempts]);
    },
    [],
  );

  const studentProfile = useMemo(
    () => (persona ? resolveStudentProfile(persona.id) ?? null : null),
    [persona],
  );

  const canAccessFeatureFn = useCallback(
    (feature: StudentPlanFeature) => {
      if (!studentProfile) return false;
      return canStudentAccessFeature(studentProfile, feature);
    },
    [studentProfile],
  );

  const value = useMemo(
    () => ({
      persona,
      studentProfile,
      canAccessFeature: canAccessFeatureFn,
      login,
      logout,
      progress,
      completedLessonIds: progress.completedLessonIds,
      completeLesson,
      getCourseProgress,
      grades,
      submitWrittenAttempt,
      refreshGrades,
    }),
    [persona, studentProfile, canAccessFeatureFn, login, logout, progress, completeLesson, getCourseProgress, grades, submitWrittenAttempt, refreshGrades],
  );

  return <DemoStudentContext.Provider value={value}>{children}</DemoStudentContext.Provider>;
}

export function useDemoStudent() {
  const ctx = useContext(DemoStudentContext);
  if (!ctx) throw new Error("useDemoStudent must be used within DemoStudentProvider");
  return ctx;
}
