"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Course, DemoPersona, Tenant, TenantAiConfig, WrittenAttempt, Grade, LessonBlock, Exercise, StudentProfile, StudentStatus, StudentPlanTemplate, SupportConversation, SupportConversationStatus, WebhookEvent, IntegrationProvider, ProductCourseMapping, StudentPayment, StudentPlanStatus } from "@lms-mocks/types";
import type { LiveRecording, LiveSession } from "@lms-mocks/practice-types";
import {
  getStoredLiveRecordings,
  seedLiveRecordings,
  setStoredLiveRecordings,
} from "@lms-mocks/live-recordings";
import { courses as seedCourses } from "@lms-mocks/courses";
import { defaultTenant } from "@lms-mocks/tenant";
import { demoPersonas, activityFeed, studentProfiles as seedStudents, createStudentProfile, createEnrollment, issueCertificate as buildCertificate } from "@lms-mocks/students";
import { canAddStudent, getStudentLimitMessage } from "@/lib/subscription/plans";
import { exercises as seedExercises, createDefaultGamification } from "@lms-mocks/exercises";
import { seedLiveSessions, getStoredLiveSessions, setStoredLiveSessions } from "@lms-mocks/live-sessions";
import { seedPlanTemplates } from "@lms-mocks/student-plan-templates";
import type { MockExam, MockExamAttempt } from "@lms-mocks/mock-exam-types";
import {
  getStoredMockExamAttempts,
  getStoredMockExams,
  seedMockExamAttempts,
  seedMockExams,
  setStoredMockExamAttempts,
  setStoredMockExams,
} from "@lms-mocks/mock-exams";
import {
  getStoredAttempts,
  getStoredCourses,
  getStoredCrmPersonaId,
  getStoredGrades,
  getStoredTenant,
  getStoredTenantForId,
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
  getStoredAiConfig,
  setStoredAiConfig,
  getStoredPlanTemplates,
  setStoredPlanTemplates,
  getStoredSupportConversations,
  setStoredSupportConversations,
  getStoredWebhookEvents,
  setStoredWebhookEvents,
} from "@lms-mocks/storage";
import {
  applyPlanTemplateToStudentProfile,
  appendMessageToConversation,
  createSupportMessage,
  processWebhookPurchase,
  updateTenantIntegration,
  addProductMappingToTenant,
  removeProductMappingFromTenant,
  getTenantIntegrations,
} from "@/lib/integrations/helpers";

export type AddStudentResult = { data: StudentProfile; error: null } | { data: null; error: string };

export type CreateStudentInput = {
  name: string;
  email: string;
  phone?: string;
  courseIds?: string[];
  planTemplateId?: string;
};

export type UpdateStudentInput = Partial<Omit<StudentProfile, "id">> & { id: string };

export type CreateLiveSessionInput = Omit<LiveSession, "id" | "participants"> & {
  participants?: LiveSession["participants"];
  invitedStudentIds?: string[];
  recurrenceOccurrences?: number;
};

import { generateOccurrenceDates, inferSessionType } from "@lms-mocks/live-schedule";
import { slugifyCoursePart } from "@lms-mocks/course-slugs";

export type CreateExerciseInput = Omit<Exercise, "id" | "usedInLessonIds">;
export type UpdateExerciseInput = Partial<Omit<Exercise, "id" | "tenantId">> & { id: string };

export type TestAiConnectionResult =
  | { data: TenantAiConfig; error: null }
  | { data: null; error: string };

