"use client";

import { useState } from "react";
import type { SupportConversation, SupportConversationStatus } from "@lms-mocks/types";
import { SupportStatusBadge } from "@/components/support/support-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SupportThreadPanelProps {
  conversation: SupportConversation;
  staffName: string;
  onReply: (body: string) => void;
  onStatusChange: (status: SupportConversationStatus) => void;
}

export function SupportThreadPanel({
  conversation,
  staffName,
  onReply,
  onStatusChange,
}: SupportThreadPanelProps) {
  const [reply, setReply] = useState("");
  const canReply = conversation.status !== "resolved" && conversation.status !== "closed";

  function send() {
    if (!reply.trim()) return;
    onReply(reply.trim());
    setReply("");
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{conversation.subject}</CardTitle>
          <SupportStatusBadge status={conversation.status} />
        </div>
        <p className="text-sm text-muted-foreground">{conversation.studentName}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {canReply && (
            <>
              <Button size="sm" variant="outline" onClick={() => onStatusChange("resolved")}>
                Marcar resolvida
              </Button>
              <Button size="sm" variant="outline" onClick={() => onStatusChange("closed")}>
                Encerrar
              </Button>
            </>
          )}
          {(conversation.status === "resolved" || conversation.status === "closed") && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange("open")}>
              Reabrir
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 pt-4 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-1">
          {conversation.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                m.authorRole === "staff"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              <p className="text-[10px] opacity-80 mb-0.5">{m.authorName}</p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>
        {canReply && (
          <div className="flex gap-2 pt-2 border-t">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Responder como ${staffName}...`}
              rows={2}
              className="resize-none"
            />
            <Button onClick={send} disabled={!reply.trim()} className="shrink-0 self-end">
              Enviar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
