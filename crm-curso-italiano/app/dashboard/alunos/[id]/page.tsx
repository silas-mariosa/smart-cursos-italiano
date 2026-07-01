"use client";

import { useParams } from "next/navigation";
import { StudentDetailPanel } from "@/components/lms/students/student-detail-panel";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  return <StudentDetailPanel studentId={studentId} />;
}
