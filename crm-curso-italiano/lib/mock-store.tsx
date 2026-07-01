"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Course, DemoPersona, Tenant, WrittenAttempt, Grade, LessonBlock, Exercise, StudentProfile, StudentStatus } from "@lms-mocks/types";
import type { LiveSession } from "@lms-mocks/practice-types";
import { courses as seedCourses } from "@lms-mocks/courses";
import { defaultTenant } from "@lms-mocks/tenant";
import { demoPersonas, activityFeed, studentProfiles as seedStudents, createStudentProfile, createEnrollment, issueCertificate as buildCertificate } from "@lms-mocks/students";
import { exercises as seedExercises, createDefaultGamification } from "@lms-mocks/exercises";
import { seedLiveSessions, getStoredLiveSessions, setStoredLiveSessions } from "@lms-mocks/live-sessions";
import {
  getStoredAttempts,
  getStoredCourses,
  getStoredCrmPersonaId,
  getStoredGrades,
  getStoredTenant,
  getStoredExercises,
  setStoredAttempts,
  setStoredCourses,
  setStoredCrmPersonaId,
  setStoredGrades,
  setStoredTenant,
  setStoredExercises,
  getStoredStudents,
  setStoredStudents,
  clearStoredCrmPersonaId,
} from "@lms-mocks/storage";

export type CreateStudentInput = {
  name: string;
  email: string;
  phone?: string;
  courseIds?: string[];
};

export type UpdateStudentInput = Partial<Omit<StudentProfile, "id">> & { id: string };

export type CreateLiveSessionInput = Omit<LiveSession, "id" | "participants"> & {
  participants?: LiveSession["participants"];
};

export type CreateExerciseInput = Omit<Exercise, "id" | "usedInLessonIds">;
export type UpdateExerciseInput = Partial<Omit<Exercise, "id" | "tenantId">> & { id: string };

type MockStoreValue = {
  persona: DemoPersona | null;
  login: (personaId: string) => void;
  logout: () => void;
  tenant: Tenant;
  setTenant: (t: Tenant) => void;
  courses: Course[];
  updateCourse: (course: Course) => void;
  addModule: (courseId: string, title: string) => void;
  addLesson: (courseId: string, moduleId: string, title: string) => void;
  updateLessonBlocks: (courseId: string, lessonId: string, blocks: LessonBlock[]) => void;
  exercises: Exercise[];
  addExercise: (input: CreateExerciseInput) => Exercise;
  updateExercise: (input: UpdateExerciseInput) => void;
  deleteExercise: (id: string) => { ok: boolean; error?: string };
  duplicateExercise: (id: string) => Exercise | null;
  attempts: WrittenAttempt[];
  gradeAttempt: (attemptId: string, score: number, feedback: string) => void;
  refreshAttempts: () => void;
  grades: Grade[];
  students: StudentProfile[];
  addStudent: (input: CreateStudentInput) => StudentProfile;
  updateStudent: (input: UpdateStudentInput) => void;
  setStudentStatus: (id: string, status: StudentStatus) => void;
  enrollStudentInCourse: (studentId: string, courseId: string) => void;
  issueStudentCertificate: (studentId: string, courseId: string, courseTitle: string) => void;
  activity: typeof activityFeed;
  liveSessions: LiveSession[];
  updateLiveSession: (session: LiveSession) => void;
  convokeSession: (id: string) => void;
  startLiveSession: (id: string) => void;
  endLiveSession: (id: string) => void;
  createLiveSession: (input: CreateLiveSessionInput) => LiveSession;
};

