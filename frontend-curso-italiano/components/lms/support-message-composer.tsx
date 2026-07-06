"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SupportMessageComposerProps {
  placeholder?: string;
  onSend: (body: string) => void;
}

export function SupportMessageComposer({ placeholder, onSend }: SupportMessageComposerProps) {
  const [body, setBody] = useState("");

  function send() {
    if (!body.trim()) return;
    onSend(body.trim());
    setBody("");
  }

  return (
    <div className="flex gap-2 pt-2 border-t">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? "Sua mensagem..."}
        rows={2}
        className="resize-none"
      />
      <Button onClick={send} disabled={!body.trim()} className="self-end shrink-0">
        Enviar
      </Button>
    </div>
  );
}
