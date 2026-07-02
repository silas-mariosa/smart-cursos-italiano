"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { getModuleForPath } from "@/lib/subscription/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { CRM_MODULE_LABELS } from "@lms-mocks/business-plans";
import { cn } from "@/lib/utils";

export function PlanGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessPath, plan } = useTenantPlan();
  const allowed = canAccessPath(pathname);
  const module = getModuleForPath(pathname);

  useEffect(() => {
    if (!allowed && module) {
      router.replace("/dashboard/plano");
    }
  }, [allowed, module, router]);

  if (!module || allowed) {
    return <>{children}</>;
  }

  return (
    <Card className="max-w-lg mx-auto mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-5 text-muted-foreground" />
          Módulo não disponível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <strong>{module ? CRM_MODULE_LABELS[module] : "Este módulo"}</strong> não faz parte do seu plano
          atual ({plan.label}). Faça upgrade para desbloquear.
        </p>
        <Link href="/dashboard/plano" className={cn(buttonVariants())}>
          Ver meu plano
        </Link>
      </CardContent>
    </Card>
  );
}
