import { MockExamEditor } from "@/components/lms/mock-exams/mock-exam-editor";

export default async function EditarSimuladoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MockExamEditor examId={id} />;
}
