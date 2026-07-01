import type { ComponentType, PageComponent, PageColumn, PageDocument, PageRow, PageSection } from "@lms-mocks/page-builder-types";

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
    sections: [createSection("Seção 1", 1)],
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
        props: { headers: ["Italiano", "Tradução"], rows: [["Ciao", "Olá"], ["Grazie", "Obrigado"]] },
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
  }
}
