import type {
  Course,
  Grade,
  StudentCertificate,
  StudentEnrollment,
  StudentHistoryItem,
  StudentPayment,
  StudentProfile,
  StudentStatus,
  WrittenAttempt,
} from "./types";

const DEFAULT_SKILLS = [
  { name: "Grammar", percent: 0 },
  { name: "Listening", percent: 0 },
  { name: "Speaking", percent: 0 },
  { name: "Writing", percent: 0 },
];

function avatarFromName(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export const studentProfiles: StudentProfile[] = [
  {
    id: "persona-ana",
    name: "Ana Silva",
    email: "ana@demo.com",
    phone: "+55 11 98765-4321",
    avatar: "AS",
    memberSince: "2026-03-01",
    status: "active",
    plan: {
      name: "Plano Mensal A1+A2",
      amount: 149.9,
      cycle: "monthly",
      status: "active",
      nextDueDate: "2026-07-15",
    },
    payments: [
      {
        id: "pay-ana-1",
        date: "2026-06-15",
        amount: 149.9,
        description: "Mensalidade Jun/2026",
        status: "paid",
      },
      {
        id: "pay-ana-2",
        date: "2026-05-15",
        amount: 149.9,
        description: "Mensalidade Mai/2026",
        status: "paid",
      },
    ],
    certificates: [],
    history: [
      {
        id: "hist-ana-1",
        type: "lesson",
        title: "Concluiu Aula 2 — Come stai?",
        timestamp: "2026-06-28T10:00:00Z",
      },
      {
        id: "hist-ana-2",
        type: "exercise",
        title: "Quiz Buongiorno — 100%",
        timestamp: "2026-06-20T14:00:00Z",
      },
      {
        id: "hist-ana-3",
        type: "enrollment",
        title: "Matriculada em Italiano A2",
        timestamp: "2026-05-01T09:00:00Z",
      },
    ],
    notes: "Prefere aulas ao vivo às terças. Objetivo: viagem a Roma em dezembro.",
    skills: [
      { name: "Grammar", percent: 70 },
      { name: "Listening", percent: 45 },
      { name: "Speaking", percent: 80 },
      { name: "Writing", percent: 65 },
    ],
    enrollments: [
      {
        studentId: "persona-ana",
        courseId: "course-a1",
        progressPercent: 45,
        completedLessonIds: ["lesson-a1-1", "lesson-a1-2"],
        lastLessonId: "lesson-a1-3",
        streakDays: 3,
        enrolledAt: "2026-03-01",
      },
      {
        studentId: "persona-ana",
        courseId: "course-a2",
        progressPercent: 0,
        completedLessonIds: [],
        lastLessonId: null,
        streakDays: 3,
        enrolledAt: "2026-05-01",
      },
    ],
  },
  {
    id: "persona-lucas",
    name: "Lucas Mendes",
    email: "lucas@demo.com",
    phone: "+55 21 99876-5432",
    avatar: "LM",
    memberSince: "2026-01-15",
    status: "active",
    plan: {
      name: "Plano Anual Premium",
      amount: 1199.0,
      cycle: "yearly",
      status: "active",
      nextDueDate: "2027-01-15",
    },
    payments: [
      {
        id: "pay-lucas-1",
        date: "2026-01-15",
        amount: 1199.0,
        description: "Anuidade 2026",
        status: "paid",
      },
    ],
    certificates: [
      {
        id: "cert-lucas-a1",
        courseId: "course-a1",
        courseTitle: "Italiano A1 — Primeiros passos",
        issuedAt: "2026-06-01",
        status: "pending",
      },
    ],
    history: [
      {
        id: "hist-lucas-1",
        type: "exercise",
        title: "Enviou redação — Diálogo no restaurante",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist-lucas-2",
        type: "lesson",
        title: "Concluiu Aula 4 — Al bar",
        timestamp: "2026-06-25T16:00:00Z",
      },
    ],
    notes: "Aluno avançado. Candidato a certificação A1.",
    skills: [
      { name: "Grammar", percent: 88 },
      { name: "Listening", percent: 82 },
      { name: "Speaking", percent: 75 },
      { name: "Writing", percent: 90 },
    ],
    enrollments: [
      {
        studentId: "persona-lucas",
        courseId: "course-a1",
        progressPercent: 90,
        completedLessonIds: ["lesson-a1-1", "lesson-a1-2", "lesson-a1-3", "lesson-a1-4"],
        lastLessonId: "lesson-a1-5",
        streakDays: 7,
        enrolledAt: "2026-01-15",
      },
    ],
  },
  {
    id: "persona-maria",
    name: "Maria Costa",
    email: "maria@demo.com",
    phone: "+55 31 97654-3210",
    avatar: "MC",
    memberSince: "2026-05-10",
    status: "active",
    plan: {
      name: "Trial 7 dias",
      amount: 0,
      cycle: "monthly",
      status: "trial",
      nextDueDate: "2026-07-07",
    },
    payments: [],
    certificates: [],
    history: [
      {
        id: "hist-maria-1",
        type: "enrollment",
        title: "Iniciou Italiano A1",
        timestamp: "2026-05-10T11:00:00Z",
      },
      {
        id: "hist-maria-2",
        type: "lesson",
        title: "Concluiu Aula 1 — Buongiorno",
        timestamp: "2026-05-12T09:00:00Z",
      },
    ],
    skills: [
      { name: "Grammar", percent: 30 },
      { name: "Listening", percent: 25 },
      { name: "Speaking", percent: 20 },
      { name: "Writing", percent: 15 },
    ],
    enrollments: [
      {
        studentId: "persona-maria",
        courseId: "course-a1",
        progressPercent: 12,
        completedLessonIds: ["lesson-a1-1"],
        lastLessonId: "lesson-a1-2",
        streakDays: 1,
        enrolledAt: "2026-05-10",
      },
    ],
  },
];

export function resolveStudentStatus(student: StudentProfile): StudentStatus {
  return student.status ?? "active";
}

export function createDefaultSkills() {
  return DEFAULT_SKILLS.map((s) => ({ ...s }));
}

export function createEnrollment(studentId: string, courseId: string): StudentEnrollment {
  return {
    studentId,
    courseId,
    progressPercent: 0,
    completedLessonIds: [],
    lastLessonId: null,
    streakDays: 0,
    enrolledAt: new Date().toISOString().slice(0, 10),
  };
}

export function createStudentProfile(input: {
  name: string;
  email: string;
  phone?: string;
  courseIds?: string[];
}): StudentProfile {
  const id = `persona-${Date.now()}`;
  const enrollments = (input.courseIds ?? []).map((courseId) => createEnrollment(id, courseId));
  return {
    id,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim(),
    avatar: avatarFromName(input.name),
    memberSince: new Date().toISOString().slice(0, 10),
    status: "pending",
    plan: {
      name: "Trial 7 dias",
      amount: 0,
      cycle: "monthly",
      status: "trial",
      nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
    payments: [],
    certificates: [],
    history: [
      {
        id: `hist-${Date.now()}`,
        type: "enrollment",
        title: "Cadastro realizado no CRM",
        timestamp: new Date().toISOString(),
      },
    ],
    notes: "",
    skills: createDefaultSkills(),
    enrollments,
  };
}

export function getStudentProfile(studentId: string): StudentProfile | undefined {
  return studentProfiles.find((s) => s.id === studentId);
}

export function getStudentStats(
  students: StudentProfile[],
  attempts: WrittenAttempt[],
  grades: Grade[],
) {
  const active = students.filter((s) => resolveStudentStatus(s) === "active").length;
  const pendingAttempts = attempts.filter((a) => a.status === "pending").length;
  const avgProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => {
            const main = s.enrollments[0];
            return sum + (main?.progressPercent ?? 0);
          }, 0) / students.length,
        )
      : 0;
  const overdue = students.filter((s) => s.plan?.status === "overdue").length;
  const trials = students.filter((s) => s.plan?.status === "trial").length;

  return { total: students.length, active, pendingAttempts, avgProgress, overdue, trials };
}

