"use client";

import { useRouter } from "next/navigation";
import { demoPersonas } from "@lms-mocks/students";
import { useMockStore } from "@/lib/mock-store";
import { DemoBanner } from "@/components/demo-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const { login, tenant } = useMockStore();
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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div
              className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl text-white font-bold"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              LMS
            </div>
            <CardTitle>Painel da escola</CardTitle>
            <p className="text-sm text-muted-foreground">{tenant.name} — modo demonstração</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {staff.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLogin(p.id)}
                className="w-full flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors text-left"
              >
                <Avatar>
                  <AvatarFallback>{p.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <Badge variant="secondary">{p.role === "admin" ? "Admin" : "Professor"}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
