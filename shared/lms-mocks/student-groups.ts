export interface StudentGroup {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  courseId?: string;
  studentIds: string[];
}

export const seedStudentGroups: StudentGroup[] = [
  {
    id: "group-a1-manha",
    tenantId: "tenant-studio-italiano",
    name: "Turma A1 — Manhã",
    description: "Alunos com preferência por aulas matinais",
    courseId: "course-a1",
    studentIds: ["persona-ana", "persona-maria"],
  },
  {
    id: "group-a1-avancados",
    tenantId: "tenant-studio-italiano",
    name: "A1 — Avançados",
    description: "Alunos com progresso acima de 40% no A1",
    courseId: "course-a1",
    studentIds: ["persona-lucas", "persona-ana"],
  },
  {
    id: "group-a1-todos",
    tenantId: "tenant-studio-italiano",
    name: "Todos os alunos A1",
    courseId: "course-a1",
    studentIds: ["persona-ana", "persona-lucas", "persona-maria"],
  },
];

export function getStudentGroupsForCourse(tenantId: string, courseId: string): StudentGroup[] {
  return seedStudentGroups.filter(
    (g) => g.tenantId === tenantId && (!g.courseId || g.courseId === courseId),
  );
}
