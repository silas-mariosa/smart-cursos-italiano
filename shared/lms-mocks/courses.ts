import type { Course } from "./types";
import { normalizeCourses } from "./course-slugs";

const seedCoursesRaw: Course[] = [
  {
    id: "course-a1",
    tenantId: "tenant-studio-italiano",
    title: "Italiano A1 — Primeiros passos",
    slug: "italiano-a1",
    description:
      "Aprenda saudações, gramática básica, números e situações do dia a dia em italiano. Curso ideal para iniciantes absolutos.",
    level: "A1",
    status: "published",
    thumbnailUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=240&fit=crop",
    instructorName: "Prof. Marco Rossi",
    modules: [
      {
        id: "mod-a1-1",
        courseId: "course-a1",
        title: "Primeiros passos",
        slug: "primeiros-passos",
        description: "Fundamentos do idioma italiano e introdução à cultura.",
        order: 1,
        lessons: [
          {
            id: "lesson-a1-1",
            moduleId: "mod-a1-1",
            title: "Base do idioma italiano",
            slug: "base-do-idioma-italiano",
            order: 1,
            status: "published",
            durationMinutes: 12,
            blocks: [
              {
                id: "block-a1-1-1",
                type: "video",
                order: 1,
                content: {
                  url: "https://www.youtube.com/embed/0WPFwid_kEk",
                  durationMinutes: 8,
                },
              },
              {
                id: "block-a1-1-2",
                type: "text",
                order: 2,
                content: {
                  html: `<h3>Saudações essenciais</h3>
<p>Em italiano, as saudações variam conforme o horário e o grau de formalidade:</p>
<ul>
<li><strong>Buongiorno</strong> — Bom dia (formal)</li>
<li><strong>Buonasera</strong> — Boa noite (formal, ao chegar)</li>
<li><strong>Ciao</strong> — Olá / Tchau (informal)</li>
<li><strong>Arrivederci</strong> — Até logo (formal)</li>
</ul>`,
                },
              },
              {
                id: "block-a1-1-3",
                type: "exercise",
                order: 3,
                content: { exerciseId: "MC-001" },
              },
            ],
          },
          {
            id: "lesson-a1-2",
            moduleId: "mod-a1-1",
            title: "Cultura italiana",
            slug: "cultura-italiana",
            order: 2,
            status: "published",
            durationMinutes: 15,
            blocks: [
              {
                id: "block-a1-2-1",
                type: "text",
                order: 1,
                content: {
                  html: `<h3>Perguntando como alguém está</h3>
<p><strong>Come stai?</strong> — informal (tu)<br/>
<strong>Come sta?</strong> — formal (Lei)</p>
<p>Respostas comuns:</p>
<ul>
<li><strong>Bene, grazie!</strong> — Bem, obrigado!</li>
<li><strong>Così così.</strong> — Mais ou menos.</li>
<li><strong>Non c'è male.</strong> — Nada mal.</li>
</ul>`,
                },
              },
              {
                id: "block-a1-2-2",
                type: "exercise",
                order: 2,
                content: { exerciseId: "TF-001" },
              },
            ],
          },
        ],
      },
      {
        id: "mod-a1-2",
        courseId: "course-a1",
        title: "Gramática italiana",
        slug: "gramatica-italiana",
        description: "Conceitos gramaticais essenciais para construir frases corretamente.",
        order: 2,
        lessons: [
          {
            id: "lesson-a1-g1",
            moduleId: "mod-a1-2",
            title: "Gênero no italiano",
            slug: "genero-no-italiano",
            order: 1,
            status: "published",
            durationMinutes: 14,
            blocks: [
              {
                id: "block-a1-g1-1",
                type: "text",
                order: 1,
                content: {
                  html: `<h3>Artigos e gênero</h3>
<p>Em italiano, os substantivos têm gênero masculino ou feminino:</p>
<ul>
<li><strong>il</strong> libro (o livro) — masculino</li>
<li><strong>la</strong> casa (a casa) — feminino</li>
</ul>
<p>O artigo deve concordar com o gênero da palavra.</p>`,
                },
              },
            ],
          },
          {
            id: "lesson-a1-g2",
            moduleId: "mod-a1-2",
            title: "Plural italiano",
            slug: "plural-italiano",
            order: 2,
            status: "published",
            durationMinutes: 14,
            blocks: [
              {
                id: "block-a1-g2-1",
                type: "text",
                order: 1,
                content: {
                  html: `<h3>Formando o plural</h3>
<p>Regras básicas do plural em italiano:</p>
<ul>
<li>Masculino em -o → -i: <strong>libro → libri</strong></li>
<li>Feminino em -a → -e: <strong>casa → case</strong></li>
<li>Masculino/feminino em -e → -i: <strong>studente → studenti</strong></li>
</ul>`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "mod-a1-3",
        courseId: "course-a1",
        title: "Al ristorante",
        slug: "al-ristorante",
        description: "Situações práticas para pedir comida e pagar a conta.",
        order: 3,
        lessons: [
          {
            id: "lesson-a1-3",
            moduleId: "mod-a1-3",
            title: "Ordinare al ristorante",
            slug: "ordinare-al-ristorante",
            order: 1,
            status: "published",
            durationMinutes: 18,
            blocks: [
              {
                id: "block-a1-3-1",
                type: "video",
                order: 1,
                content: {
                  url: "https://www.youtube.com/embed/HAnw68HG24c",
                  durationMinutes: 10,
                },
              },
              {
                id: "block-a1-3-2",
                type: "text",
                order: 2,
                content: {
                  html: `<h3>Frases úteis no restaurante</h3>
<p><strong>Vorrei un tavolo per due, per favore.</strong> — Gostaria de uma mesa para dois.</p>
<p><strong>Il conto, per favore.</strong> — A conta, por favor.</p>
<p><strong>Abbiamo mangiato molto bene!</strong> — Comemos muito bem!</p>`,
                },
              },
              {
                id: "block-a1-3-3",
                type: "pdf",
                order: 3,
                content: {
                  title: "Cardápio italiano",
                  filename: "Cardapio_ristorante.pdf",
                },
              },
              {
                id: "block-a1-3-4",
                type: "exercise",
                order: 4,
                content: { exerciseId: "FB-001" },
              },
              {
                id: "block-a1-3-5",
                type: "exercise",
                order: 5,
                content: { exerciseId: "WR-001" },
              },
            ],
          },
          {
            id: "lesson-a1-4",
            moduleId: "mod-a1-3",
            title: "Al conto — pagando a conta",
            slug: "al-conto-pagando-a-conta",
            order: 2,
            status: "published",
            durationMinutes: 14,
            blocks: [
              {
                id: "block-a1-4-1",
                type: "text",
                order: 1,
                content: {
                  html: `<h3>Pagando no restaurante</h3>
<p><strong>Quanto costa?</strong> — Quanto custa?</p>
<p><strong>Posso pagare con carta?</strong> — Posso pagar com cartão?</p>
<p><strong>Tenga il resto.</strong> — Fique com o troco.</p>`,
                },
              },
            ],
          },
        ],
      },
      {
        id: "mod-a1-4",
        courseId: "course-a1",
        title: "I numeri",
        slug: "i-numeri",
        description: "Números, quantidades e uso no dia a dia.",
        order: 4,
        lessons: [
          {
            id: "lesson-a1-5",
            moduleId: "mod-a1-4",
            title: "Numeri da 1 a 100",
            slug: "numeri-da-1-a-100",
            order: 1,
            status: "published",
            durationMinutes: 16,
            blocks: [
              {
                id: "block-a1-5-1",
                type: "text",
                order: 1,
                content: {
                  html: `<h3>Números básicos</h3>
<p>uno (1), due (2), tre (3), dieci (10), venti (20), cento (100)</p>`,
                },
              },
              {
                id: "block-a1-5-2",
                type: "exercise",
                order: 2,
                content: { exerciseId: "MC-002" },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-a2",
    tenantId: "tenant-studio-italiano",
    title: "Italiano A2 — Conversação",
    slug: "italiano-a2",
    description: "Desenvolva fluência em situações cotidianas: compras, viagens e conversas informais.",
    level: "A2",
    status: "draft",
    thumbnailUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=240&fit=crop",
    instructorName: "Prof. Marco Rossi",
    modules: [
      {
        id: "mod-a2-1",
        courseId: "course-a2",
        title: "In viaggio",
        slug: "in-viaggio",
        description: "Vocabulário e frases para viagens.",
        order: 1,
        lessons: [
          {
            id: "lesson-a2-1",
            moduleId: "mod-a2-1",
            title: "All'aeroporto",
            slug: "all-aeroporto",
            order: 1,
            status: "draft",
            durationMinutes: 20,
            blocks: [
              {
                id: "block-a2-1-1",
                type: "text",
                order: 1,
                content: {
                  html: `<h3>No aeroporto</h3>
<p><strong>Dov'è il gate?</strong> — Onde fica o portão?</p>`,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

export const courses: Course[] = normalizeCourses(seedCoursesRaw);

export function getCourseById(id: string, source: Course[] = courses): Course | undefined {
  return source.find((c) => c.id === id);
}

export function getLessonById(courseId: string, lessonId: string, source: Course[] = courses) {
  const course = getCourseById(courseId, source);
  if (!course) return undefined;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, module: mod, lesson };
  }
  return undefined;
}

export function getAllLessons(course: Course) {
  return course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleSlug: m.slug, moduleId: m.id })),
  );
}

export function getNextLesson(course: Course, currentLessonId: string) {
  const all = getAllLessons(course);
  const idx = all.findIndex((l) => l.id === currentLessonId);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}

export function getPrevLesson(course: Course, currentLessonId: string) {
  const all = getAllLessons(course);
  const idx = all.findIndex((l) => l.id === currentLessonId);
  return idx > 0 ? all[idx - 1] : null;
}

export function countLessons(course: Course) {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

export function getLessonFromCourses(coursesList: Course[], courseId: string, lessonId: string) {
  return getLessonById(courseId, lessonId, coursesList);
}

/** @deprecated Use seed from courses export */
export const seedCourses = courses;
