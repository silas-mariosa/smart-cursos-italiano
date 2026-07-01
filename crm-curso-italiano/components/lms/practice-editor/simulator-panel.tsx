"use client";

import { useState } from "react";
import type { SimulatorScenario } from "@lms-mocks/practice-types";
import { GripVertical, MapPin, MessageSquare, Plus, Trash2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SimulatorPanelProps {
  scenarios: SimulatorScenario[];
  intro: string;
  onIntroChange: (intro: string) => void;
  onChange: (scenarios: SimulatorScenario[]) => void;
  lessonId: string;
}

function newScenario(lessonId: string): SimulatorScenario {
  return {
    id: `sim-${Date.now()}`,
    lessonId,
    title: "Novo cenário",
    description: "Descreva a situação para o aluno...",
    setting: "Roma, Itália",
    openingLine: "Buongiorno! Come posso aiutarla?",
    suggestedResponses: ["Buongiorno!", "Vorrei informazioni, per favore."],
    teacherHint: "Dica pedagógica para o professor.",
  };
}

export function SimulatorPanel({ scenarios, intro, onIntroChange, onChange, lessonId }: SimulatorPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(scenarios[0]?.id ?? null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function updateScenario(id: string, patch: Partial<SimulatorScenario>) {
    onChange(scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeScenario(id: string) {
    onChange(scenarios.filter((s) => s.id !== id));
  }

  function updateResponse(scenarioId: string, index: number, value: string) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    const responses = [...scenario.suggestedResponses];
    responses[index] = value;
    updateScenario(scenarioId, { suggestedResponses: responses });
  }

  function addResponse(scenarioId: string) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    updateScenario(scenarioId, { suggestedResponses: [...scenario.suggestedResponses, ""] });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs">Introdução exibida ao aluno</Label>
        <Input value={intro} onChange={(e) => onIntroChange(e.target.value)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Cenários de conversação ({scenarios.length})</h3>
          <p className="text-xs text-muted-foreground">Simulador tipo chat · Google Meet style</p>
        </div>
        <Button type="button" size="sm" onClick={() => onChange([...scenarios, newScenario(lessonId)])}>
          <Plus className="size-4 mr-1" /> Novo cenário
        </Button>
      </div>

      <div className="space-y-4">
        {scenarios.map((scenario, index) => {
          const open = expandedId === scenario.id;
          return (
            <div
              key={scenario.id}
              draggable
              onDragStart={() => setDraggedId(scenario.id)}
              onDragEnd={() => setDraggedId(null)}
              className={cn("rounded-xl border bg-card overflow-hidden", draggedId === scenario.id && "opacity-50")}
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/30"
                onClick={() => setExpandedId(open ? null : scenario.id)}
              >
                <GripVertical className="size-4 text-muted-foreground cursor-grab shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">Cenário {index + 1}</Badge>
                    <span className="font-medium text-sm truncate">{scenario.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" /> {scenario.setting}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeScenario(scenario.id);
                  }}
                >
                  <Trash2 className="size-4 text-red-500" />
                </Button>
              </button>

              {open && (
                <div className="p-4 border-t space-y-4 bg-muted/10">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Título</Label>
                      <Input value={scenario.title} onChange={(e) => updateScenario(scenario.id, { title: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cenário / Local</Label>
                      <Input value={scenario.setting} onChange={(e) => updateScenario(scenario.id, { setting: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição para o aluno</Label>
                    <Textarea rows={2} value={scenario.description} onChange={(e) => updateScenario(scenario.id, { description: e.target.value })} />
                  </div>

                  <div className="rounded-lg border bg-background p-3 space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <MessageSquare className="size-3.5" /> Fala inicial (NPC)
                    </Label>
                    <Input
                      className="font-medium italic"
                      value={scenario.openingLine}
                      onChange={(e) => updateScenario(scenario.id, { openingLine: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Respostas sugeridas</Label>
                    {scenario.suggestedResponses.map((resp, ri) => (
                      <Input
                        key={ri}
                        value={resp}
                        placeholder={`Resposta ${ri + 1}`}
                        onChange={(e) => updateResponse(scenario.id, ri, e.target.value)}
                      />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addResponse(scenario.id)}>
                      <Plus className="size-3 mr-1" /> Resposta
                    </Button>
                  </div>

                  <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 space-y-1">
                    <Label className="text-xs flex items-center gap-1 text-amber-900">
                      <Lightbulb className="size-3.5" /> Dica do professor (só CRM)
                    </Label>
                    <Textarea
                      rows={2}
                      className="bg-white text-sm"
                      value={scenario.teacherHint}
                      onChange={(e) => updateScenario(scenario.id, { teacherHint: e.target.value })}
                    />
                  </div>

                  <div className="rounded-xl bg-slate-900 text-white p-4 text-sm">
                    <p className="text-xs text-slate-400 mb-2">Preview do diálogo</p>
                    <div className="space-y-2">
                      <div className="bg-slate-700 rounded-lg px-3 py-2 max-w-[85%]">{scenario.openingLine}</div>
                      {scenario.suggestedResponses.filter(Boolean).map((r, i) => (
                        <div key={i} className="bg-primary rounded-lg px-3 py-2 max-w-[85%] ml-auto text-primary-foreground">
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {scenarios.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <MessageSquare className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum cenário de conversação</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => onChange([newScenario(lessonId)])}>
              Criar cenário
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
