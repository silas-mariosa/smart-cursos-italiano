"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MockExam, MockExamShowResults, MockExamStatus } from "@lms-mocks/mock-exam-types";
import type { Exercise } from "@lms-mocks/types";
import { getExercisePromptText } from "@lms-mocks/exercises";
import { useMockStore } from "@/lib/mock-store";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Wand2, Plus, X } from "lucide-react";

interface MockExamEditorProps {
  examId?: string;
}

export function MockExamEditor({ examId }: MockExamEditorProps) {
  const router = useRouter();
  const {
    tenant,
    courses,
    exercises,
    planTemplates,
    mockExams,
    addMockExam,
    updateMockExam,
    addExercise,
  } = useMockStore();
  const { canUseAiGeneration } = useTenantPlan();

  const existing = examId ? mockExams.find((e) => e.id === examId) : undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [passingScorePercent, setPassingScorePercent] = useState("60");
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showResultsAfter, setShowResultsAfter] = useState<MockExamShowResults>("immediate");
  const [status, setStatus] = useState<MockExamStatus>("draft");
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [courseId, setCourseId] = useState("");
  const [planTemplateIds, setPlanTemplateIds] = useState<string[]>([]);
  const [bankSearch, setBankSearch] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiQuantity, setAiQuantity] = useState("5");

  const tenantExercises = exercises.filter((e) => e.tenantId === tenant.id && e.type !== "written_response");
  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);
  const tenantPlans = planTemplates.filter((t) => t.tenantId === tenant.id && t.active);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setDurationMinutes(String(existing.durationMinutes));
    setPassingScorePercent(String(existing.passingScorePercent));
    setShuffleQuestions(existing.shuffleQuestions);
    setShowResultsAfter(existing.showResultsAfter);
    setStatus(existing.status);
    setQuestionIds([...existing.questionIds]);
    setTags(existing.tags.join(", "));
    setCourseId(existing.courseId ?? "");
    setPlanTemplateIds(existing.planTemplateIds ?? []);
  }, [existing]);

  const bankFiltered = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return tenantExercises;
    return tenantExercises.filter(
      (e) => e.title.toLowerCase().includes(q) || getExercisePromptText(e).toLowerCase().includes(q),
    );
  }, [tenantExercises, bankSearch]);

  const selectedExercises = questionIds
    .map((id) => tenantExercises.find((e) => e.id === id))
    .filter((e): e is Exercise => !!e);

  function toggleQuestion(id: string) {
    setQuestionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function togglePlan(id: string) {
    setPlanTemplateIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleAutoGenerate() {
    const pool = tenantExercises.filter((e) => e.type === "multiple_choice" || e.type === "true_false");
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const pick = shuffled.slice(0, Math.min(5, shuffled.length)).map((e) => e.id);
    setQuestionIds((prev) => [...new Set([...prev, ...pick])]);
  }

  function handleAiGenerate() {
    if (!canUseAiGeneration) return;
    const qty = Math.min(10, Math.max(1, parseInt(aiQuantity, 10) || 3));
    const newIds: string[] = [];
    for (let i = 0; i < qty; i++) {
      const ex = addExercise({
        tenantId: tenant.id,
        title: `IA: ${aiPrompt.slice(0, 40) || "Questão gerada"} #${i + 1}`,
        type: "multiple_choice",
        config: {
          question: aiPrompt || "Questão simulada gerada por IA (demo)",
          options: [
            { id: "a", text: "Opção A" },
            { id: "b", text: "Opção B" },
            { id: "c", text: "Opção C" },
            { id: "d", text: "Opção D" },
          ],
          correctOptionId: "a",
          explanation: "",
        },
      });
      newIds.push(ex.id);
    }
    setQuestionIds((prev) => [...prev, ...newIds]);
    setAiOpen(false);
  }

  function handleSave(publish?: boolean) {
    if (!title.trim() || questionIds.length === 0) return;
    const payload: Omit<MockExam, "id" | "tenantId" | "createdAt"> = {
      title: title.trim(),
      description: description.trim(),
      status: publish ? "published" : status,
      durationMinutes: parseInt(durationMinutes, 10) || 30,
      passingScorePercent: parseInt(passingScorePercent, 10) || 60,
      shuffleQuestions,
      showResultsAfter,
      questionIds,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      courseId: courseId || undefined,
      planTemplateIds: planTemplateIds.length > 0 ? planTemplateIds : undefined,
    };

    if (existing) {
      updateMockExam({ ...existing, ...payload });
    } else {
      addMockExam(payload);
    }
    router.push("/dashboard/simulados");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{existing ? "Editar simulado" : "Novo simulado"}</h1>
        <p className="text-muted-foreground mt-1">Monte a prova com questões do banco, IA ou geração automática.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nota mínima (%)</Label>
              <Input type="number" value={passingScorePercent} onChange={(e) => setPassingScorePercent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Curso (opcional)</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">—</option>
                {tenantCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />
              Embaralhar questões
            </label>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Resultado:</Label>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={showResultsAfter}
                onChange={(e) => setShowResultsAfter(e.target.value as MockExamShowResults)}
              >
                <option value="immediate">Imediato</option>
                <option value="manual">Após revisão</option>
                <option value="never">Nunca</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags (vírgula)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="A1, gramática" />
          </div>
          {tenantPlans.length > 0 && (
            <div className="space-y-2">
              <Label>Restringir a planos (vazio = todos com simulados)</Label>
              <div className="flex flex-wrap gap-2">
                {tenantPlans.map((p) => (
                  <label key={p.id} className="flex items-center gap-1.5 text-sm border rounded px-2 py-1">
                    <input type="checkbox" checked={planTemplateIds.includes(p.id)} onChange={() => togglePlan(p.id)} />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Questões ({questionIds.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoGenerate}>
              <Wand2 className="size-4 mr-1" />
              Auto (servidor)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Sparkles className="size-4 mr-1" />
              Gerar com IA
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedExercises.length > 0 && (
            <ul className="space-y-1 border rounded-lg p-2">
              {selectedExercises.map((ex, i) => (
                <li key={ex.id} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-6">{i + 1}.</span>
                  <span className="flex-1 truncate">{ex.title}</span>
                  <Button variant="ghost" size="sm" className="size-7 px-0" onClick={() => toggleQuestion(ex.id)}>
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Input placeholder="Buscar no banco..." value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} />
          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
            {bankFiltered.map((ex) => (
              <label key={ex.id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                <input type="checkbox" checked={questionIds.includes(ex.id)} onChange={() => toggleQuestion(ex.id)} />
                <span className="truncate">{ex.title}</span>
                <Badge variant="outline" className="text-[10px] ml-auto">{ex.type}</Badge>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push("/dashboard/simulados")}>
          Cancelar
        </Button>
        <Button variant="outline" onClick={() => handleSave(false)}>
          Salvar rascunho
        </Button>
        <Button onClick={() => handleSave(true)}>
          Publicar
        </Button>
      </div>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar questões com IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Prompt / tema</Label>
              <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ex: passato prossimo, nível A2" />
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" min={1} max={10} value={aiQuantity} onChange={(e) => setAiQuantity(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAiGenerate}>
              <Plus className="size-4 mr-1" />
              Gerar (demo)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
