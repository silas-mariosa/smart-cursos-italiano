import type { SupportConversation, SupportMessage } from "@lms-mocks/types";

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
