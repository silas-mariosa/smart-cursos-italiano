"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock-store";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlanGate } from "@/components/subscription/plan-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { persona } = useMockStore();
  const router = useRouter();

  useEffect(() => {
    if (!persona) router.replace("/login");
  }, [persona, router]);

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <DashboardShell>
      <PlanGate>{children}</PlanGate>
    </DashboardShell>
  );
}
