export type CourseLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type CourseStatus = "draft" | "published";
export type LessonStatus = "draft" | "published";
export type BlockType = "video" | "text" | "pdf" | "audio" | "link" | "exercise";
export type ExerciseType = "multiple_choice" | "true_false" | "fill_blank" | "written_response";
export type ExerciseDifficulty = "easy" | "medium" | "hard";

export interface ExerciseGamification {
  difficulty: ExerciseDifficulty;
  xpReward: number;
  tags: string[];
}
export type AttemptStatus = "pending" | "graded" | "auto_graded";
export type DemoPersonaRole = "student" | "teacher" | "admin";
export type TenantMemberRole = "admin" | "teacher" | "student";

/** Módulos do painel CRM controlados pelo plano de negócio da escola */
export type CrmModule =
  | "overview"
  | "courses"
  | "live"
  | "practice"
  | "exerciseBank"
  | "mockExams"
  | "corrections"
  | "students"
  | "branding"
  | "aiGeneration"
  | "support";

export type StudentPlanFeature =
  | "courses"
  | "liveParticipation"
  | "liveRecordings"
  | "exerciseBank"
  | "mockExams";

export type LiveClassType = "group" | "individual";

export interface StudentPlanLiveConfig {
  enabled: boolean;
  classTypes: LiveClassType[];
  /** aulas ao vivo incluídas por ciclo; null = ilimitado */
  sessionsPerCycle: number | null;
}

export interface StudentPlanFeatures {
  live: StudentPlanLiveConfig;
  access: Record<Exclude<StudentPlanFeature, "courses">, boolean>;
}

export interface TenantAiConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  model: string;
  lastValidatedAt: string | null;
}

export type BusinessPlanTier = "basic" | "basic_plus" | "pro" | "enterprise" | "custom";

export type TenantSubscriptionStatus = "active" | "trial" | "expired";

export interface TenantSubscription {
  tier: BusinessPlanTier;
  /** Sobrescreve o limite do catálogo (ex.: plano personalizado) */
  maxStudents?: number | null;
  maxCourses?: number | null;
  /** Sobrescreve módulos do catálogo (ex.: plano personalizado) */
  modules?: CrmModule[];
  status: TenantSubscriptionStatus;
  startedAt: string;
  nextBillingDate: string;
  /** Nome comercial quando tier === "custom" */
  customLabel?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  landingFeatures: { icon: string; title: string; description: string }[];
  testimonials: { name: string; quote: string; avatar: string }[];
  subscription: TenantSubscription;
  integrations?: TenantIntegration[];
}

export interface VideoBlockContent {
  url: string;
  durationMinutes: number;
}

import type { PageDocument } from "./page-builder-types";

export interface TextBlockContent {
  html: string;
  /** Documento do page builder (fonte de verdade quando presente) */
  pageDocument?: PageDocument;
}

export interface PdfBlockContent {
  title: string;
  filename: string;
}

export interface AudioBlockContent {
  url: string;
  title: string;
}

export interface LinkBlockContent {
  url: string;
  label: string;
}

export interface ExerciseBlockContent {
  exerciseId: string;
}

export type BlockContent =
  | VideoBlockContent
  | TextBlockContent
  | PdfBlockContent
  | AudioBlockContent
  | LinkBlockContent
  | ExerciseBlockContent;

