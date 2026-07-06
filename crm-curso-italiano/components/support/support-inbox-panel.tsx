"use client";

import { useMemo, useState } from "react";
import type { SupportConversation, SupportConversationStatus } from "@lms-mocks/types";
import { formatRelativeTime } from "@/lib/corrections/utils";
import { SupportStatusBadge } from "@/components/support/support-status-badge";
import { SupportThreadPanel } from "@/components/support/support-thread-panel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

const FILTERS: { value: SupportConversationStatus | "all" | "active"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Pendentes" },
  { value: "open", label: "Abertas" },
  { value: "waiting_support", label: "Aguardando escola" },
  { value: "waiting_student", label: "Aguardando aluno" },
  { value: "resolved", label: "Resolvidas" },
  { value: "closed", label: "Encerradas" },
];

interface SupportInboxPanelProps {
  conversations: SupportConversation[];
  staffName: string;
  filterStudentId?: string;
  onSelect?: (id: string) => void;
  onReply: (conversationId: string, body: string) => void;
  onStatusChange: (conversationId: string, status: SupportConversationStatus) => void;
}

export function SupportInboxPanel({
  conversations,
  staffName,
  filterStudentId,
  onReply,
  onStatusChange,
}: SupportInboxPanelProps) {
  const [filter, setFilter] = useState<SupportConversationStatus | "all" | "active">("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = conversations;
    if (filterStudentId) list = list.filter((c) => c.studentId === filterStudentId);
    if (filter === "active") {
      return list.filter((c) => c.status === "open" || c.status === "waiting_support");
    }
    if (filter !== "all") return list.filter((c) => c.status === filter);
    return list;
  }, [conversations, filter, filterStudentId]);

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr] min-h-[480px]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "text-xs px-2 py-1 rounded-md border transition-colors",
                filter === f.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma conversa neste filtro.
              </CardContent>
            </Card>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50",
                  selected?.id === c.id && "ring-2 ring-primary bg-muted/30",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-sm line-clamp-1">{c.subject}</span>
                  <SupportStatusBadge status={c.status} />
                </div>
                <p className="text-xs text-muted-foreground">{c.studentName}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(c.updatedAt)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <SupportThreadPanel
          conversation={selected}
          staffName={staffName}
          onReply={(body) => onReply(selected.id, body)}
          onStatusChange={(status) => onStatusChange(selected.id, status)}
        />
      ) : (
        <Card className="border-dashed flex items-center justify-center">
          <CardContent className="text-center text-muted-foreground py-16">
            <MessageCircle className="size-10 mx-auto mb-3 opacity-40" />
            Selecione uma conversa
          </CardContent>
        </Card>
      )}
    </div>
  );
}
