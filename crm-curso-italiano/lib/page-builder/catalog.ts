import type { ComponentType } from "@lms-mocks/page-builder-types";

export interface CatalogItem {
  type: ComponentType;
  label: string;
  description: string;
  icon: string;
  category: "Texto" | "Mídia" | "Layout" | "Interativo" | "Pedagógico" | "Avançado";
}

export const COMPONENT_CATALOG: CatalogItem[] = [
  { type: "heading", label: "Título", description: "H2, H3 ou H4", icon: "Type", category: "Texto" },
  { type: "paragraph", label: "Parágrafo", description: "Texto corrido com formatação", icon: "AlignLeft", category: "Texto" },
  { type: "quote", label: "Citação", description: "Frase em destaque", icon: "Quote", category: "Texto" },
  { type: "list", label: "Lista", description: "Com marcadores ou numerada", icon: "List", category: "Texto" },
  { type: "table", label: "Tabela", description: "Conjugações, vocabulário, dados", icon: "Table", category: "Pedagógico" },
  { type: "icon-badge", label: "Ícone + rótulo", description: "Áudio, dica, seção (estilo livro)", icon: "BadgeCheck", category: "Pedagógico" },
  { type: "example-grid", label: "Grade de exemplos", description: "Pares EN/PT ou forma/contração", icon: "LayoutGrid", category: "Pedagógico" },
  { type: "dialogue-box", label: "Diálogo", description: "Conversa com falantes", icon: "MessageSquare", category: "Pedagógico" },
  { type: "vocabulary-box", label: "Caixa de vocabulário", description: "Lista bilingue em destaque", icon: "BookOpen", category: "Pedagógico" },
  { type: "writing-lines", label: "Linhas para escrever", description: "Exercício com linhas tracejadas", icon: "PenLine", category: "Pedagógico" },
  { type: "infobox", label: "Infobox", description: "Referência com tabela interna", icon: "Info", category: "Pedagógico" },
  { type: "activity", label: "Atividade", description: "Exercício do banco, IA ou manual", icon: "HelpCircle", category: "Interativo" },
  { type: "callout", label: "Destaque", description: "Dica, info ou aviso (Mind the gap)", icon: "Lightbulb", category: "Pedagógico" },
  { type: "image", label: "Imagem", description: "Foto ou ilustração", icon: "Image", category: "Mídia" },
  { type: "video", label: "Vídeo", description: "YouTube ou embed", icon: "Video", category: "Mídia" },
  { type: "embed", label: "Incorporar", description: "YouTube, Vimeo, PDF, Docs", icon: "ExternalLink", category: "Mídia" },
  { type: "file-download", label: "Download", description: "Arquivo PDF ou material", icon: "Download", category: "Mídia" },
  { type: "button", label: "Botão", description: "Link ou ação", icon: "MousePointer", category: "Layout" },
  { type: "card", label: "Card", description: "Bloco com título e texto", icon: "Square", category: "Layout" },
  { type: "card-grid", label: "Grid de cards", description: "Vários cards em grade", icon: "LayoutGrid", category: "Layout" },
  { type: "cta", label: "Chamada (CTA)", description: "Convite à ação", icon: "Megaphone", category: "Layout" },
  { type: "alert", label: "Alerta", description: "Mensagem de atenção", icon: "AlertCircle", category: "Layout" },
  { type: "separator", label: "Separador", description: "Linha divisória", icon: "Minus", category: "Layout" },
  { type: "spacer", label: "Espaçador", description: "Espaço vertical", icon: "MoveVertical", category: "Layout" },
  { type: "accordion", label: "Acordeão (FAQ)", description: "Perguntas expansíveis", icon: "ChevronsUpDown", category: "Interativo" },
  { type: "tabs", label: "Abas", description: "Conteúdo em tabs", icon: "PanelTop", category: "Interativo" },
  { type: "code", label: "Código", description: "Bloco de texto mono", icon: "Code", category: "Avançado" },
  { type: "divider", label: "Divisor", description: "Linha horizontal", icon: "SeparatorHorizontal", category: "Avançado" },
];

export function getCatalogByCategory(): Record<string, CatalogItem[]> {
  return COMPONENT_CATALOG.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

export function getCatalogLabel(type: ComponentType): string {
  return COMPONENT_CATALOG.find((c) => c.type === type)?.label ?? type;
}