export interface LessonBlock {
  id: string;
  type: BlockType;
  order: number;
  content: BlockContent;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  order: number;
  status: LessonStatus;
  durationMinutes: number;
  blocks: LessonBlock[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  status: CourseStatus;
  thumbnailUrl: string;
  instructorName: string;
  modules: CourseModule[];
}

export interface MultipleChoiceConfig {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface TrueFalseConfig {
  statement: string;
  correct: boolean;
  explanation: string;
}

export interface FillBlankConfig {
  template: string;
  blanks: { id: string; answer: string; hint?: string }[];
  explanation: string;
}

export interface WrittenResponseConfig {
  prompt: string;
  maxWords?: number;
}

export type ExerciseConfig =
  | MultipleChoiceConfig
  | TrueFalseConfig
  | FillBlankConfig
  | WrittenResponseConfig;

export interface Exercise {
  id: string;
  tenantId: string;
  title: string;
  type: ExerciseType;
  config: ExerciseConfig;
  usedInLessonIds: string[];
  gamification?: ExerciseGamification;
}

export interface DemoPersona {
  id: string;
  role: DemoPersonaRole;
  tenantId: string;
  tenantRole?: TenantMemberRole;
  name: string;
  email: string;
  avatar: string;
  progressPercent?: number;
  description: string;
}

export interface StudentEnrollment {
  studentId: string;
  courseId: string;
  progressPercent: number;
  completedLessonIds: string[];
  lastLessonId: string | null;
  streakDays: number;
  enrolledAt?: string;
  /** Curso veio de um template de plano (vs. matrícula manual) */
  fromTemplateId?: string;
}

export type StudentStatus = "active" | "inactive" | "pending";
export type StudentPlanStatus = "active" | "overdue" | "trial" | "cancelled";
export type StudentPlanCycle = "monthly" | "semester" | "yearly";
export type StudentAccessSource = "manual" | "kiwify" | "hotmart";

export interface StudentPlan {
  name: string;
  amount: number;
  cycle: StudentPlanCycle;
  status: StudentPlanStatus;
  nextDueDate: string;
  /** Snapshot das permissões no momento da matrícula */
  features?: StudentPlanFeatures;
}

export interface StudentPlanTemplate {
  id: string;
  tenantId: string;
  name: string;
  amount: number;
  cycle: StudentPlanCycle;
  courseIds: string[];
  active: boolean;
  features: StudentPlanFeatures;
  description?: string;
  deactivatedAt?: string | null;
}

export interface StudentPayment {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: "paid" | "pending" | "failed";
}

export interface StudentCertificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  status: "issued" | "pending" | "revoked";
}

export type StudentHistoryType =
  | "lesson"
  | "exercise"
  | "payment"
  | "enrollment"
  | "certificate"
  | "login";

export interface StudentHistoryItem {
  id: string;
  type: StudentHistoryType;
  title: string;
  description?: string;
  timestamp: string;
}

export interface Grade {
  id: string;
  studentId: string;
  exerciseId: string;
  lessonId: string;
  courseId: string;
  title: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: AttemptStatus;
  submittedAt: string;
}

export interface WrittenAttempt {
  id: string;
  studentId: string;
  studentName: string;
  exerciseId: string;
  lessonId: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  prompt: string;
  answer: string;
  status: AttemptStatus;
  score: number | null;
  maxScore: number;
  feedback: string | null;
  submittedAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  phone?: string;
  status?: StudentStatus;
  plan?: StudentPlan;
  payments?: StudentPayment[];
  certificates?: StudentCertificate[];
  history?: StudentHistoryItem[];
  notes?: string;
  skills: { name: string; percent: number }[];
  enrollments: StudentEnrollment[];
  accessSource?: StudentAccessSource;
  provisionalPassword?: string;
  welcomeEmailSentAt?: string;
  planTemplateId?: string;
}

export type IntegrationProvider = "kiwify" | "hotmart";

export interface ProductCourseMapping {
  externalProductId: string;
  externalProductName: string;
  courseId: string;
  planTemplateId?: string;
}

export interface TenantIntegration {
  provider: IntegrationProvider;
  enabled: boolean;
  webhookUrl: string;
  webhookSecret: string;
  productMappings: ProductCourseMapping[];
}

export interface WebhookEvent {
  id: string;
  tenantId: string;
  provider: IntegrationProvider;
  type: "purchase_approved" | "refund" | "subscription_cancelled";
  buyerEmail: string;
  buyerName: string;
  productId: string;
  processedAt: string;
  status: "success" | "ignored" | "error";
  studentId?: string;
  message: string;
}

export type SupportConversationStatus =
  | "open"
  | "waiting_student"
  | "waiting_support"
  | "resolved"
  | "closed";

export type SupportMessageAuthorRole = "student" | "staff";

export interface SupportMessage {
  id: string;
  conversationId: string;
  authorRole: SupportMessageAuthorRole;
  authorName: string;
  body: string;
  sentAt: string;
}

export interface SupportConversation {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  subject: string;
  status: SupportConversationStatus;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
}
