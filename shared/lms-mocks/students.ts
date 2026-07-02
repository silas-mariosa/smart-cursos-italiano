import type { ActivityItem, DemoPersona, Grade, StudentProfile, WrittenAttempt } from "./types";

export {
  studentProfiles,
  resolveStudentStatus,
  createDefaultSkills,
  createEnrollment,
  createStudentProfile,
  getStudentStats,
  filterStudents,
  getStudentPendingAttempts,
  buildStudentTimeline,
  getCourseTitle,
  issueCertificate,
} from "./students-data";
import { studentProfiles } from "./students-data";

export const demoPersonas: DemoPersona[] = [
  {
    id: "persona-ana",
    role: "student",
    tenantId: "tenant-studio-italiano",
    name: "Ana Silva",
    email: "ana@demo.com",
    avatar: "AS",
    progressPercent: 45,
    description: "Iniciante — 45% do curso A1",
  },
  {
    id: "persona-lucas",
    role: "student",
    tenantId: "tenant-studio-italiano",
    name: "Lucas Mendes",
    email: "lucas@demo.com",
    avatar: "LM",
    progressPercent: 90,
    description: "Avançado — 90% do curso A1",
  },
  {
    id: "persona-maria",
    role: "student",
    tenantId: "tenant-studio-italiano",
    name: "Maria Costa",
    email: "maria@demo.com",
    avatar: "MC",
    progressPercent: 12,
    description: "Começando — 12% do curso A1",
  },
  {
    id: "persona-marco",
    role: "teacher",
    tenantId: "tenant-studio-italiano",
    tenantRole: "teacher",
    name: "Prof. Marco Rossi",
    email: "marco@studio-italiano.com",
    avatar: "MR",
    description: "Studio Italiano — Plano Pro",
  },
  {
    id: "persona-admin",
    role: "admin",
    tenantId: "tenant-grupo-linguas",
    tenantRole: "admin",
    name: "Admin Enterprise",
    email: "admin@grupo-linguas.com",
    avatar: "AE",
    description: "Grupo Línguas — Plano Enterprise",
  },
  {
    id: "persona-giulia",
    role: "teacher",
    tenantId: "tenant-roma-basica",
    tenantRole: "teacher",
    name: "Prof. Giulia Bianchi",
    email: "giulia@escola-roma.com",
    avatar: "GB",
    description: "Escola Roma Básica — Plano Básico",
  },
  {
    id: "persona-paolo",
    role: "teacher",
    tenantId: "tenant-accademia-plus",
    tenantRole: "teacher",
    name: "Prof. Paolo Verdi",
    email: "paolo@accademia-plus.com",
    avatar: "PV",
    description: "Accademia Italiana+ — Plano Básico+",
  },
  {
    id: "persona-custom",
    role: "admin",
    tenantId: "tenant-custom-academy",
    tenantRole: "admin",
    name: "Coord. Sofia Neri",
    email: "sofia@custom-academy.com",
    avatar: "SN",
    description: "Custom Academy — Plano Personalizado",
  },
];

export const initialGrades: Grade[] = [
  {
    id: "grade-1",
    studentId: "persona-ana",
    exerciseId: "MC-001",
    lessonId: "lesson-a1-1",
    courseId: "course-a1",
    title: "Quiz Aula 1 — Buongiorno",
    score: 100,
    maxScore: 100,
    feedback: "Corrigido automaticamente",
    status: "auto_graded",
    submittedAt: "2026-06-20T14:00:00Z",
  },
  {
    id: "grade-2",
    studentId: "persona-lucas",
    exerciseId: "WR-001",
    lessonId: "lesson-a1-3",
    courseId: "course-a1",
    title: "Redação M2 — Diálogo no restaurante",
    score: 85,
    maxScore: 100,
    feedback: "Bom uso do condizionale. Tente incluir 'grazie' no final.",
    status: "graded",
    submittedAt: "2026-06-22T10:00:00Z",
  },
];

export const initialWrittenAttempts: WrittenAttempt[] = [
  {
    id: "attempt-lucas-1",
    studentId: "persona-lucas",
    studentName: "Lucas Mendes",
    exerciseId: "WR-001",
    lessonId: "lesson-a1-3",
    courseId: "course-a1",
    courseTitle: "Italiano A1 — Primeiros passos",
    lessonTitle: "Ordinare al ristorante",
    prompt: "Escreva um diálogo curto pedindo a conta no restaurante (3–5 frases).",
    answer: "Il conto, per favore. Abbiamo mangiato molto bene!",
    status: "pending",
    score: null,
    maxScore: 10,
    feedback: null,
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "attempt-ana-1",
    studentId: "persona-ana",
    studentName: "Ana Silva",
    exerciseId: "WR-001",
    lessonId: "lesson-a1-3",
    courseId: "course-a1",
    courseTitle: "Italiano A1 — Primeiros passos",
    lessonTitle: "Ordinare al ristorante",
    prompt: "Escreva um diálogo curto pedindo a conta no restaurante (3–5 frases).",
    answer: "Vorrei la pizza margherita e una acqua, per favore.",
    status: "pending",
    score: null,
    maxScore: 10,
    feedback: null,
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const activityFeed: ActivityItem[] = [
  { id: "act-1", message: "Ana concluiu Aula 3 — Ordinare al ristorante", timestamp: "há 2h" },
  { id: "act-2", message: "Lucas enviou redação — A1 Aula 3", timestamp: "há 4h" },
  { id: "act-3", message: "Maria iniciou o curso A1", timestamp: "há 1d" },
];

export function getStudentProfile(studentId: string): StudentProfile | undefined {
  return studentProfiles.find((s) => s.id === studentId);
}

export function getPersonaById(id: string): DemoPersona | undefined {
  return demoPersonas.find((p) => p.id === id);
}
