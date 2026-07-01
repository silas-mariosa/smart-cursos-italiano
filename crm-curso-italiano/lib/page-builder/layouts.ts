import type { PageSection, SavedLayout } from "@lms-mocks/page-builder-types";
import { createComponent, createSection, pbId } from "./defaults";

function cloneSection(section: PageSection): PageSection {
  return JSON.parse(JSON.stringify(section)) as PageSection;
}

export const LAYOUT_TEMPLATES: SavedLayout[] = [
  {
    id: "layout-hero",
    name: "Hero + Conteúdo",
    category: "Introdução",
    description: "Título grande, parágrafo e CTA centralizados",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Hero", 1),
        style: {
          padding: { top: 48, bottom: 48, left: 24, right: 24 },
          backgroundGradient: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
          align: "center",
          maxWidth: "wide",
          typography: { textAlign: "center" },
        },
        columns: [
          {
            id: pbId("col"),
            span: 12,
            components: [
              { ...createComponent("heading"), props: { text: "Bem-vindo à aula", level: 2 }, style: { typography: { fontSize: 32, fontWeight: 700 } } },
              { ...createComponent("paragraph"), props: { text: "Nesta aula você aprenderá conceitos essenciais de forma prática e objetiva." } },
              { ...createComponent("button"), props: { label: "Começar", url: "#", variant: "solid" } },
            ],
          },
        ],
      },
      {
        ...createSection("Conteúdo", 1),
        columns: [
          {
            id: pbId("col"),
            span: 12,
            components: [createComponent("heading"), createComponent("paragraph"), createComponent("callout")],
          },
        ],
      },
    ],
  },
  {
    id: "layout-two-col",
    name: "Duas colunas",
    category: "Conteúdo",
    description: "Texto à esquerda, mídia à direita",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Duas colunas", 2),
        style: { gap: 24, padding: { top: 24, bottom: 24 } },
        columns: [
          {
            id: pbId("col"),
            span: 6,
            components: [createComponent("heading"), createComponent("paragraph"), createComponent("list")],
          },
          {
            id: pbId("col"),
            span: 6,
            components: [createComponent("image"), createComponent("callout")],
          },
        ],
      },
    ],
  },
  {
    id: "layout-vocab",
    name: "Vocabulário italiano",
    category: "Italiano",
    description: "Tabela + frases + FAQ",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Vocabulário", 1),
        columns: [
          {
            id: pbId("col"),
            span: 12,
            components: [
              { ...createComponent("heading"), props: { text: "Vocabulário da aula", level: 2 } },
              createComponent("table"),
              createComponent("separator"),
              { ...createComponent("heading"), props: { text: "Frases úteis", level: 3 } },
              createComponent("list"),
              createComponent("accordion"),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "layout-video-lesson",
    name: "Aula com vídeo",
    category: "Mídia",
    description: "Vídeo em destaque + material complementar",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Vídeo", 1),
        style: { maxWidth: "wide", align: "center" },
        columns: [
          {
            id: pbId("col"),
            span: 12,
            components: [
              { ...createComponent("heading"), props: { text: "Assista à aula", level: 2 } },
              createComponent("video"),
              createComponent("paragraph"),
            ],
          },
        ],
      },
      {
        ...createSection("Material", 2),
        style: { gap: 16 },
        columns: [
          { id: pbId("col"), span: 6, components: [createComponent("file-download")] },
          { id: pbId("col"), span: 6, components: [createComponent("card")] },
        ],
      },
    ],
  },
  {
    id: "layout-cards-cta",
    name: "Cards + CTA",
    category: "Engajamento",
    description: "Grid de cards e chamada final",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Tópicos", 1),
        columns: [{ id: pbId("col"), span: 12, components: [createComponent("heading"), createComponent("card-grid")] }],
      },
      {
        ...createSection("Próximo passo", 1),
        columns: [{ id: pbId("col"), span: 12, components: [createComponent("cta")] }],
      },
    ],
  },
];

export function getLayoutsByCategory(): Record<string, SavedLayout[]> {
  return LAYOUT_TEMPLATES.reduce<Record<string, SavedLayout[]>>((acc, layout) => {
    if (!acc[layout.category]) acc[layout.category] = [];
    acc[layout.category].push(layout);
    return acc;
  }, {});
}

export function cloneLayoutSections(layout: SavedLayout): PageSection[] {
  return layout.sections.map((s) => {
    const cloned = cloneSection(s);
    cloned.id = pbId("sec");
    cloned.columns = cloned.columns.map((col) => ({
      ...col,
      id: pbId("col"),
      components: col.components.map((c) => ({ ...c, id: pbId("cmp") })),
    }));
    return cloned;
  });
}
