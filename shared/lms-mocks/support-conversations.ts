import type { SupportConversation } from "./types";

export const seedSupportConversations: SupportConversation[] = [
  {
    id: "conv-ana-1",
    tenantId: "tenant-studio-italiano",
    studentId: "persona-ana",
    studentName: "Ana Silva",
    subject: "Dúvida sobre acesso ao curso A2",
    status: "waiting_support",
    createdAt: "2026-06-29T10:00:00Z",
    updatedAt: "2026-06-30T14:30:00Z",
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-ana-1",
        authorRole: "student",
        authorName: "Ana Silva",
        body: "Olá! Não consigo acessar o curso A2. Aparece bloqueado.",
        sentAt: "2026-06-29T10:00:00Z",
      },
      {
        id: "msg-2",
        conversationId: "conv-ana-1",
        authorRole: "staff",
        authorName: "Prof. Marco Rossi",
        body: "Oi Ana! Vou verificar sua matrícula e te retorno em breve.",
        sentAt: "2026-06-29T15:00:00Z",
      },
      {
        id: "msg-3",
        conversationId: "conv-ana-1",
        authorRole: "student",
        authorName: "Ana Silva",
        body: "Obrigada! Aguardo.",
        sentAt: "2026-06-30T14:30:00Z",
      },
    ],
  },
  {
    id: "conv-lucas-1",
    tenantId: "tenant-studio-italiano",
    studentId: "persona-lucas",
    studentName: "Lucas Mendes",
    subject: "Certificado A1",
    status: "resolved",
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-21T11:00:00Z",
    messages: [
      {
        id: "msg-4",
        conversationId: "conv-lucas-1",
        authorRole: "student",
        authorName: "Lucas Mendes",
        body: "Quando recebo o certificado do A1?",
        sentAt: "2026-06-20T09:00:00Z",
      },
      {
        id: "msg-5",
        conversationId: "conv-lucas-1",
        authorRole: "staff",
        authorName: "Prof. Marco Rossi",
        body: "Lucas, seu certificado será emitido após a correção da última redação. Já está em processamento!",
        sentAt: "2026-06-21T11:00:00Z",
      },
    ],
  },
];

export const SUPPORT_STATUS_LABELS: Record<SupportConversation["status"], string> = {
  open: "Aberta",
  waiting_student: "Aguardando aluno",
  waiting_support: "Aguardando escola",
  resolved: "Resolvida",
  closed: "Encerrada",
};

export function countOpenSupport(conversations: SupportConversation[], tenantId: string): number {
  return conversations.filter(
    (c) =>
      c.tenantId === tenantId &&
      (c.status === "open" || c.status === "waiting_support"),
  ).length;
}
