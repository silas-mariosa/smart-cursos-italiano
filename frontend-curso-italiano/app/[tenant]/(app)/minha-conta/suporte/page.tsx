"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTenant } from "@/lib/context/TenantContext";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { useSupportConversations } from "@/lib/hooks/useSupportConversations";
import { SupportChatPanel } from "@/components/lms/support-chat-panel";

export default function SuportePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantSlug = params.tenant as string;
  const { tenant } = useTenant();
  const { persona } = useDemoStudent();
  const subject = searchParams.get("subject") ?? undefined;

  const { conversations, createConversation, addMessage } = useSupportConversations(
    persona?.id,
    tenant.id,
  );

  if (!persona) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/${tenantSlug}/minha-conta`} className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Minha conta
      </Link>
      <SupportChatPanel
        conversations={conversations}
        studentName={persona.name}
        initialSubject={subject}
        onCreate={(s, body) => createConversation(s, body, persona.name)}
        onReply={(id, body) => addMessage(id, persona.name, body)}
      />
    </div>
  );
}
