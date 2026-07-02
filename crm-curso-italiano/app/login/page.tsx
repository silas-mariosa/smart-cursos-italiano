"use client";

import { useRouter } from "next/navigation";
import { demoPersonas } from "@lms-mocks/students";
import { getDemoTenant } from "@lms-mocks/tenant";
import { getPlanDefinition } from "@lms-mocks/business-plans";
import { useMockStore } from "@/lib/mock-store";
import { DemoBanner } from "@/components/demo-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const { login } = useMockStore();
  const router = useRouter();
  const staff = demoPersonas.filter((p) => p.role === "teacher" || p.role === "admin");

  function handleLogin(id: string) {
    login(id);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Painel da escola</CardTitle>
            <p className="text-sm text-muted-foreground">
              Escolha um perfil demo — cada um representa um plano de negócio diferente
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {staff.map((p) => {
              const tenant = getDemoTenant(p.tenantId);
              const plan = tenant ? getPlanDefinition(tenant.subscription.tier) : null;
              const planLabel =
                tenant?.subscription.tier === "custom" && tenant.subscription.customLabel
                  ? tenant.subscription.customLabel
                  : plan?.label;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleLogin(p.id)}
                  className="w-full flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors text-left"
                >
                  <Avatar>
                    <AvatarFallback>{p.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{tenant?.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="secondary">{p.role === "admin" ? "Admin" : "Professor"}</Badge>
                    {planLabel && (
                      <Badge variant="outline" className="text-[10px]">
                        {planLabel}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
