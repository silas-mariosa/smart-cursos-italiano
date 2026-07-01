import type {
  BoxStyle,
  ComponentType,
  PageComponent,
  PageDocument,
  PageSection,
  ReusableBlock,
  SavedLayout,
  SelectionTarget,
} from "@lms-mocks/page-builder-types";
import { createComponent, createSection, pbId } from "./defaults";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function updateSection(
  doc: PageDocument,
  sectionId: string,
  patch: Partial<PageSection>,
): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => (s.id === sectionId ? { ...s, ...patch, id: s.id } : s)),
  };
}

export function updateSectionStyle(doc: PageDocument, sectionId: string, style: BoxStyle): PageDocument {
  return updateSection(doc, sectionId, { style: { ...doc.sections.find((s) => s.id === sectionId)?.style, ...style } });
}

export function setSectionColumnCount(doc: PageDocument, sectionId: string, count: number): PageDocument {
  const section = doc.sections.find((s) => s.id === sectionId);
  if (!section) return doc;
  const nextCount = Math.max(1, Math.min(4, count));
  let columns = [...section.columns];
  while (columns.length < nextCount) {
    columns.push({ id: pbId("col"), span: Math.floor(12 / nextCount), components: [] });
  }
  if (columns.length > nextCount) columns = columns.slice(0, nextCount);
  columns = columns.map((c) => ({ ...c, span: Math.floor(12 / nextCount) }));
  return updateSection(doc, sectionId, { columnCount: nextCount, columns });
}

export function addSection(doc: PageDocument, label?: string, columnCount = 1): PageDocument {
  return { ...doc, sections: [...doc.sections, createSection(label ?? `Seção ${doc.sections.length + 1}`, columnCount)] };
}

export function duplicateSection(doc: PageDocument, sectionId: string): PageDocument {
  const section = doc.sections.find((s) => s.id === sectionId);
  if (!section) return doc;
  const copy = clone(section);
  copy.id = pbId("sec");
  copy.label = `${copy.label} (cópia)`;
  copy.columns = copy.columns.map((col) => ({
    ...col,
    id: pbId("col"),
    components: col.components.map((c) => ({ ...c, id: pbId("cmp") })),
  }));
  const idx = doc.sections.findIndex((s) => s.id === sectionId);
  const sections = [...doc.sections];
  sections.splice(idx + 1, 0, copy);
  return { ...doc, sections };
}

export function removeSection(doc: PageDocument, sectionId: string): PageDocument {
  const sections = doc.sections.filter((s) => s.id !== sectionId);
  return { ...doc, sections: sections.length ? sections : [createSection("Seção 1", 1)] };
}

export function reorderSections(doc: PageDocument, sourceId: string, targetId: string, after: boolean): PageDocument {
  const sections = [...doc.sections];
  const si = sections.findIndex((s) => s.id === sourceId);
  const ti = sections.findIndex((s) => s.id === targetId);
  if (si === -1 || ti === -1) return doc;
  const [moved] = sections.splice(si, 1);
  let insert = ti;
  if (si < ti) insert = ti - 1;
  if (after) insert += 1;
  sections.splice(insert, 0, moved);
  return { ...doc, sections };
}

export function addComponent(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  type: ComponentType,
  index?: number,
): PageDocument {
  const component = createComponent(type);
  return insertComponent(doc, sectionId, columnId, component, index);
}

export function insertComponent(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  component: PageComponent,
  index?: number,
): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        columns: s.columns.map((col) => {
          if (col.id !== columnId) return col;
          const components = [...col.components];
          const at = index ?? components.length;
          components.splice(at, 0, component);
          return { ...col, components };
        }),
      };
    }),
  };
}

export function updateComponent(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  componentId: string,
  patch: { props?: Record<string, unknown>; style?: BoxStyle },
): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        columns: s.columns.map((col) => {
          if (col.id !== columnId) return col;
          return {
            ...col,
            components: col.components.map((c) => {
              if (c.id !== componentId) return c;
              return {
                ...c,
                props: patch.props ? { ...c.props, ...patch.props } : c.props,
                style: patch.style ? { ...c.style, ...patch.style } : c.style,
              };
            }),
          };
        }),
      };
    }),
  };
}

export function duplicateComponent(doc: PageDocument, sectionId: string, columnId: string, componentId: string): PageDocument {
  const col = doc.sections.find((s) => s.id === sectionId)?.columns.find((c) => c.id === columnId);
  const comp = col?.components.find((c) => c.id === componentId);
  if (!comp) return doc;
  const copy = clone(comp);
  copy.id = pbId("cmp");
  const idx = col!.components.findIndex((c) => c.id === componentId);
  return insertComponent(doc, sectionId, columnId, copy, idx + 1);
}

export function removeComponent(doc: PageDocument, sectionId: string, columnId: string, componentId: string): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        columns: s.columns.map((col) => {
          if (col.id !== columnId) return col;
          return { ...col, components: col.components.filter((c) => c.id !== componentId) };
        }),
      };
    }),
  };
}

