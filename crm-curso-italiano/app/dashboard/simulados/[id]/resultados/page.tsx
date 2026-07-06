import { MockExamResultsPanel } from "@/components/lms/mock-exams/mock-exam-results-panel";

export default async function SimuladoResultadosDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MockExamResultsPanel examId={id} />;
}