export function filterStudents(
  students: StudentProfile[],
  query: string,
  status: StudentStatus | "all",
  courseId: string,
): StudentProfile[] {
  const q = query.trim().toLowerCase();
  return students.filter((s) => {
    if (status !== "all" && resolveStudentStatus(s) !== status) return false;
    if (courseId !== "all" && !s.enrollments.some((e) => e.courseId === courseId)) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone?.includes(q) ?? false)
    );
  });
}

export function getStudentPendingAttempts(studentId: string, attempts: WrittenAttempt[]) {
  return attempts.filter((a) => a.studentId === studentId && a.status === "pending");
}

export function buildStudentTimeline(
  student: StudentProfile,
  grades: Grade[],
  attempts: WrittenAttempt[],
): StudentHistoryItem[] {
  const fromProfile = student.history ?? [];
  const fromGrades: StudentHistoryItem[] = grades
    .filter((g) => g.studentId === student.id)
    .map((g) => ({
      id: `grade-${g.id}`,
      type: "exercise" as const,
      title: g.title,
      description: `Nota ${g.score}/${g.maxScore}`,
      timestamp: g.submittedAt,
    }));
  const fromAttempts: StudentHistoryItem[] = attempts
    .filter((a) => a.studentId === student.id)
    .map((a) => ({
      id: `attempt-${a.id}`,
      type: "exercise" as const,
      title: a.status === "pending" ? `Redação pendente — ${a.lessonTitle}` : `Redação corrigida — ${a.lessonTitle}`,
      description: a.status === "graded" && a.score != null ? `Nota ${a.score}/${a.maxScore}` : undefined,
      timestamp: a.submittedAt,
    }));
  const fromPayments: StudentHistoryItem[] = (student.payments ?? []).map((p) => ({
    id: `payment-${p.id}`,
    type: "payment" as const,
    title: p.description,
    description: `R$ ${p.amount.toFixed(2)} · ${p.status === "paid" ? "Pago" : p.status === "pending" ? "Pendente" : "Falhou"}`,
    timestamp: `${p.date}T12:00:00Z`,
  }));
  const fromCerts: StudentHistoryItem[] = (student.certificates ?? []).map((c) => ({
    id: `cert-${c.id}`,
    type: "certificate" as const,
    title: `Certificado — ${c.courseTitle}`,
    description: c.status === "issued" ? "Emitido" : c.status === "pending" ? "Pendente" : "Revogado",
    timestamp: `${c.issuedAt}T12:00:00Z`,
  }));

  return [...fromProfile, ...fromGrades, ...fromAttempts, ...fromPayments, ...fromCerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getCourseTitle(courses: Course[], courseId: string) {
  return courses.find((c) => c.id === courseId)?.title ?? courseId;
}

export function issueCertificate(
  student: StudentProfile,
  courseId: string,
  courseTitle: string,
): StudentCertificate {
  return {
    id: `cert-${Date.now()}`,
    courseId,
    courseTitle,
    issuedAt: new Date().toISOString().slice(0, 10),
    status: "issued",
  };
}
