"use client";

import Link from "next/link";
import { BUSINESS_PLANS, CRM_MODULE_LABELS } from "@lms-mocks/business-plans";
import type { BusinessPlanTier } from "@lms-mocks/types";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, CreditCard, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_ORDER: BusinessPlanTier[] = ["basic", "basic_plus", "pro", "enterprise", "custom"];

function formatPrice(value: number | null) {
  if (value === null) return "Sob consulta";
  return `R$ ${value.toFixed(2).replace(".", ",")} / mês`;
}

export function PlanPanel() {
  const { plan, usage, tenant } = useTenantPlan();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="size-7 text-primary" />
          Plano da escola
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Seu plano de negócio define quais módulos do painel estão disponíveis e quantos alunos você
          pode cadastrar.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Plano atual</span>
              <Badge variant="secondary">{plan.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Valor</p>
                <p className="font-medium">{formatPrice(plan.priceMonthly)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{plan.subscriptionStatus}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Início</p>
                <p className="font-medium">{new Date(plan.startedAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Próximo vencimento</p>
                <p className="font-medium">{new Date(plan.nextBillingDate).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" />
              Uso de alunos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">
              {usage.current}
              {usage.max !== null ? ` / ${usage.max}` : " / ∞"}
            </div>
            {usage.max !== null && <Progress value={usage.percent ?? 0} />}
            <p className="text-xs text-muted-foreground">
              {usage.max === null
                ? "Alunos ilimitados no seu plano."
                : `${usage.max - usage.current} vagas restantes.`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Módulos incluídos no seu plano</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-2">
            {Object.entries(CRM_MODULE_LABELS).map(([key, label]) => {
              const included = plan.modules.includes(key as keyof typeof CRM_MODULE_LABELS);
              return (
                <li key={key} className="flex items-center gap-2 text-sm">
                  {included ? (
                    <Check className="size-4 text-green-600 shrink-0" />
                  ) : (
                    <X className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn(!included && "text-muted-foreground")}>{label}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Comparativo de planos</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const def = BUSINESS_PLANS[tier];
            const isCurrent = tenant.subscription.tier === tier;
            return (
              <Card key={tier} className={cn(isCurrent && "ring-2 ring-primary")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {def.label}
                    {isCurrent && <Badge>Atual</Badge>}
                  </CardTitle>
                  <p className="text-sm font-medium">{formatPrice(def.priceMonthly)}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{def.description}</p>
                  <p>
                    <strong>Alunos:</strong>{" "}
                    {def.maxStudents === null ? "Ilimitado" : `até ${def.maxStudents}`}
                  </p>
                  <p>
                    <strong>Cursos:</strong>{" "}
                    {def.maxCourses === null ? "Ilimitado" : `até ${def.maxCourses}`}
                  </p>
                  {!isCurrent && (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Upgrade — Fase 2
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Integração de pagamentos (Stripe/MP) — Fase 2. No demo, troque de perfil na tela de login
          para experimentar cada plano.
        </p>
        <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "px-0 mt-2 h-auto")}>
          Trocar perfil demo
        </Link>
      </div>
    </div>
  );
}
