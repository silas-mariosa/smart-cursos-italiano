"use client";

import { useMockStore } from "@/lib/mock-store";
import { SupportInboxPanel } from "@/components/support/support-inbox-panel";
import { MessageCircle } from "lucide-react";

export function SupportPagePanel() {
  const {
    persona,
    tenant,
    supportConversations,
    addSupportMessage,
    updateSupportConversationStatus,
  } = useMockStore();

  const tenantConversations = supportConversations.filter((c) => c.tenantId === tenant.id);
  const staffName = persona?.name ?? "Equipe";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="size-7 text-primary" />
          Suporte
        </h1>
        <p className="text-muted-foreground mt-1">
          Conversas dos alunos com a escola. Responda e acompanhe o status.
        </p>
      </div>
      <SupportInboxPanel
        conversations={tenantConversations}
        staffName={staffName}
        onReply={(id, body) => addSupportMessage(id, "staff", staffName, body)}
        onStatusChange={updateSupportConversationStatus}
      />
    </div>
  );
}
