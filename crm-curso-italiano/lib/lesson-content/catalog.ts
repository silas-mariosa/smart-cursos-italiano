import type { ContentBlockCatalogItem, ContentElement, ContentElementType } from "./types";

export const CONTENT_BLOCK_CATALOG: ContentBlockCatalogItem[] = [
  {
    type: "heading",
    label: "Título",
    description: "Seção ou subtítulo da aula",
    emoji: "📌",
    category: "Texto",
  },
  {
    type: "paragraph",
    label: "Parágrafo",
    description: "Texto explicativo simples",
    emoji: "📝",
    category: "Texto",
  },
  {
    type: "bullet-list",
    label: "Lista com marcadores",
    description: "Itens com bolinhas",
    emoji: "•",
    category: "Listas",
  },
  {
    type: "numbered-list",
    label: "Lista numerada",
    description: "Passos ou sequência ordenada",
    emoji: "🔢",
    category: "Listas",
  },
  {
    type: "phrase-pair",
    label: "Frase IT + tradução",
    description: "Italiano em destaque com tradução",
    emoji: "🇮🇹",
    category: "Italiano",
  },
  {
    type: "vocabulary",
    label: "Vocabulário",
    description: "Tabela de palavras e significados",
    emoji: "📚",
    category: "Italiano",
  },
  {
    type: "callout",
    label: "Destaque / Dica",
    description: "Caixa de atenção, dica ou aviso",
    emoji: "💡",
    category: "Layout",
  },
  {
    type: "divider",
    label: "Separador",
    description: "Linha para dividir seções",
    emoji: "➖",
    category: "Layout",
  },
  {
    type: "image",
    label: "Imagem",
    description: "Foto ou ilustração com legenda",
    emoji: "🖼️",
    category: "Mídia",
  },
];

export function generateElementId(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createDefaultElement(type: ContentElementType): ContentElement {
  const id = generateElementId();
  switch (type) {
    case "heading":
      return { id, type: "heading", level: 3, text: "Novo título" };
    case "paragraph":
      return { id, type: "paragraph", text: "Escreva o conteúdo aqui..." };
    case "bullet-list":
      return { id, type: "bullet-list", items: ["Primeiro item", "Segundo item"] };
    case "numbered-list":
      return { id, type: "numbered-list", items: ["Passo 1", "Passo 2"] };
    case "phrase-pair":
      return { id, type: "phrase-pair", italian: "Buongiorno!", translation: "Bom dia!" };
    case "callout":
      return { id, type: "callout", variant: "tip", title: "Dica do professor", text: "Conteúdo da dica..." };
    case "divider":
      return { id, type: "divider" };
    case "image":
      return { id, type: "image", url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800", alt: "Imagem da aula", caption: "" };
    case "vocabulary":
      return {
        id,
        type: "vocabulary",
        title: "Vocabulário",
        entries: [
          { word: "Ciao", translation: "Olá / Tchau" },
          { word: "Grazie", translation: "Obrigado" },
        ],
      };
  }
}

export function getCatalogByCategory(): Record<string, ContentBlockCatalogItem[]> {
  return CONTENT_BLOCK_CATALOG.reduce<Record<string, ContentBlockCatalogItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}