type MockStoreValue = {
  persona: DemoPersona | null;
  login: (personaId: string) => void;
  logout: () => void;
  tenant: Tenant;
  setTenant: (t: Tenant) => void;
  aiConfig: TenantAiConfig;
  setAiConfig: (config: TenantAiConfig) => void;
  testAiConnection: (config: TenantAiConfig) => Promise<TestAiConnectionResult>;
  courses: Course[];
  updateCourse: (course: Course) => void;
  addModule: (courseId: string, title: string) => void;
  addLesson: (courseId: string, moduleId: string, title: string, blocks?: LessonBlock[]) => void;
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
  addStudent: (input: CreateStudentInput) => AddStudentResult;
  updateStudent: (input: UpdateStudentInput) => void;
  setStudentStatus: (id: string, status: StudentStatus) => void;
  setStudentPlanStatus: (id: string, status: StudentPlanStatus) => void;
  registerStudentPayment: (id: string, payment: Omit<StudentPayment, "id">) => void;
  confirmStudentPayment: (id: string) => void;
  markStudentOverdue: (id: string) => void;
  enrollStudentInCourse: (studentId: string, courseId: string, fromTemplateId?: string) => void;
  unenrollStudentFromCourse: (studentId: string, courseId: string) => void;
  applyPlanTemplateToStudent: (studentId: string, templateId: string) => void;
  issueStudentCertificate: (studentId: string, courseId: string, courseTitle: string) => void;
  planTemplates: StudentPlanTemplate[];
  addPlanTemplate: (input: Omit<StudentPlanTemplate, "id" | "tenantId">) => StudentPlanTemplate;
  updatePlanTemplate: (template: StudentPlanTemplate) => void;
  deletePlanTemplate: (id: string) => { ok: boolean; error?: string };
  activatePlanTemplate: (id: string) => void;
  deactivatePlanTemplate: (id: string) => void;
  supportConversations: SupportConversation[];
  createSupportConversation: (input: { studentId: string; subject: string; body: string; staffName: string }) => SupportConversation;
  addSupportMessage: (conversationId: string, authorRole: "student" | "staff", authorName: string, body: string) => void;
  updateSupportConversationStatus: (conversationId: string, status: SupportConversationStatus) => void;
  webhookEvents: WebhookEvent[];
  updateIntegration: (provider: IntegrationProvider, patch: Partial<{ enabled: boolean; webhookSecret: string }>) => void;
  addProductMapping: (provider: IntegrationProvider, mapping: ProductCourseMapping) => void;
  removeProductMapping: (provider: IntegrationProvider, externalProductId: string) => void;
  simulateWebhookPurchase: (input: { provider: IntegrationProvider; buyerName: string; buyerEmail: string; productId: string }) => { student: StudentProfile; event: WebhookEvent } | null;
  getIntegrations: () => ReturnType<typeof getTenantIntegrations>;
  activity: typeof activityFeed;
  liveSessions: LiveSession[];
  liveRecordings: LiveRecording[];
  updateLiveSession: (session: LiveSession) => void;
  convokeSession: (id: string) => void;
  startLiveSession: (id: string) => void;
  endLiveSession: (id: string) => void;
  createLiveSession: (input: CreateLiveSessionInput) => LiveSession;
  addLiveRecording: (input: Omit<LiveRecording, "id" | "createdAt">) => LiveRecording;
  updateLiveRecording: (recording: LiveRecording) => void;
  toggleLiveRecordingPublished: (id: string) => void;
  toggleSessionRecordingPublished: (sessionId: string) => void;
  mockExams: MockExam[];
  mockExamAttempts: MockExamAttempt[];
  addMockExam: (input: Omit<MockExam, "id" | "tenantId" | "createdAt">) => MockExam;
  updateMockExam: (exam: MockExam) => void;
  deleteMockExam: (id: string) => void;
  duplicateMockExam: (id: string) => MockExam | null;
  submitMockExamAttempt: (attempt: MockExamAttempt) => void;
};

