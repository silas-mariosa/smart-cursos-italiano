"use client";

import { useState } from "react";
import type { StudentPlanTemplate } from "@lms-mocks/types";
import { STUDENT_FEATURE_LABELS } from "@lms-mocks/student-plan-access";
import { getCourseTitle } from "@lms-mocks/students";
import { PLAN_CYCLE_LABELS } from "@/lib/students/access";
import { useMockStore } from "@/lib/mock-store";
import { PlanTemplateFormDialog } from "@/components/lms/students/plan-template-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";

function activeFeatures(template: StudentPlanTemplate) {
  return (Object.entries(template.features.access) as [keyof typeof template.features.access, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([key]) => STUDENT_FEATURE_LABELS[key]);
}

export function PlanTemplatesPanel() {
  const {
    tenant,
    courses,
    students,
    planTemplates,
    addPlanTemplate,
    updatePlanTemplate,
    deletePlanTemplate,
    activatePlanTemplate,
    deactivatePlanTemplate,
  } = useMockStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudentPlanTemplate | null>(null);

  const tenantTemplates = planTemplates.filter((t) => t.tenantId === tenant.id);
  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(template: StudentPlanTemplate) {
    setEditing(template);
    setDialogOpen(true);
  }

  function handleSave(input: Omit<StudentPlanTemplate, "id" | "tenantId">) {
    if (editing) {
      updatePlanTemplate({ ...editing, ...input });
    } else {
      addPlanTemplate(input);
    }
  }

  function handleDelete(template: StudentPlanTemplate) {
    const result = deletePlanTemplate(template.id);
    if (!result.ok) {
      window.alert(result.error);
    }
  }

  function linkedCount(templateId: string) {
    return students.filter((s) => s.planTemplateId === templateId).length;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="size-7 text-primary" />
            Planos de alunos
          </h1>
          <p className="text-muted-foreground mt-1">
            Templates com cobrança, cursos e permissões de acesso (lives, banco, simulados).
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-2" />
          Novo template
        </Button>
      </div>

      {tenantTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum template cadastrado. Crie o primeiro pacote para seus alunos.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tenantTemplates.map((t) => {
            const chips = activeFeatures(t);
            const linked = linkedCount(t.id);
            return (
              <Card key={t.id} className={!t.active ? "opacity-75 border-dashed" : undefined}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      {t.name}
                      {!t.active && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                    </span>
                    <Badge variant="secondary">{PLAN_CYCLE_LABELS[t.cycle]}</Badge>
                  </CardTitle>
                  {t.description && (
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-medium">R$ {t.amount.toFixed(2)}</p>
                  <div>
                    <p className="text-muted-foreground mb-1">Cursos:</p>
                    <ul className="space-y-0.5">
                      {t.courseIds.map((cid) => (
                        <li key={cid}>• {getCourseTitle(tenantCourses, cid)}</li>
                      ))}
                    </ul>
                  </div>
                  {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {t.features.access.liveParticipation && t.features.live.enabled && (
                    <p className="text-xs text-muted-foreground">
                      Lives:{" "}
                      {t.features.live.classTypes.map((x) => (x === "group" ? "grupo" : "individual")).join(", ") ||
                        "—"}
                      {" · "}
                      {t.features.live.sessionsPerCycle === null
                        ? "ilimitadas/ciclo"
                        : `${t.features.live.sessionsPerCycle} sessões/ciclo`}
                    </p>
                  )}
                  {linked > 0 && (
                    <p className="text-xs text-muted-foreground">{linked} aluno(s) vinculado(s)</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                      <Pencil className="size-3.5 mr-1" />
                      Editar
                    </Button>
                    {t.active ? (
                      <Button variant="outline" size="sm" onClick={() => deactivatePlanTemplate(t.id)}>
                        <PowerOff className="size-3.5 mr-1" />
                        Desativar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => activatePlanTemplate(t.id)}>
                        <Power className="size-3.5 mr-1" />
                        Ativar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(t)}>
                      <Trash2 className="size-3.5 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PlanTemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courses={tenantCourses}
        template={editing}
        linkedStudentCount={editing ? linkedCount(editing.id) : 0}
        onSave={handleSave}
      />
    </div>
  );
}
