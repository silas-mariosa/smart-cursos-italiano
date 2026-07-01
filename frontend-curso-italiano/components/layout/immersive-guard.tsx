"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { DemoBanner } from "@/components/demo-banner";

/** Guard sem shell — para Meet e telas fullscreen */
export function ImmersiveGuard({ children }: { children: React.ReactNode }) {
  const { persona } = useDemoStudent();
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params.tenant as string;

  useEffect(() => {
    if (!persona) {
      router.replace(`/${tenantSlug}/auth/login`);
    }
  }, [persona, router, tenantSlug]);

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#202124] text-white/70">
        Carregando...
      </div>
    );
  }

  return (
    <>
      <DemoBanner />
      {children}
    </>
  );
}