const MockStoreContext = createContext<MockStoreValue | null>(null);

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<DemoPersona | null>(null);
  const [tenant, setTenantState] = useState<Tenant>(defaultTenant);
  const [aiConfig, setAiConfigState] = useState<TenantAiConfig>(() => getStoredAiConfig(defaultTenant.id));
  const [courses, setCoursesState] = useState<Course[]>(seedCourses);
  const [exercises, setExercisesState] = useState<Exercise[]>(seedExercises);
  const [attempts, setAttemptsState] = useState<WrittenAttempt[]>([]);
  const [grades, setGradesState] = useState<Grade[]>([]);
  const [students, setStudentsState] = useState<StudentProfile[]>(seedStudents);
  const [liveSessions, setLiveSessionsState] = useState<LiveSession[]>(seedLiveSessions);
  const [liveRecordings, setLiveRecordingsState] = useState<LiveRecording[]>(seedLiveRecordings);
  const [mockExams, setMockExamsState] = useState<MockExam[]>(seedMockExams);
  const [mockExamAttempts, setMockExamAttemptsState] = useState<MockExamAttempt[]>(seedMockExamAttempts);
  const [planTemplates, setPlanTemplatesState] = useState<StudentPlanTemplate[]>(seedPlanTemplates);
  const [supportConversations, setSupportConversationsState] = useState<SupportConversation[]>([]);
  const [webhookEvents, setWebhookEventsState] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    const id = getStoredCrmPersonaId();
    let tenantToLoad = getStoredTenant();
    if (id) {
      const p = demoPersonas.find((x) => x.id === id);
      if (p && (p.role === "teacher" || p.role === "admin")) {
        setPersona(p);
        tenantToLoad = getStoredTenantForId(p.tenantId);
      }
    }
    setTenantState(tenantToLoad);
    setAiConfigState(getStoredAiConfig(tenantToLoad.id));
    setCoursesState(getStoredCourses());
    setExercisesState(getStoredExercises());
    setAttemptsState(getStoredAttempts());
    setGradesState(getStoredGrades());
    setStudentsState(getStoredStudents());
    setLiveSessionsState(getStoredLiveSessions());
    setLiveRecordingsState(getStoredLiveRecordings());
    setMockExamsState(getStoredMockExams());
    setMockExamAttemptsState(getStoredMockExamAttempts());
    setPlanTemplatesState(getStoredPlanTemplates());
    setSupportConversationsState(getStoredSupportConversations());
    setWebhookEventsState(getStoredWebhookEvents());
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--tenant-primary", tenant.primaryColor);
    document.documentElement.style.setProperty("--primary", tenant.primaryColor);
  }, [tenant]);

  const login = useCallback((personaId: string) => {
    const p = demoPersonas.find((x) => x.id === personaId);
    if (!p || (p.role !== "teacher" && p.role !== "admin")) return;
    const tenantForPersona = getStoredTenantForId(p.tenantId);
    setStoredTenant(tenantForPersona);
    setTenantState(tenantForPersona);
    setAiConfigState(getStoredAiConfig(tenantForPersona.id));
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
    setAiConfigState(getStoredAiConfig(t.id));
  }, []);

  const setAiConfig = useCallback(
    (config: TenantAiConfig) => {
      setStoredAiConfig(tenant.id, config);
      setAiConfigState(config);
    },
    [tenant.id],
  );

  const testAiConnection = useCallback(
    async (config: TenantAiConfig): Promise<TestAiConnectionResult> => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const key = config.apiKey.trim();
      if (!key.startsWith("sk-") || key.length < 20) {
        return { data: null, error: "Chave inválida. Use uma chave OpenAI no formato sk-..." };
      }
      const validated: TenantAiConfig = {
        ...config,
        apiKey: key,
        lastValidatedAt: new Date().toISOString(),
      };
      setStoredAiConfig(tenant.id, validated);
      setAiConfigState(validated);
      return { data: validated, error: null };
    },
    [tenant.id],
  );

  const addStudent = useCallback(
    (input: CreateStudentInput): AddStudentResult => {
      const limitMessage = getStudentLimitMessage(tenant, students.length);
      if (limitMessage || !canAddStudent(tenant, students.length)) {
        return { data: null, error: limitMessage ?? "Não foi possível cadastrar o aluno." };
      }
      const template = input.planTemplateId
        ? planTemplates.find((t) => t.id === input.planTemplateId)
        : undefined;
      const student = createStudentProfile({
        ...input,
        template,
        courseIds: input.courseIds ?? template?.courseIds,
      });
      setStudentsState((prev) => {
        const next = [...prev, student];
        setStoredStudents(next);
        return next;
      });
      return { data: student, error: null };
    },
    [tenant, students.length, planTemplates],
  );

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

  const setStudentPlanStatus = useCallback((id: string, status: StudentPlanStatus) => {
    setStudentsState((prev) => {
      const next = prev.map((s) =>
        s.id === id && s.plan ? { ...s, plan: { ...s.plan, status } } : s,
      );
      setStoredStudents(next);
      return next;
    });
  }, []);

  const registerStudentPayment = useCallback(
    (id: string, payment: Omit<StudentPayment, "id">) => {
      setStudentsState((prev) => {
        const next = prev.map((s) => {
          if (s.id !== id) return s;
          const newPayment: StudentPayment = { ...payment, id: `pay-${Date.now()}` };
          return {
            ...s,
            payments: [newPayment, ...(s.payments ?? [])],
            history: [
              {
                id: `hist-${Date.now()}`,
                type: "payment" as const,
                title: payment.description,
                timestamp: `${payment.date}T12:00:00Z`,
              },
              ...(s.history ?? []),
            ],
          };
        });
        setStoredStudents(next);
        return next;
      });
    },
    [],
  );

  const confirmStudentPayment = useCallback((id: string) => {
    setStudentPlanStatus(id, "active");
    setStudentStatus(id, "active");
  }, [setStudentPlanStatus, setStudentStatus]);

  const markStudentOverdue = useCallback(
    (id: string) => {
      setStudentPlanStatus(id, "overdue");
    },
    [setStudentPlanStatus],
  );

  const enrollStudentInCourse = useCallback(
    (studentId: string, courseId: string, fromTemplateId?: string) => {
      setStudentsState((prev) => {
        const next = prev.map((s) => {
          if (s.id !== studentId) return s;
          if (s.enrollments.some((e) => e.courseId === courseId)) return s;
          return {
            ...s,
            enrollments: [
              ...s.enrollments,
              { ...createEnrollment(studentId, courseId), fromTemplateId },
            ],
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
    },
    [],
  );

  const unenrollStudentFromCourse = useCallback((studentId: string, courseId: string) => {
    setStudentsState((prev) => {
      const next = prev.map((s) =>
        s.id === studentId
          ? { ...s, enrollments: s.enrollments.filter((e) => e.courseId !== courseId) }
          : s,
      );
      setStoredStudents(next);
      return next;
    });
  }, []);

  const applyPlanTemplateToStudent = useCallback(
    (studentId: string, templateId: string) => {
      const template = planTemplates.find((t) => t.id === templateId);
      if (!template) return;
      setStudentsState((prev) => {
        const next = prev.map((s) =>
          s.id === studentId ? applyPlanTemplateToStudentProfile(s, template) : s,
        );
        setStoredStudents(next);
        return next;
      });
    },
    [planTemplates],
  );

  const addPlanTemplate = useCallback(
    (input: Omit<StudentPlanTemplate, "id" | "tenantId">) => {
      const template: StudentPlanTemplate = {
        ...input,
        id: `tpl-${Date.now()}`,
        tenantId: tenant.id,
      };
      setPlanTemplatesState((prev) => {
        const next = [...prev, template];
        setStoredPlanTemplates(next);
        return next;
      });
      return template;
    },
    [tenant.id],
  );

  const updatePlanTemplate = useCallback((template: StudentPlanTemplate) => {
    setPlanTemplatesState((prev) => {
      const next = prev.map((t) => (t.id === template.id ? template : t));
      setStoredPlanTemplates(next);
      return next;
    });
  }, []);

  const deletePlanTemplate = useCallback(
    (id: string) => {
      const linked = students.filter((s) => s.planTemplateId === id);
      if (linked.length > 0) {
        return {
          ok: false as const,
          error: `Este template está vinculado a ${linked.length} aluno(s). Desative-o em vez de excluir.`,
        };
      }
      setPlanTemplatesState((prev) => {
        const next = prev.filter((t) => t.id !== id);
        setStoredPlanTemplates(next);
        return next;
      });
      return { ok: true as const };
    },
    [students],
  );

  const activatePlanTemplate = useCallback((id: string) => {
    setPlanTemplatesState((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, active: true, deactivatedAt: null } : t,
      );
      setStoredPlanTemplates(next);
      return next;
    });
  }, []);

  const deactivatePlanTemplate = useCallback((id: string) => {
    setPlanTemplatesState((prev) => {
      const next = prev.map((t) =>
        t.id === id
          ? { ...t, active: false, deactivatedAt: new Date().toISOString() }
          : t,
      );
      setStoredPlanTemplates(next);
      return next;
    });
  }, []);

  const createSupportConversation = useCallback(
    (input: { studentId: string; subject: string; body: string; staffName: string }) => {
      const student = students.find((s) => s.id === input.studentId);
      const id = `conv-${Date.now()}`;
      const now = new Date().toISOString();
      const msg = createSupportMessage(id, "staff", input.staffName, input.body);
      const conversation: SupportConversation = {
        id,
        tenantId: tenant.id,
        studentId: input.studentId,
        studentName: student?.name ?? "Aluno",
        subject: input.subject,
        status: "waiting_student",
        createdAt: now,
        updatedAt: now,
        messages: [msg],
      };
      setSupportConversationsState((prev) => {
        const next = [conversation, ...prev];
        setStoredSupportConversations(next);
        return next;
      });
      return conversation;
    },
    [students, tenant.id],
  );

  const addSupportMessage = useCallback(
    (conversationId: string, authorRole: "student" | "staff", authorName: string, body: string) => {
      setSupportConversationsState((prev) => {
        const msg = createSupportMessage(conversationId, authorRole, authorName, body);
        const next = prev.map((c) =>
          c.id === conversationId ? appendMessageToConversation(c, msg) : c,
        );
        setStoredSupportConversations(next);
        return next;
      });
    },
    [],
  );

  const updateSupportConversationStatus = useCallback(
    (conversationId: string, status: SupportConversationStatus) => {
      setSupportConversationsState((prev) => {
        const next = prev.map((c) =>
          c.id === conversationId
            ? { ...c, status, updatedAt: new Date().toISOString() }
            : c,
        );
        setStoredSupportConversations(next);
        return next;
      });
    },
    [],
  );

  const getIntegrations = useCallback(() => getTenantIntegrations(tenant), [tenant]);

  const updateIntegration = useCallback(
    (provider: IntegrationProvider, patch: Partial<{ enabled: boolean; webhookSecret: string }>) => {
      const updated = updateTenantIntegration(tenant, provider, patch);
      setTenant(updated);
    },
    [tenant, setTenant],
  );

  const addProductMapping = useCallback(
    (provider: IntegrationProvider, mapping: ProductCourseMapping) => {
      const updated = addProductMappingToTenant(tenant, provider, mapping);
      setTenant(updated);
    },
    [tenant, setTenant],
  );

  const removeProductMapping = useCallback(
    (provider: IntegrationProvider, externalProductId: string) => {
      const updated = removeProductMappingFromTenant(tenant, provider, externalProductId);
      setTenant(updated);
    },
    [tenant, setTenant],
  );

  const simulateWebhookPurchase = useCallback(
    (input: { provider: IntegrationProvider; buyerName: string; buyerEmail: string; productId: string }) => {
      const result = processWebhookPurchase({
        tenant,
        provider: input.provider,
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        productId: input.productId,
        students,
        planTemplates,
      });
      if (!result) return null;
      setStudentsState((prev) => {
        const exists = prev.some((s) => s.id === result.student.id);
        const next = exists
          ? prev.map((s) => (s.id === result.student.id ? result.student : s))
          : [...prev, result.student];
        setStoredStudents(next);
        return next;
      });
      setWebhookEventsState((prev) => {
        const next = [result.event, ...prev];
        setStoredWebhookEvents(next);
        return next;
      });
      return { student: result.student, event: result.event };
    },
    [tenant, students, planTemplates],
  );

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
        const baseSlug = slugifyCoursePart(title) || `modulo-${order}`;
        const slug = c.modules.some((m) => m.slug === baseSlug)
          ? `${baseSlug}-${Date.now()}`
          : baseSlug;
        return {
          ...c,
          modules: [
            ...c.modules,
            {
              id: `mod-${Date.now()}`,
              courseId,
              title,
              slug,
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

  const addLesson = useCallback((courseId: string, moduleId: string, title: string, blocks: LessonBlock[] = []) => {
    setCoursesState((prev) => {
      const next = prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== moduleId) return m;
            const order = m.lessons.length + 1;
            const baseSlug = slugifyCoursePart(title) || `aula-${order}`;
            const slug = m.lessons.some((l) => l.slug === baseSlug)
              ? `${baseSlug}-${Date.now()}`
              : baseSlug;
            return {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `lesson-${Date.now()}`,
                  moduleId,
                  title,
                  slug,
                  order,
                  status: "draft" as const,
                  durationMinutes: 10,
                  blocks,
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
      const next = prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "ended" as const,
              recordingUrl: s.recordingUrl ?? `https://example.com/replay/${s.meetCode}`,
            }
          : s,
      );
      setStoredLiveSessions(next);
      return next;
    });
  }, []);

  const createLiveSession = useCallback(
    (input: CreateLiveSessionInput) => {
      const {
        invitedStudentIds = [],
        recurrenceOccurrences = 4,
        recurrence,
        participants: inputParticipants,
        ...sessionBase
      } = input;

      const teacherParticipant = {
        id: "p-teacher",
        name: input.instructorName,
        avatar: input.instructorAvatar,
        role: "teacher" as const,
        isMuted: false,
        isCameraOn: true,
      };

      const studentParticipants = invitedStudentIds
        .map((sid) => students.find((s) => s.id === sid))
        .filter((s): s is StudentProfile => !!s)
        .map((s) => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          role: "student" as const,
          isMuted: true,
          isCameraOn: false,
        }));

      const participants = inputParticipants ?? [teacherParticipant, ...studentParticipants];
      const seriesId = recurrence ? `series-${Date.now()}` : undefined;
      const sessionType =
        input.sessionType ?? inferSessionType(studentParticipants.length);
      const dates =
        recurrence && recurrence.interval > 0
          ? generateOccurrenceDates({
              startAt: input.scheduledAt,
              durationMinutes: input.durationMinutes,
              recurrence,
              maxOccurrences: recurrenceOccurrences,
            })
          : [input.scheduledAt];

      const sessionsToCreate: LiveSession[] = dates.map((scheduledAt, i) => ({
        ...sessionBase,
        id: `live-${Date.now()}-${i}`,
        scheduledAt,
        sessionType,
        seriesId,
        recordingPublished: sessionBase.recordingPublished ?? false,
        participants: [...participants],
        recurrence: recurrence ? { ...recurrence, seriesId } : undefined,
      }));

      setLiveSessionsState((prev) => {
        const next = [...prev, ...sessionsToCreate];
        setStoredLiveSessions(next);
        return next;
      });
      return sessionsToCreate[0]!;
    },
    [students],
  );

  const addLiveRecording = useCallback((input: Omit<LiveRecording, "id" | "createdAt">) => {
    const recording: LiveRecording = {
      ...input,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLiveRecordingsState((prev) => {
      const next = [...prev, recording];
      setStoredLiveRecordings(next);
      return next;
    });
    return recording;
  }, []);

  const updateLiveRecording = useCallback((recording: LiveRecording) => {
    setLiveRecordingsState((prev) => {
      const next = prev.map((r) => (r.id === recording.id ? recording : r));
      setStoredLiveRecordings(next);
      return next;
    });
  }, []);

  const toggleLiveRecordingPublished = useCallback((id: string) => {
    setLiveRecordingsState((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, published: !r.published } : r));
      setStoredLiveRecordings(next);
      return next;
    });
  }, []);

  const toggleSessionRecordingPublished = useCallback((sessionId: string) => {
    setLiveSessionsState((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, recordingPublished: !s.recordingPublished } : s,
      );
      setStoredLiveSessions(next);
      return next;
    });
  }, []);

  const addMockExam = useCallback(
    (input: Omit<MockExam, "id" | "tenantId" | "createdAt">) => {
      const exam: MockExam = {
        ...input,
        id: `mock-${Date.now()}`,
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
      };
      setMockExamsState((prev) => {
        const next = [...prev, exam];
        setStoredMockExams(next);
        return next;
      });
      return exam;
    },
    [tenant.id],
  );

  const updateMockExam = useCallback((exam: MockExam) => {
    setMockExamsState((prev) => {
      const next = prev.map((e) => (e.id === exam.id ? exam : e));
      setStoredMockExams(next);
      return next;
    });
  }, []);

  const deleteMockExam = useCallback((id: string) => {
    setMockExamsState((prev) => {
      const next = prev.filter((e) => e.id !== id);
      setStoredMockExams(next);
      return next;
    });
  }, []);

  const duplicateMockExam = useCallback(
    (id: string) => {
      const source = mockExams.find((e) => e.id === id);
      if (!source) return null;
      const copy: MockExam = {
        ...structuredClone(source),
        id: `mock-${Date.now()}`,
        title: `${source.title} (cópia)`,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      setMockExamsState((prev) => {
        const next = [...prev, copy];
        setStoredMockExams(next);
        return next;
      });
      return copy;
    },
    [mockExams],
  );

  const submitMockExamAttempt = useCallback((attempt: MockExamAttempt) => {
    setMockExamAttemptsState((prev) => {
      const exists = prev.some((a) => a.id === attempt.id);
      const next = exists ? prev.map((a) => (a.id === attempt.id ? attempt : a)) : [...prev, attempt];
      setStoredMockExamAttempts(next);
      return next;
    });
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
      aiConfig,
      setAiConfig,
      testAiConnection,
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
      setStudentPlanStatus,
      registerStudentPayment,
      confirmStudentPayment,
      markStudentOverdue,
      enrollStudentInCourse,
      unenrollStudentFromCourse,
      applyPlanTemplateToStudent,
      issueStudentCertificate,
      planTemplates,
      addPlanTemplate,
      updatePlanTemplate,
      deletePlanTemplate,
      activatePlanTemplate,
      deactivatePlanTemplate,
      supportConversations,
      createSupportConversation,
      addSupportMessage,
      updateSupportConversationStatus,
      webhookEvents,
      updateIntegration,
      addProductMapping,
      removeProductMapping,
      simulateWebhookPurchase,
      getIntegrations,
      activity: activityFeed,
      liveSessions,
      liveRecordings,
      updateLiveSession,
      convokeSession,
      startLiveSession,
      endLiveSession,
      createLiveSession,
      addLiveRecording,
      updateLiveRecording,
      toggleLiveRecordingPublished,
      toggleSessionRecordingPublished,
      mockExams,
      mockExamAttempts,
      addMockExam,
      updateMockExam,
      deleteMockExam,
      duplicateMockExam,
      submitMockExamAttempt,
    }),
    [
      persona,
      login,
      logout,
      tenant,
      setTenant,
      aiConfig,
      setAiConfig,
      testAiConnection,
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
      setStudentPlanStatus,
      registerStudentPayment,
      confirmStudentPayment,
      markStudentOverdue,
      enrollStudentInCourse,
      unenrollStudentFromCourse,
      applyPlanTemplateToStudent,
      issueStudentCertificate,
      planTemplates,
      addPlanTemplate,
      updatePlanTemplate,
      deletePlanTemplate,
      activatePlanTemplate,
      deactivatePlanTemplate,
      supportConversations,
      createSupportConversation,
      addSupportMessage,
      updateSupportConversationStatus,
      webhookEvents,
      updateIntegration,
      addProductMapping,
      removeProductMapping,
      simulateWebhookPurchase,
      getIntegrations,
      liveSessions,
      liveRecordings,
      updateLiveSession,
      convokeSession,
      startLiveSession,
      endLiveSession,
      createLiveSession,
      addLiveRecording,
      updateLiveRecording,
      toggleLiveRecordingPublished,
      toggleSessionRecordingPublished,
      mockExams,
      mockExamAttempts,
      addMockExam,
      updateMockExam,
      deleteMockExam,
      duplicateMockExam,
      submitMockExamAttempt,
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
