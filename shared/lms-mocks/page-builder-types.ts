export type Breakpoint = "desktop" | "tablet" | "mobile";

export type MaxWidthPreset = "full" | "narrow" | "wide" | "prose";

export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface Typography {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right" | "justify";
}

export interface BoxStyle {
  padding?: Spacing;
  margin?: Spacing;
  gap?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  backgroundOverlay?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  boxShadow?: string;
  maxWidth?: MaxWidthPreset | number;
  align?: "left" | "center" | "right";
  typography?: Typography;
}

export interface ResponsiveStyle {
  tablet?: Partial<BoxStyle>;
  mobile?: Partial<BoxStyle>;
}

export type ComponentType =
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "button"
  | "card"
  | "alert"
  | "list"
  | "table"
  | "separator"
  | "accordion"
  | "tabs"
  | "callout"
  | "quote"
  | "cta"
  | "card-grid"
  | "spacer"
  | "divider"
  | "code"
  | "file-download"
  | "embed";

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  style?: BoxStyle;
  responsive?: ResponsiveStyle;
  /** ID de bloco reutilizável vinculado (atualização centralizada) */
  reusableId?: string;
}

export interface PageRow {
  id: string;
  style?: BoxStyle;
  responsive?: ResponsiveStyle;
  components: PageComponent[];
}

export interface PageColumn {
  id: string;
  span: number;
  rowCount: number;
  rows: PageRow[];
  style?: BoxStyle;
  responsive?: ResponsiveStyle;
  /** Legado — migrado automaticamente para `rows` */
  components?: PageComponent[];
}

export interface PageSection {
  id: string;
  label: string;
  columnCount: number;
  columns: PageColumn[];
  style?: BoxStyle;
  responsive?: ResponsiveStyle;
}

export interface SavedLayout {
  id: string;
  name: string;
  category: string;
  description?: string;
  sections: PageSection[];
  createdAt: string;
}

export interface ReusableBlock {
  id: string;
  name: string;
  category: string;
  component: PageComponent;
  linked: boolean;
  updatedAt: string;
}

export interface PageDocument {
  version: 1;
  sections: PageSection[];
  savedLayouts: SavedLayout[];
  reusableBlocks: ReusableBlock[];
}

export type SelectionTarget =
  | { kind: "section"; sectionId: string }
  | { kind: "column"; sectionId: string; columnId: string }
  | { kind: "row"; sectionId: string; columnId: string; rowId: string }
  | { kind: "component"; sectionId: string; columnId: string; rowId: string; componentId: string }
  | null;
