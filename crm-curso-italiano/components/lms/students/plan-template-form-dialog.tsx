"use client";

import { useEffect, useState } from "react";
import type { Course, LiveClassType, StudentPlanCycle, StudentPlanFeatures, StudentPlanTemplate } from "@lms-mocks/types";
import { defaultStudentPlanFeatures, STUDENT_FEATURE_LABELS } from "@lms-mocks/student-plan-access";
import { PLAN_CYCLE_LABELS } from "@/lib/students/access";
import { canAccessModule } from "@/lib/subscription/plans";
import { useMockStore } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlanTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  template?: StudentPlanTemplate | null;
  linkedStudentCount?: number;
  onSave: (input: Omit<StudentPlanTemplate, "id" | "tenantId">) => void;
}

export function PlanTemplateFormDialog({
  open,
  onOpenChange,
  courses,
  template,
  linkedStudentCount = 0,
  onSave,
}: PlanTemplateFormDialogProps) {
  const { tenant } = useMockStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<StudentPlanCycle>("monthly");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [features, setFeatures] = useState<StudentPlanFeatures>(defaultStudentPlanFeatures());
  const [unlimitedSessions, setUnlimitedSessions] = useState(true);

  const canLive = canAccessModule(tenant, "live");
  const canExerciseBank = canAccessModule(tenant, "exerciseBank");
  const canMockExams = canAccessModule(tenant, "mockExams");

  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setAmount(template ? String(template.amount) : "");
    setCycle(template?.cycle ?? "monthly");
    setCourseIds(template?.courseIds ?? (courses[0]?.id ? [courses[0].id] : []));
    const f = template?.features ?? defaultStudentPlanFeatures();
    setFeatures(structuredClone(f));
    setUnlimitedSessions(f.live.sessionsPerCycle === null);
  }, [open, template, courses]);

  function toggleCourse(courseId: string) {
    setCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  }

  function setAccess(key: keyof StudentPlanFeatures["access"], value: boolean) {
    setFeatures((prev) => {
      const next = structuredClone(prev);
      next.access[key] = value;
      if (key === "liveParticipation" && value) {
        next.live.enabled = true;
      }
      if (key === "liveParticipation" && !value && !next.access.liveRecordings) {
        next.live.enabled = false;
      }
      return next;
    });
  }

  function toggleClassType(type: LiveClassType) {
    setFeatures((prev) => {
      const next = structuredClone(prev);
      const has = next.live.classTypes.includes(type);
      next.live.classTypes = has
        ? next.live.classTypes.filter((t) => t !== type)
        : [...next.live.classTypes, type];
      return next;
    });
  }

  function handleSubmit() {
    if (!name.trim() || !amount || courseIds.length === 0) return;
    const liveConfig = { ...features.live };
    if (features.access.liveParticipation) {
      liveConfig.sessionsPerCycle = unlimitedSessions
        ? null
        : liveConfig.sessionsPerCycle ?? 4;
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      amount: parseFloat(amount),
      cycle,
      courseIds,
      active: template?.active ?? true,
      deactivatedAt: template?.deactivatedAt ?? null,
      features: {
        ...features,
        live: liveConfig,
      },
    });
    onOpenChange(false);
  }

  function FeatureToggle({
    featureKey,
    disabled,
    disabledReason,
  }: {
    featureKey: keyof StudentPlanFeatures["access"];
    disabled?: boolean;
    disabledReason?: string;
  }) {
    const id = `feature-${featureKey}`;
    const label = STUDENT_FEATURE_LABELS[featureKey];
    return (
      <label
        htmlFor={id}
        title={disabled ? disabledReason : undefined}
        className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="text-sm font-medium">{label}</span>
        <input
          id={id}
          type="checkbox"
          className="size-4"
          checked={features.access[featureKey]}
          disabled={disabled}
          onChange={(e) => setAccess(featureKey, e.target.checked)}
        />
      </label>
    );
  }

  const showLiveSection =
    features.access.liveParticipation || features.access.liveRecordings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Editar template" : "Novo template de plano"}</DialogTitle>
          <DialogDescription>
            Defina cobrança, cursos e permissões de acesso do aluno a recursos da plataforma.
          </DialogDescription>
        </DialogHeader>

        {linkedStudentCount > 0 && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            {linkedStudentCount} aluno(s) usam este template. Alterações não afetam planos já
            aplicados até reaplicar o template.
          </p>
        )}

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Identificação</h3>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Premium Mensal" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Resumo comercial do pacote"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ciclo</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value as StudentPlanCycle)}
                >
                  {(Object.keys(PLAN_CYCLE_LABELS) as StudentPlanCycle[]).map((c) => (
                    <option key={c} value={c}>
                      {PLAN_CYCLE_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Cursos incluídos</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {courses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                  {c.title}
                </label>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Permissões de acesso</h3>
            <div className="space-y-2">
              <FeatureToggle
                featureKey="liveRecordings"
                disabled={!canLive}
                disabledReason="Disponível no plano Pro ou superior da escola"
              />
              <FeatureToggle
                featureKey="liveParticipation"
                disabled={!canLive}
                disabledReason="Disponível no plano Pro ou superior da escola"
              />
              <FeatureToggle
                featureKey="exerciseBank"
                disabled={!canExerciseBank}
                disabledReason="Disponível no plano Pro ou superior da escola"
              />
              <FeatureToggle
                featureKey="mockExams"
                disabled={!canMockExams}
                disabledReason="Disponível no plano Pro ou superior da escola"
              />
            </div>
          </section>

          {showLiveSection && canLive && (
            <>
              <Separator />
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Aulas online</h3>
                {features.access.liveParticipation && (
                  <>
                    <p className="text-xs text-muted-foreground">Tipos de aula permitidos</p>
                    <div className="flex gap-3">
                      {(["group", "individual"] as LiveClassType[]).map((type) => (
                        <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={features.live.classTypes.includes(type)}
                            onChange={() => toggleClassType(type)}
                          />
                          {type === "group" ? "Grupo" : "Individual"}
                        </label>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={unlimitedSessions}
                        onChange={(e) => setUnlimitedSessions(e.target.checked)}
                      />
                      Aulas ilimitadas por ciclo
                    </label>
                    {!unlimitedSessions && (
                      <div className="space-y-2">
                        <Label>Sessões por ciclo</Label>
                        <Input
                          type="number"
                          min={1}
                          value={features.live.sessionsPerCycle ?? 4}
                          onChange={(e) =>
                            setFeatures((prev) => ({
                              ...prev,
                              live: {
                                ...prev.live,
                                sessionsPerCycle: parseInt(e.target.value, 10) || 1,
                              },
                            }))
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !amount || courseIds.length === 0}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
