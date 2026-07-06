import type {
  IntegrationProvider,
  ProductCourseMapping,
  StudentPlanTemplate,
  StudentProfile,
  SupportConversation,
  SupportMessage,
  Tenant,
  TenantIntegration,
  WebhookEvent,
} from "@lms-mocks/types";
import { createDefaultIntegration, generateProvisionalPassword } from "@lms-mocks/integrations";
import { planFromTemplate } from "@lms-mocks/student-plan-templates";
import { createEnrollment, createStudentProfile } from "@lms-mocks/students";

export function getTenantIntegrations(tenant: Tenant): TenantIntegration[] {
  if (tenant.integrations?.length) return tenant.integrations;
  return [
    createDefaultIntegration(tenant.slug, "kiwify"),
    createDefaultIntegration(tenant.slug, "hotmart"),
  ];
}

export function updateTenantIntegration(
  tenant: Tenant,
  provider: IntegrationProvider,
  patch: Partial<TenantIntegration>,
): Tenant {
  const current = getTenantIntegrations(tenant);
  const integrations = current.map((i) =>
    i.provider === provider ? { ...i, ...patch } : i,
  );
  return { ...tenant, integrations };
}

export function addProductMappingToTenant(
  tenant: Tenant,
  provider: IntegrationProvider,
  mapping: ProductCourseMapping,
): Tenant {
  const current = getTenantIntegrations(tenant);
  const integrations = current.map((i) =>
    i.provider === provider
      ? { ...i, productMappings: [...i.productMappings, mapping] }
      : i,
  );
  return { ...tenant, integrations };
}

export function removeProductMappingFromTenant(
  tenant: Tenant,
  provider: IntegrationProvider,
  externalProductId: string,
): Tenant {
  const current = getTenantIntegrations(tenant);
  const integrations = current.map((i) =>
    i.provider === provider
      ? {
          ...i,
          productMappings: i.productMappings.filter(
            (m) => m.externalProductId !== externalProductId,
          ),
        }
      : i,
  );
  return { ...tenant, integrations };
}

export type WebhookPurchaseInput = {
  tenant: Tenant;
  provider: IntegrationProvider;
  buyerName: string;
  buyerEmail: string;
  productId: string;
  students: StudentProfile[];
  planTemplates: StudentPlanTemplate[];
};

export type WebhookPurchaseResult = {
  student: StudentProfile;
  event: WebhookEvent;
  isNew: boolean;
};

export function processWebhookPurchase(input: WebhookPurchaseInput): WebhookPurchaseResult | null {
  const integrations = getTenantIntegrations(input.tenant);
  const integration = integrations.find((i) => i.provider === input.provider);
  if (!integration?.enabled) return null;

  const mapping = integration.productMappings.find((m) => m.externalProductId === input.productId);
  if (!mapping) return null;

  const template = mapping.planTemplateId
    ? input.planTemplates.find((t) => t.id === mapping.planTemplateId)
    : undefined;

  const courseIds = template?.courseIds ?? [mapping.courseId];
  const existing = input.students.find(
    (s) => s.email.toLowerCase() === input.buyerEmail.trim().toLowerCase(),
  );

  const provisionalPassword = generateProvisionalPassword();
  const now = new Date().toISOString();

  let student: StudentProfile;
  let isNew = false;

  if (existing) {
    const newEnrollments = courseIds
      .filter((cid) => !existing.enrollments.some((e) => e.courseId === cid))
      .map((courseId) => ({
        ...createEnrollment(existing.id, courseId),
        fromTemplateId: template?.id,
      }));
    student = {
      ...existing,
      status: "active",
      accessSource: input.provider,
      provisionalPassword: existing.provisionalPassword ?? provisionalPassword,
      welcomeEmailSentAt: now,
      plan: template ? planFromTemplate(template) : existing.plan,
      planTemplateId: template?.id ?? existing.planTemplateId,
      enrollments: [...existing.enrollments, ...newEnrollments],
    };
  } else {
    isNew = true;
    student = createStudentProfile({
      name: input.buyerName.trim(),
      email: input.buyerEmail.trim(),
      courseIds,
      template,
      accessSource: input.provider,
    });
    student = {
      ...student,
      status: "active",
      provisionalPassword,
      welcomeEmailSentAt: now,
    };
  }

  const event: WebhookEvent = {
    id: `wh-${Date.now()}`,
    tenantId: input.tenant.id,
    provider: input.provider,
    type: "purchase_approved",
    buyerEmail: input.buyerEmail.trim(),
    buyerName: input.buyerName.trim(),
    productId: input.productId,
    processedAt: now,
    status: "success",
    studentId: student.id,
    message: isNew ? "Aluno criado e matriculado" : "Aluno existente — matrícula atualizada",
  };

  return { student, event, isNew };
}

export function applyPlanTemplateToStudentProfile(
  student: StudentProfile,
  template: StudentPlanTemplate,
): StudentProfile {
  const newEnrollments = template.courseIds
    .filter((cid) => !student.enrollments.some((e) => e.courseId === cid))
    .map((courseId) => ({
      ...createEnrollment(student.id, courseId),
      fromTemplateId: template.id,
    }));

  return {
    ...student,
    planTemplateId: template.id,
    plan: planFromTemplate(template),
    enrollments: [...student.enrollments, ...newEnrollments],
  };
}

export function createSupportMessage(
  conversationId: string,
  authorRole: SupportMessage["authorRole"],
  authorName: string,
  body: string,
): SupportMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversationId,
    authorRole,
    authorName,
    body: body.trim(),
    sentAt: new Date().toISOString(),
  };
}

export function appendMessageToConversation(
  conversation: SupportConversation,
  message: SupportMessage,
): SupportConversation {
  const status =
    message.authorRole === "student"
      ? ("waiting_support" as const)
      : ("waiting_student" as const);
  return {
    ...conversation,
    status,
    updatedAt: message.sentAt,
    messages: [...conversation.messages, message],
  };
}