export function moveComponent(
  doc: PageDocument,
  from: { sectionId: string; columnId: string; componentId: string },
  to: { sectionId: string; columnId: string; index: number },
): PageDocument {
  let component: PageComponent | null = null;
  let without = removeComponent(doc, from.sectionId, from.columnId, from.componentId);
  const srcCol = doc.sections.find((s) => s.id === from.sectionId)?.columns.find((c) => c.id === from.columnId);
  component = srcCol?.components.find((c) => c.id === from.componentId) ?? null;
  if (!component) return doc;
  without = removeComponent(doc, from.sectionId, from.columnId, from.componentId);
  return insertComponent(without, to.sectionId, to.columnId, component, to.index);
}

export function reorderComponentInColumn(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  sourceId: string,
  targetId: string,
  after: boolean,
): PageDocument {
  const col = doc.sections.find((s) => s.id === sectionId)?.columns.find((c) => c.id === columnId);
  if (!col) return doc;
  const components = [...col.components];
  const si = components.findIndex((c) => c.id === sourceId);
  const ti = components.findIndex((c) => c.id === targetId);
  if (si === -1 || ti === -1) return doc;
  const [moved] = components.splice(si, 1);
  let insert = ti;
  if (si < ti) insert = ti - 1;
  if (after) insert += 1;
  components.splice(insert, 0, moved);
  return {
    ...doc,
    sections: doc.sections.map((s) =>
      s.id === sectionId
        ? { ...s, columns: s.columns.map((c) => (c.id === columnId ? { ...c, components } : c)) }
        : s,
    ),
  };
}

export function appendLayout(doc: PageDocument, sections: PageSection[]): PageDocument {
  const cloned = sections.map((s) => {
    const copy = clone(s);
    copy.id = pbId("sec");
    copy.columns = copy.columns.map((col) => ({
      ...col,
      id: pbId("col"),
      components: col.components.map((c) => ({ ...c, id: pbId("cmp") })),
    }));
    return copy;
  });
  return { ...doc, sections: [...doc.sections, ...cloned] };
}

export function replaceWithLayout(doc: PageDocument, sections: PageSection[]): PageDocument {
  const cloned = sections.map((s) => {
    const copy = clone(s);
    copy.id = pbId("sec");
    copy.columns = copy.columns.map((col) => ({
      ...col,
      id: pbId("col"),
      components: col.components.map((c) => ({ ...c, id: pbId("cmp") })),
    }));
    return copy;
  });
  return { ...doc, sections: cloned };
}

export function saveLayoutTemplate(doc: PageDocument, name: string, category: string, sectionIds: string[]): PageDocument {
  const sections = doc.sections.filter((s) => sectionIds.includes(s.id)).map((s) => clone(s));
  const layout: SavedLayout = {
    id: pbId("layout"),
    name,
    category,
    sections,
    createdAt: new Date().toISOString(),
  };
  return { ...doc, savedLayouts: [...doc.savedLayouts, layout] };
}

export function saveReusableBlock(
  doc: PageDocument,
  component: PageComponent,
  name: string,
  category: string,
  linked: boolean,
): PageDocument {
  const block: ReusableBlock = {
    id: pbId("reusable"),
    name,
    category,
    component: clone(component),
    linked,
    updatedAt: new Date().toISOString(),
  };
  return { ...doc, reusableBlocks: [...doc.reusableBlocks, block] };
}

export function resolveSelection(doc: PageDocument, selection: SelectionTarget) {
  if (!selection) return null;
  if (selection.kind === "section") {
    return { kind: "section" as const, section: doc.sections.find((s) => s.id === selection.sectionId) };
  }
  const section = doc.sections.find((s) => s.id === selection.sectionId);
  const column = section?.columns.find((c) => c.id === selection.columnId);
  if (selection.kind === "column") return { kind: "column" as const, section, column };
  const component = column?.components.find((c) => c.id === selection.componentId);
  return { kind: "component" as const, section, column, component };
}

export function applyLinkedReusableUpdates(doc: PageDocument): PageDocument {
  const byId = new Map(doc.reusableBlocks.filter((b) => b.linked).map((b) => [b.id, b.component]));
  if (byId.size === 0) return doc;
  return {
    ...doc,
    sections: doc.sections.map((s) => ({
      ...s,
      columns: s.columns.map((col) => ({
        ...col,
        components: col.components.map((c) => {
          if (!c.reusableId || !byId.has(c.reusableId)) return c;
          const master = byId.get(c.reusableId)!;
          return { ...master, id: c.id, reusableId: c.reusableId };
        }),
      })),
    })),
  };
}

export function syncReusableBlock(doc: PageDocument, reusableId: string, component: PageComponent): PageDocument {
  const updated = {
    ...doc,
    reusableBlocks: doc.reusableBlocks.map((b) =>
      b.id === reusableId ? { ...b, component: clone(component), updatedAt: new Date().toISOString() } : b,
    ),
  };
  return applyLinkedReusableUpdates(updated);
}
