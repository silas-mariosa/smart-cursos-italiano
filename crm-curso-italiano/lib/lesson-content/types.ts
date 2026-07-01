export type ContentElementType =
  | "heading"
  | "paragraph"
  | "bullet-list"
  | "numbered-list"
  | "phrase-pair"
  | "callout"
  | "divider"
  | "image"
  | "vocabulary";

export type CalloutVariant = "tip" | "info" | "warning";

export interface VocabularyEntry {
  word: string;
  translation: string;
  note?: string;
}

export type ContentElement =
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "bullet-list"; items: string[] }
  | { id: string; type: "numbered-list"; items: string[] }
  | { id: string; type: "phrase-pair"; italian: string; translation: string }
  | { id: string; type: "callout"; variant: CalloutVariant; title: string; text: string }
  | { id: string; type: "divider" }
  | { id: string; type: "image"; url: string; alt: string; caption?: string }
  | { id: string; type: "vocabulary"; title: string; entries: VocabularyEntry[] };

export interface ContentBlockCatalogItem {
  type: ContentElementType;
  label: string;
  description: string;
  emoji: string;
  category: "Texto" | "Listas" | "Italiano" | "Mídia" | "Layout";
}