const MockStoreContext = createContext<MockStoreValue | null>(null);

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<DemoPersona | null>(null);
  const [tenant, setTenantState] = useState<Tenant>(defaultTenant);
  const [courses, setCoursesState] = useState<Course[]>(seedCourses);
  const [exercises, setExercisesState] = useState<Exercise[]>(seedExercises);
  const [attempts, setAttemptsState] = useState<WrittenAttempt[]>([]);
  const [grades, setGradesState] = useState<Grade[]>([]);
  const [students, setStudentsState] = useState<StudentProfile[]>(seedStudents);
  const [liveSessions, setLiveSessionsState] = useState<LiveSession[]>(seedLiveSessions);

  useEffect(() => {
    setTenantState(getStoredTenant());
    setCoursesState(getStoredCourses());
    setExercisesState(getStoredExercises());
    setAttemptsState(getStoredAttempts());
    setGradesState(getStoredGrades());
    setStudentsState(getStoredStudents());
    setLiveSessionsState(getStoredLiveSessions());
    const id = getStoredCrmPersonaId();
    if (id) {
      const p = demoPersonas.find((x) => x.id === id);
      if (p && (p.role === "teacher" || p.role === "admin")) setPersona(p);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--tenant-primary", tenant.primaryColor);
    document.documentElement.style.setProperty("--primary", tenant.primaryColor);
  }, [tenant]);

  const login = useCallback((personaId: string) => {
    const p = demoPersonas.find((x) => x.id === personaId);
    if (!p || (p.role !== "teacher" && p.role !== "admin")) return;
    setStoredCrmPersonaId(personaId);
    setPersona(p);
  }, []);

  const logout = useCallback(() => {
    clearStoredCrmPersonaId();
    setPersona(null);
  }, []);

  const setTenant = useCallback((t: Tenant) => {
    setStoredTenant(t);
    setTenantState(t);
  }, []);

  const addStudent = useCallback((input: CreateStudentInput) => {
    const student = createStudentProfile(input);
    setStudentsState((prev) => {
      const next = [...prev, student];
      setStoredStudents(next);
      return next;
    });
    return student;
  }, []);

  const updateStudent = useCallback((input: UpdateStudentInput) => {
    setStudentsState((prev) => {
      const next = prev.map((s) => (s.id === input.id ? { ...s, ...input } : s));
      setStoredStudents(next);
      return next;
    });
  }, []);

  const setStudentStatus = useCallback((id: string, status: StudentStatus) => {
    setStudentsState((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, status } : s));
      setStoredStudents(next);
      return next;
    });
  }, []);

  const enrollStudentInCourse = useCallback((studentId: string, courseId: string) => {
    setStudentsState((prev) => {
      const next = prev.map((s) => {
        if (s.id !== studentId) return s;
        if (s.enrollments.some((e) => e.courseId === courseId)) return s;
        return {
          ...s,
          enrollments: [...s.enrollments, createEnrollment(studentId, courseId)],
          history: [
            {
              id: `hist-${Date.now()}`,
              type: "enrollment" as const,
              title: `Matriculado em ${courseId}`,
              timestamp: new Date().toISOString(),
            },
            ...(s.history ?? []),
          ],
        };
      });
      setStoredStudents(next);
      return next;
    });
  }, []);

  const issueStudentCertificate = useCallback((studentId: string, courseId: string, courseTitle: string) => {
    setStudentsState((prev) => {
      const next = prev.map((s) => {
        if (s.id !== studentId) return s;
        const cert = buildCertificate(s, courseId, courseTitle);
        return {
          ...s,
          certificates: [...(s.certificates ?? []), cert],
          history: [
            {
              id: `hist-${Date.now()}`,
              type: "certificate" as const,
              title: `Certificado emitido — ${courseTitle}`,
              timestamp: new Date().toISOString(),
            },
            ...(s.history ?? []),
          ],
        };
      });
      setStoredStudents(next);
      return next;
    });
  }, []);

  const addExercise = useCallback(
    (input: CreateExerciseInput) => {
      const prefix = input.type === "multiple_choice" ? "MC" : input.type === "true_false" ? "TF" : input.type === "fill_blank" ? "FB" : "WR";
      const newExercise: Exercise = {
        ...input,
        id: `${prefix}-${Date.now().toString(36).toUpperCase()}`,
        usedInLessonIds: [],
        gamification: input.gamification ?? createDefaultGamification("medium"),
      };
      setExercisesState((prev) => {
        const next = [...prev, newExercise];
        setStoredExercises(next);
        return next;
      });
      return newExercise;
    },
    [],
  );

  const updateExercise = useCallback((input: UpdateExerciseInput) => {
    setExercisesState((prev) => {
      const next = prev.map((e) => (e.id === input.id ? { ...e, ...input } : e));
      setStoredExercises(next);
      return next;
    });
  }, []);

  const deleteExercise = useCallback(
    (id: string) => {
      const usedInLesson = courses.some((course) =>
        course.modules.some((mod) =>
          mod.lessons.some((lesson) =>
            lesson.blocks.some(
              (b) => b.type === "exercise" && (b.content as { exerciseId: string }).exerciseId === id,
            ),
          ),
        ),
      );
      if (usedInLesson) {
        return { ok: false, error: "Este exercício está vinculado a uma ou mais aulas. Remova-o das aulas antes de excluir." };
      }
      setExercisesState((prev) => {
        const next = prev.filter((e) => e.id !== id);
        setStoredExercises(next);
        return next;
      });
      return { ok: true };
    },
    [courses],
  );

  const duplicateExercise = useCallback(
    (id: string) => {
      const source = exercises.find((e) => e.id === id);
      if (!source) return null;
      return addExercise({
        tenantId: source.tenantId,
        title: `${source.title} (cópia)`,
        type: source.type,
        config: JSON.parse(JSON.stringify(source.config)),
        gamification: source.gamification ? { ...source.gamification, tags: [...source.gamification.tags] } : createDefaultGamification("medium"),
      });
    },
    [exercises, addExercise],
  );

  const updateCourse = useCallback((course: Course) => {
    setCoursesState((prev) => {
      const exists = prev.some((c) => c.id === course.id);
      const next = exists ? prev.map((c) => (c.id === course.id ? course : c)) : [...prev, course];
      setStoredCourses(next);
      return next;
    });
  }, []);

  const addModule = useCallback((courseId: string, title: string) => {
    setCoursesState((prev) => {
      const next = prev.map((c) => {
        if (c.id !== courseId) return c;
        const order = c.modules.length + 1;
        return {
          ...c,
          modules: [
            ...c.modules,
            {
              id: `mod-${Date.now()}`,
              courseId,
              title,
              order,
              lessons: [],
            },
          ],
        };
      });
      setStoredCourses(next);
      return next;
    });
  }, []);

  const addLesson = useCallback((courseId: string, moduleId: string, title: string) => {
    setCoursesState((prev) => {
      const next = prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== moduleId) return m;
            const order = m.lessons.length + 1;
            return {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `lesson-${Date.now()}`,
                  moduleId,
                  title,
                  order,
                  status: "draft" as const,
                  durationMinutes: 10,
                  blocks: [],
                },
              ],
            };
          }),
        };
      });
      setStoredCourses(next);
      return next;
    });
  }, []);

  const updateLessonBlocks = useCallback((courseId: string, lessonId: string, blocks: LessonBlock[]) => {
    setCoursesState((prev) => {
      const next = prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, blocks } : l)),
          })),
        };
      });
      setStoredCourses(next);
      return next;
    });
  }, []);

  const refreshAttempts = useCallback(() => {
    setAttemptsState(getStoredAttempts());
  }, []);

  const updateLiveSession = useCallback((session: LiveSession) => {
    setLiveSessionsState((prev) => {
      const next = prev.map((s) => (s.id === session.id ? session : s));
      setStoredLiveSessions(next);
      return next;
    });
  }, []);

  const convokeSession = useCallback((id: string) => {
    setLiveSessionsState((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, status: "waiting" as const } : s));
      setStoredLiveSessions(next);
      return next;
    });
  }, []);

  const startLiveSession = useCallback((id: string) => {
    setLiveSessionsState((prev) => {
      const next = prev.map((s) => {
        if (s.id === id) return { ...s, status: "live" as const };
        if (s.status === "live") return { ...s, status: "ended" as const };
        return s;
      });
      setStoredLiveSessions(next);
      return next;
    });
  }, []);

  const endLiveSession = useCallback((id: string) => {
    setLiveSessionsState((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, status: "ended" as const } : s));
      setStoredLiveSessions(next);
      return next;
    });
  }, []);

  const createLiveSession = useCallback((input: CreateLiveSessionInput) => {
    const newSession: LiveSession = {
      ...input,
      id: `live-${Date.now()}`,
      participants: input.participants ?? [
        {
          id: "p-teacher",
          name: input.instructorName,
          avatar: input.instructorAvatar,
          role: "teacher",
          isMuted: false,
          isCameraOn: true,
        },
      ],
    };
    setLiveSessionsState((prev) => {
      const next = [...prev, newSession];
      setStoredLiveSessions(next);
      return next;
    });
    return newSession;
  }, []);

  const gradeAttempt = useCallback((attemptId: string, score: number, feedback: string) => {
    const currentAttempts = getStoredAttempts();
    const updatedAttempts = currentAttempts.map((a) =>
      a.id === attemptId ? { ...a, status: "graded" as const, score, feedback } : a,
    );
    setStoredAttempts(updatedAttempts);
    setAttemptsState(updatedAttempts);

    const attempt = currentAttempts.find((a) => a.id === attemptId);
    if (attempt) {
      const currentGrades = getStoredGrades();
      const newGrade: Grade = {
        id: `grade-${Date.now()}`,
        studentId: attempt.studentId,
        exerciseId: attempt.exerciseId,
        lessonId: attempt.lessonId,
        courseId: attempt.courseId,
        title: `${attempt.lessonTitle} — Redação`,
        score: score * 10,
        maxScore: 100,
        feedback,
        status: "graded",
        submittedAt: attempt.submittedAt,
      };
      const nextGrades = [newGrade, ...currentGrades];
      setStoredGrades(nextGrades);
      setGradesState(nextGrades);
    }
  }, []);

  const value = useMemo(
    () => ({
      persona,
      login,
      logout,
      tenant,
      setTenant,
      courses,
      updateCourse,
      addModule,
      addLesson,
      updateLessonBlocks,
      exercises,
      addExercise,
      updateExercise,
      deleteExercise,
      duplicateExercise,
      attempts,
      gradeAttempt,
      refreshAttempts,
      grades,
      students,
      addStudent,
      updateStudent,
      setStudentStatus,
      enrollStudentInCourse,
      issueStudentCertificate,
      activity: activityFeed,
      liveSessions,
      updateLiveSession,
      convokeSession,
      startLiveSession,
      endLiveSession,
      createLiveSession,
    }),
    [
      persona,
      login,
      logout,
      tenant,
      setTenant,
      courses,
      updateCourse,
      addModule,
      addLesson,
      updateLessonBlocks,
      exercises,
      addExercise,
      updateExercise,
      deleteExercise,
      duplicateExercise,
      attempts,
      gradeAttempt,
      refreshAttempts,
      grades,
      students,
      addStudent,
      updateStudent,
      setStudentStatus,
      enrollStudentInCourse,
      issueStudentCertificate,
      liveSessions,
      updateLiveSession,
      convokeSession,
      startLiveSession,
      endLiveSession,
      createLiveSession,
    ],
  );

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error("useMockStore must be used within MockStoreProvider");
  return ctx;
}

export function getCourseFromStore(courses: Course[], courseId: string) {
  return courses.find((c) => c.id === courseId);
}
