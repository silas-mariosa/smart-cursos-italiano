"use client";

import type { LessonPracticeSettings, PracticeModuleId } from "@lms-mocks/lesson-practice-types";
import type { LessonBlock } from "@lms-mocks/types";
import type { Exercise } from "@lms-mocks/types";
import { HelpCircle, Layers, MessageCircle, Settings2, Eye } from "lucide-react";
import { QuizzesPanel } from "./quizzes-panel";
import { FlashcardsPanel } from "./flashcards-panel";
import { SimulatorPanel } from "./simulator-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const MODULES: { id: PracticeModuleId; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "quizzes", label: "Quizzes", icon: HelpCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "flashcards", label: "Flashcards", icon: Layers, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "simulator", label: "Simulador", icon: MessageCircle, color: "text-violet-600 bg-violet-50 border-violet-200" },
];

interface PracticeEditorProps {
  lessonId: string;
  settings: LessonPracticeSettings;
  exerciseBlocks: LessonBlock[];
  exercises: Exercise[];
  onSettingsChange: (settings: LessonPracticeSettings) => void;
  onExerciseBlocksChange: (blocks: LessonBlock[]) => void;
  previewUrl: string;
}

export function PracticeEditor({
  lessonId,
  settings,
  exerciseBlocks,
  exercises,
  onSettingsChange,
  onExerciseBlocksChange,
  previewUrl,
}: PracticeEditorProps) {
  const [activeModule, setActiveModule] = useState<PracticeModuleId | "settings">("quizzes");
  const [previewOpen, setPreviewOpen] = useState(false);

  const stats = {
    quizzes: exerciseBlocks.length,
    flashcards: settings.flashcards.length,
    simulator: settings.scenarios.length,
  };

  function patchSettings(patch: Partial<LessonPracticeSettings>) {
    onSettingsChange({ ...settings, ...patch });
  }

  function patchModule(id: PracticeModuleId, patch: Partial<LessonPracticeSettings["modules"][PracticeModuleId]>) {
    onSettingsChange({
      ...settings,
      modules: { ...settings.modules, [id]: { ...settings.modules[id], ...patch } },
    });
  }

  return (
    <div className="-mx-6 -mb-6 flex flex-col border-t bg-background" style={{ minHeight: "calc(100vh - 12rem)" }}>
      <div className="px-6 py-3 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {MODULES.map(({ id, label, icon: Icon, color }) => (
            <div
              key={id}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm", color, !settings.modules[id].enabled && "opacity-40")}
            >
              <Icon className="size-4" />
              <span className="font-medium">{label}</span>
              <Badge variant="secondary" className="text-xs h-5">{stats[id]}</Badge>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" size="sm">
              <Eye className="size-3.5 mr-1" /> Preview aluno
            </Button>
          </a>
          <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            Resumo
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 border-r shrink-0 p-3 space-y-1 bg-muted/10">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 mb-2">Módulos</p>
          {MODULES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveModule(id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                activeModule === id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
              {!settings.modules[id].enabled && <span className="ml-auto text-[10px] opacity-70">off</span>}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveModule("settings")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
              activeModule === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            <Settings2 className="size-4" />
            Configurações
          </button>

          <div className="pt-4 px-2 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Dicas</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Quizzes usam o banco global. Flashcards e simulador são salvos por aula. Desative módulos que não quiser exibir ao aluno.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 min-w-0">
          {activeModule === "quizzes" && (
            <QuizzesPanel
              exerciseBlocks={exerciseBlocks}
              exercises={exercises}
              intro={settings.modules.quizzes.intro}
              onIntroChange={(intro) => patchModule("quizzes", { intro })}
              onChange={onExerciseBlocksChange}
            />
          )}
          {activeModule === "flashcards" && (
            <FlashcardsPanel
              lessonId={lessonId}
              cards={settings.flashcards}
              intro={settings.modules.flashcards.intro}
              onIntroChange={(intro) => patchModule("flashcards", { intro })}
              onChange={(flashcards) => patchSettings({ flashcards })}
            />
          )}
          {activeModule === "simulator" && (
            <SimulatorPanel
              lessonId={lessonId}
              scenarios={settings.scenarios}
              intro={settings.modules.simulator.intro}
              onIntroChange={(intro) => patchModule("simulator", { intro })}
              onChange={(scenarios) => patchSettings({ scenarios })}
            />
          )}
          {activeModule === "settings" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="font-semibold mb-1">Configurações da prática</h3>
                <p className="text-sm text-muted-foreground">Controle quais módulos o aluno vê nesta aula.</p>
              </div>
              {MODULES.map(({ id, label, icon: Icon }) => (
                <Card key={id}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Icon className="size-4" />
                        {label}
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.modules[id].enabled}
                          onChange={(e) => patchModule(id, { enabled: e.target.checked })}
                          className="rounded"
                        />
                        Ativo
                      </label>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Ordem de exibição</Label>
                      <InputOrder
                        value={settings.modules[id].order}
                        onChange={(order) => patchModule(id, { order })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Texto introdutório</Label>
                      <Textarea
                        rows={2}
                        className="text-sm"
                        value={settings.modules[id].intro}
                        onChange={(e) => patchModule(id, { intro: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resumo da prática</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 pr-4">
              {MODULES.filter((m) => settings.modules[m.id].enabled).map(({ id, label }) => (
                <div key={id} className="flex justify-between text-sm border-b pb-2">
                  <span>{label}</span>
                  <Badge variant="outline">{stats[id]} itens</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InputOrder({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <select
      className="w-full h-9 border rounded-md px-2 text-sm bg-background"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {[0, 1, 2].map((n) => (
        <option key={n} value={n}>
          Posição {n + 1}
        </option>
      ))}
    </select>
  );
}
