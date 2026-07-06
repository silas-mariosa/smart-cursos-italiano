"use client";

import { useEffect, useState } from "react";
import type { SupportConversation } from "@lms-mocks/types";
import { SUPPORT_STATUS_LABELS } from "@lms-mocks/support-conversations";
import { SupportMessageComposer } from "@/components/lms/support-message-composer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SupportChatPanelProps {
  conversations: SupportConversation[];
  studentName: string;
  initialSubject?: string;
  onCreate: (subject: string, body: string) => void;
  onReply: (conversationId: string, body: string) => void;
}

export function SupportChatPanel({
  conversations,
  studentName,
  initialSubject,
  onCreate,
  onReply,
}: SupportChatPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const [newOpen, setNewOpen] = useState(false);
  const [subject, setSubject] = useState(initialSubject ?? "");
  const [firstMessage, setFirstMessage] = useState("");

  useEffect(() => {
    if (initialSubject) {
      setSubject(initialSubject);
      setNewOpen(true);
    }
  }, [initialSubject]);

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0] ?? null;
  const canReply = selected && selected.status !== "resolved" && selected.status !== "closed";

  function submitNew() {
    if (!subject.trim() || !firstMessage.trim()) return;
    onCreate(subject.trim(), firstMessage.trim());
    setNewOpen(false);
    setSubject("");
    setFirstMessage("");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Suporte</h1>
          <p className="text-muted-foreground text-sm">Converse com a escola — histórico salvo</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>Nova conversa</Button>
      </div>

      {newOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova conversa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Problema com pagamento" />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2">
              <Button onClick={submitNew} disabled={!subject.trim() || !firstMessage.trim()}>
                Enviar
              </Button>
              <Button variant="outline" onClick={() => setNewOpen(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr] min-h-[400px]">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full text-left border rounded-lg p-3 hover:bg-muted/50",
                  selected?.id === c.id && "ring-2 ring-primary",
                )}
              >
                <p className="font-medium text-sm line-clamp-1">{c.subject}</p>
                <Badge variant="outline" className="text-[10px] mt-1">
                  {SUPPORT_STATUS_LABELS[c.status]}
                </Badge>
              </button>
            ))
          )}
        </div>

        {selected ? (
          <Card className="flex flex-col">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">{selected.subject}</CardTitle>
              <Badge variant="outline">{SUPPORT_STATUS_LABELS[selected.status]}</Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 pt-4">
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[320px]">
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      m.authorRole === "student" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <p className="text-[10px] opacity-80">{m.authorName}</p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
              </div>
              {canReply && (
                <SupportMessageComposer
                  placeholder={`Responder como ${studentName}...`}
                  onSend={(body) => onReply(selected.id, body)}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed flex items-center justify-center">
            <CardContent className="text-muted-foreground text-sm py-16">
              Inicie uma conversa ou selecione uma existente
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
