"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import type { SimulatorScenario } from "@lms-mocks/practice-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ConversationSimulator({ scenarios }: { scenarios: SimulatorScenario[] }) {
  const [activeId, setActiveId] = useState(scenarios[0]?.id ?? "");
  const [messages, setMessages] = useState<{ role: "npc" | "user"; text: string }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const scenario = scenarios.find((s) => s.id === activeId);

  function startScenario(s: SimulatorScenario) {
    setActiveId(s.id);
    setMessages([{ role: "npc", text: s.openingLine }]);
    setFeedback(null);
  }

  function respond(text: string) {
    if (!scenario) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setFeedback(`Boa resposta! ${scenario.teacherHint}`);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "npc", text: "Perfetto! Continuiamo..." },
      ]);
    }, 800);
  }

  if (scenarios.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        Simulador disponível após completar o conteúdo da aula.
      </div>
    );
  }

  if (!scenario) return null;

  const isStarted = messages.length > 0;

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">Cenários</p>
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => startScenario(s)}
            className={cn(
              "w-full text-left rounded-lg border p-3 transition-colors",
              activeId === s.id ? "border-primary bg-primary/5" : "hover:bg-accent",
            )}
          >
            <p className="font-medium text-sm">{s.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.setting}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden flex flex-col min-h-[420px]">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{scenario.title}</p>
            <Badge variant="secondary" className="mt-1">{scenario.setting}</Badge>
          </div>
          <MessageCircle className="size-5 text-muted-foreground" />
        </div>

        {!isStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="size-10 text-primary mb-4" />
            <p className="text-muted-foreground mb-6 max-w-sm">{scenario.description}</p>
            <Button onClick={() => startScenario(scenario)}>Iniciar simulação</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "npc"
                      ? "bg-muted mr-auto rounded-bl-sm"
                      : "bg-primary text-primary-foreground ml-auto rounded-br-sm",
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {feedback && (
                <div className="rounded-lg bg-emerald-50 text-emerald-900 text-sm p-3 border border-emerald-200">
                  {feedback}
                </div>
              )}
            </div>

            <div className="p-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground">Sugestões de resposta:</p>
              <div className="flex flex-wrap gap-2">
                {scenario.suggestedResponses.map((r) => (
                  <Button key={r} variant="outline" size="sm" onClick={() => respond(r)}>
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
