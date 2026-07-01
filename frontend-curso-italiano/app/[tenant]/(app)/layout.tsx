"use client";

import { StudentGuard } from "@/components/layout/student-guard";
import { useParams } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const tenantSlug = params.tenant as string;

  return <StudentGuard tenantSlug={tenantSlug}>{children}</StudentGuard>;
}
