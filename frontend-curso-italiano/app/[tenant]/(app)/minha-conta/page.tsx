"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { useStoredStudentProfile } from "@/lib/hooks/useStoredStudentProfile";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { StudentAccountPanel } from "@/components/lms/student-account-panel";

export default function MinhaContaPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const { persona } = useDemoStudent();
  const profile = useStoredStudentProfile(persona?.id);
  const courses = useDemoCourses();

  if (!persona || !profile) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/${tenantSlug}/dashboard`} className="text-sm text-primary hover:underline mb-6 inline-block">
        ← Dashboard
      </Link>
      <StudentAccountPanel profile={profile} courses={courses} tenantSlug={tenantSlug} />
    </div>
  );
}
