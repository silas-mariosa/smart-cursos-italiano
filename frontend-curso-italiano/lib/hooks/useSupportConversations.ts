"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupportConversation, SupportConversationStatus } from "@lms-mocks/types";
import { seedSupportConversations } from "@lms-mocks/support-conversations";
import { appendMessageToConversation, createSupportMessage } from "@/lib/support/helpers";
import {
  getStoredSupportConversations,
  setStoredSupportConversations,
} from "@lms-mocks/storage";

export function useSupportConversations(studentId: string | undefined, tenantId: string | undefined) {
  const [conversations, setConversations] = useState<SupportConversation[]>(seedSupportConversations);

  const reload = useCallback(() => {
    setConversations(getStoredSupportConversations());
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 2000);
    return () => clearInterval(interval);
  }, [reload]);

  const mine = conversations.filter(
    (c) => c.studentId === studentId && c.tenantId === tenantId,
  );

  const createConversation = useCallback(
    (subject: string, body: string, studentName: string) => {
      if (!studentId || !tenantId) return null;
      const id = `conv-${Date.now()}`;
      const now = new Date().toISOString();
      const msg = createSupportMessage(id, "student", studentName, body);
      const conversation: SupportConversation = {
        id,
        tenantId,
        studentId,
        studentName,
        subject,
        status: "open",
        createdAt: now,
        updatedAt: now,
        messages: [msg],
      };
      const all = getStoredSupportConversations();
      const next = [conversation, ...all];
      setStoredSupportConversations(next);
      setConversations(next);
      return conversation;
    },
    [studentId, tenantId],
  );

  const addMessage = useCallback(
    (conversationId: string, studentName: string, body: string) => {
      const all = getStoredSupportConversations();
      const msg = createSupportMessage(conversationId, "student", studentName, body);
      const next = all.map((c) =>
        c.id === conversationId ? appendMessageToConversation(c, msg) : c,
      );
      setStoredSupportConversations(next);
      setConversations(next);
    },
    [],
  );

  const updateStatus = useCallback((conversationId: string, status: SupportConversationStatus) => {
    const all = getStoredSupportConversations();
    const next = all.map((c) =>
      c.id === conversationId ? { ...c, status, updatedAt: new Date().toISOString() } : c,
    );
    setStoredSupportConversations(next);
    setConversations(next);
  }, []);

  return { conversations: mine, createConversation, addMessage, updateStatus };
}
