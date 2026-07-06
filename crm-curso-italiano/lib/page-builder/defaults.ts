import type { ComponentType, PageComponent, PageColumn, PageDocument, PageRow, PageSection } from "@lms-mocks/page-builder-types";
import { createEmptyExerciseConfig } from "@lms-mocks/exercises";

export function pbId(prefix = "pb"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createRow(components: PageComponent[] = []): PageRow {
  return { id: pbId("row"), components };
}

export function createColumn(span: number, components: PageComponent[] = []): PageColumn {
  return {
    id: pbId("col"),
    span,
    rowCount: 1,
    rows: [createRow(components)],
  };
}

export function createEmptyDocument(): PageDocument {
  return {
    version: 1,
    sections: [],
    savedLayouts: [],
    reusableBlocks: [],
  };
}

export function createSection(label: string, columnCount: number): PageSection {
  const columns = Array.from({ length: columnCount }, (_, i) =>
    createColumn(
      Math.floor(12 / columnCount),
      i === 0 ? [createComponent("heading"), createComponent("paragraph")] : [],
    ),
  );
  return { id: pbId("sec"), label, columnCount, columns };
}

export function createComponent(type: ComponentType): PageComponent {
  const id = pbId("cmp");
  switch (type) {
    case "heading":
      return { id, type, props: { text: "Novo título", level: 2 } };
    case "paragraph":
      return { id, type, props: { text: "Escreva o conteúdo aqui..." } };
    case "image":
      return {
        id,
        type,
        props: {
          src: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800",
          alt: "Imagem",
          caption: "",
        },
      };
    case "video":
      return { id, type, props: { url: "https://www.youtube.com/embed/0WPFwid_kEk", provider: "youtube" } };
    case "button":
      return { id, type, props: { label: "Saiba mais", url: "#", variant: "solid" } };
    case "card":
      return { id, type, props: { title: "Título do card", description: "Descrição breve do conteúdo.", imageUrl: "" } };
    case "alert":
      return { id, type, props: { title: "Informação", text: "Mensagem importante para o aluno.", variant: "info" } };
    case "list":
      return { id, type, props: { items: ["Primeiro item", "Segundo item"], ordered: false } };
    case "table":
      return {
        id,
        type,
        props: {
          headers: ["Italiano", "Tradução"],
          rows: [[{ content: "Ciao" }, { content: "Olá" }], [{ content: "Grazie" }, { content: "Obrigado" }]],
        },
      };
    case "separator":
    case "divider":
      return { id, type, props: {} };
    case "accordion":
      return {
        id,
        type,
        props: {
          items: [
            { title: "Pergunta frequente 1", content: "Resposta detalhada aqui." },
            { title: "Pergunta frequente 2", content: "Outra resposta." },
          ],
        },
      };
    case "tabs":
      return {
        id,
        type,
        props: {
          items: [
            { label: "Aba 1", content: "Conteúdo da primeira aba." },
            { label: "Aba 2", content: "Conteúdo da segunda aba." },
          ],
        },
      };
    case "callout":
      return { id, type, props: { title: "Dica do professor", text: "Conteúdo da dica...", variant: "tip" } };
    case "quote":
      return { id, type, props: { text: "A língua é a chave que abre todas as portas.", author: "Provérbio italiano" } };
    case "cta":
      return {
        id,
        type,
        props: { title: "Pronto para praticar?", description: "Continue para os exercícios da aula.", buttonLabel: "Praticar agora", buttonUrl: "#" },
      };
    case "card-grid":
      return {
        id,
        type,
        props: {
          cards: [
            { title: "Vocabulário", description: "Palavras essenciais" },
            { title: "Gramática", description: "Regras básicas" },
            { title: "Cultura", description: "Curiosidades" },
          ],
        },
      };
    case "spacer":
      return { id, type, props: { height: 32 } };
    case "code":
      return { id, type, props: { language: "text", code: "Buongiorno!\nCome stai?" } };
    case "file-download":
      return { id, type, props: { title: "Material de apoio", filename: "aula.pdf", url: "#" } };
    case "embed":
      return { id, type, props: { url: "https://www.youtube.com/embed/0WPFwid_kEk", embedType: "youtube" } };
    case "icon-badge":
      return {
        id,
        type,
        props: {
          icon: "volume-2",
          label: "Áudio",
          subtitle: "",
          variant: "info",
          content: "",
        },
      };
    case "example-grid":
      return {
        id,
        type,
        props: {
          columns: 2,
          items: [
            { left: "I <strong>am working</strong>", right: "eu trabalho" },
            { left: "You <strong>are working</strong>", right: "tu trabalhas" },
            { left: "He <strong>is working</strong>", right: "ele trabalha" },
          ],
        },
      };
    case "dialogue-box":
      return {
        id,
        type,
        props: {
          context: "Mary e Katherine estão conversando sobre um colega.",
          lines: [
            { speaker: "Mary", text: "He was very attractive, wasn't he?" },
            { speaker: "Katherine", text: "Yes, he was. And very charming too." },
          ],
        },
      };
    case "vocabulary-box":
      return {
        id,
        type,
        props: {
          title: "Vocabulário",
          pairs: [
            { term: "inflexible", translation: "inflexível" },
            { term: "job interview", translation: "entrevista de trabalho" },
            { term: "attractive", translation: "atraente" },
          ],
          backgroundColor: "#6b21a8",
        },
      };
    case "writing-lines":
      return {
        id,
        type,
        props: {
          prompt: "1. Mary's — hair — blond — shirt — red",
          lineCount: 2,
          showNumbers: true,
        },
      };
    case "infobox":
      return {
        id,
        type,
        props: {
          title: "Infobox",
          sections: [
            {
              subtitle: "Medidas",
              rows: [
                { left: "1 inch (in.)", right: "25,4 mm" },
                { left: "1 foot (ft.)", right: "30,48 cm" },
              ],
            },
          ],
        },
      };
    case "activity":
      return {
        id,
        type,
        props: {
          title: "Exercício 1:",
          instructions: "Escolha a alternativa correta.",
          source: "manual",
          manualType: "multiple_choice",
          manualTitle: "Nova atividade",
          manualConfig: createEmptyExerciseConfig("multiple_choice"),
        },
      };
  }
}
