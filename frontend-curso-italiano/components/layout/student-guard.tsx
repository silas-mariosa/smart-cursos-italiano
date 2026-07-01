"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { StudentShell } from "@/components/layout/student-shell";

export function StudentGuard({
  children,
  tenantSlug,
}: {
  children: React.ReactNode;
  tenantSlug: string;
}) {
  const { persona } = useDemoStudent();
  const router = useRouter();

  useEffect(() => {
    if (!persona) {
      router.replace(`/${tenantSlug}/auth/login`);
    }
  }, [persona, router, tenantSlug]);

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return <StudentShell tenantSlug={tenantSlug}>{children}</StudentShell>;
}
