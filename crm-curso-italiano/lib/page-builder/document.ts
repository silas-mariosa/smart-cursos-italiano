import type {
  BoxStyle,
  ComponentType,
  PageColumn,
  PageComponent,
  PageDocument,
  PageRow,
  PageSection,
  ReusableBlock,
  SavedLayout,
  SelectionTarget,
} from "@lms-mocks/page-builder-types";
import { createComponent, createRow, createSection, pbId } from "./defaults";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function getColumnRows(col: PageColumn): PageRow[] {
  if (col.rows?.length) return col.rows;
  return [createRow(col.components ?? [])];
}

export function normalizeColumn(col: PageColumn): PageColumn {
  const rows = getColumnRows(col).map((row) => ({
    ...row,
    id: row.id || pbId("row"),
    components: row.components ?? [],
  }));
  return {
    ...col,
    rowCount: col.rowCount ?? rows.length,
    rows,
  };
}

export function normalizeDocument(doc: PageDocument): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map((section) => ({
      ...section,
      columns: section.columns.map(normalizeColumn),
    })),
  };
}

function mapColumn(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  updater: (col: PageColumn) => PageColumn,
): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        columns: section.columns.map((col) => (col.id === columnId ? updater(normalizeColumn(col)) : col)),
      };
    }),
  };
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

export function updateColumn(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  patch: Partial<Pick<PageColumn, "style" | "rowCount" | "rows">>,
): PageDocument {
  return mapColumn(doc, sectionId, columnId, (col) => ({ ...col, ...patch }));
}

export function setSectionColumnCount(doc: PageDocument, sectionId: string, count: number): PageDocument {
  const section = doc.sections.find((s) => s.id === sectionId);
  if (!section) return doc;
  const nextCount = Math.max(1, Math.min(4, count));
  let columns = section.columns.map(normalizeColumn);
  while (columns.length < nextCount) {
    columns.push({
      id: pbId("col"),
      span: Math.floor(12 / nextCount),
      rowCount: 1,
      rows: [createRow()],
    });
  }
  if (columns.length > nextCount) columns = columns.slice(0, nextCount);
  columns = columns.map((c) => ({ ...c, span: Math.floor(12 / nextCount) }));
  return updateSection(doc, sectionId, { columnCount: nextCount, columns });
}

export function setColumnRowCount(doc: PageDocument, sectionId: string, columnId: string, count: number): PageDocument {
  return mapColumn(doc, sectionId, columnId, (col) => {
    const nextCount = Math.max(1, Math.min(4, count));
    let rows = [...col.rows];
    while (rows.length < nextCount) {
      rows.push(createRow());
    }
    if (rows.length > nextCount) {
      const kept = rows.slice(0, nextCount);
      const overflow = rows.slice(nextCount).flatMap((row) => row.components);
      const last = kept[nextCount - 1];
      kept[nextCount - 1] = { ...last, components: [...last.components, ...overflow] };
      rows = kept;
    }
    return { ...col, rowCount: nextCount, rows };
  });
}

export function addSection(doc: PageDocument, label?: string, columnCount = 1): PageDocument {
  return { ...doc, sections: [...doc.sections, createSection(label ?? `Seção ${doc.sections.length + 1}`, columnCount)] };
}

function cloneColumn(col: PageColumn): PageColumn {
  const normalized = normalizeColumn(col);
  return {
    ...normalized,
    id: pbId("col"),
    rows: normalized.rows.map((row) => ({
      ...row,
      id: pbId("row"),
      components: row.components.map((c) => ({ ...c, id: pbId("cmp") })),
    })),
  };
}

export function duplicateSection(doc: PageDocument, sectionId: string): PageDocument {
  const section = doc.sections.find((s) => s.id === sectionId);
  if (!section) return doc;
  const copy = clone(section);
  copy.id = pbId("sec");
  copy.label = `${copy.label} (cópia)`;
  copy.columns = copy.columns.map(cloneColumn);
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
  rowId?: string,
  index?: number,
): PageDocument {
  const component = createComponent(type);
  return insertComponent(doc, sectionId, columnId, component, rowId, index);
}

export function insertComponent(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  component: PageComponent,
  rowId?: string,
  index?: number,
): PageDocument {
  return mapColumn(doc, sectionId, columnId, (col) => {
    const targetRowId = rowId ?? col.rows[0]?.id;
    return {
      ...col,
      rows: col.rows.map((row) => {
        if (row.id !== targetRowId) return row;
        const components = [...row.components];
        const at = index ?? components.length;
        components.splice(at, 0, component);
        return { ...row, components };
      }),
    };
  });
}

export function updateComponent(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  rowId: string,
  componentId: string,
  patch: { props?: Record<string, unknown>; style?: BoxStyle },
): PageDocument {
  return mapColumn(doc, sectionId, columnId, (col) => ({
    ...col,
    rows: col.rows.map((row) => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        components: row.components.map((c) => {
          if (c.id !== componentId) return c;
          return {
            ...c,
            props: patch.props ? { ...c.props, ...patch.props } : c.props,
            style: patch.style ? { ...c.style, ...patch.style } : c.style,
          };
        }),
      };
    }),
  }));
}

export function duplicateComponent(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  rowId: string,
  componentId: string,
): PageDocument {
  const col = doc.sections.find((s) => s.id === sectionId)?.columns.find((c) => c.id === columnId);
  const row = col ? getColumnRows(col).find((r) => r.id === rowId) : undefined;
  const comp = row?.components.find((c) => c.id === componentId);
  if (!comp || !row) return doc;
  const copy = clone(comp);
  copy.id = pbId("cmp");
  const idx = row.components.findIndex((c) => c.id === componentId);
  return insertComponent(doc, sectionId, columnId, copy, rowId, idx + 1);
}

export function removeComponent(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  rowId: string,
  componentId: string,
): PageDocument {
  return mapColumn(doc, sectionId, columnId, (col) => ({
    ...col,
    rows: col.rows.map((row) =>
      row.id === rowId ? { ...row, components: row.components.filter((c) => c.id !== componentId) } : row,
    ),
  }));
}

export function moveComponent(
  doc: PageDocument,
  from: { sectionId: string; columnId: string; rowId: string; componentId: string },
  to: { sectionId: string; columnId: string; rowId: string; index: number },
): PageDocument {
  const srcCol = doc.sections.find((s) => s.id === from.sectionId)?.columns.find((c) => c.id === from.columnId);
  const srcRow = srcCol ? getColumnRows(srcCol).find((r) => r.id === from.rowId) : undefined;
  const component = srcRow?.components.find((c) => c.id === from.componentId) ?? null;
  if (!component) return doc;
  const without = removeComponent(doc, from.sectionId, from.columnId, from.rowId, from.componentId);
  return insertComponent(without, to.sectionId, to.columnId, component, to.rowId, to.index);
}

export function reorderComponentInRow(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  rowId: string,
  sourceId: string,
  targetId: string,
  after: boolean,
): PageDocument {
  return mapColumn(doc, sectionId, columnId, (col) => ({
    ...col,
    rows: col.rows.map((row) => {
      if (row.id !== rowId) return row;
      const components = [...row.components];
      const si = components.findIndex((c) => c.id === sourceId);
      const ti = components.findIndex((c) => c.id === targetId);
      if (si === -1 || ti === -1) return row;
      const [moved] = components.splice(si, 1);
      let insert = ti;
      if (si < ti) insert = ti - 1;
      if (after) insert += 1;
      components.splice(insert, 0, moved);
      return { ...row, components };
    }),
  }));
}

function cloneSectionColumns(sections: PageSection[]): PageSection[] {
  return sections.map((s) => {
    const copy = clone(s);
    copy.id = pbId("sec");
    copy.columns = copy.columns.map(cloneColumn);
    return copy;
  });
}

export function appendLayout(doc: PageDocument, sections: PageSection[]): PageDocument {
  return { ...doc, sections: [...doc.sections, ...cloneSectionColumns(sections)] };
}

export function replaceWithLayout(doc: PageDocument, sections: PageSection[]): PageDocument {
  return { ...doc, sections: cloneSectionColumns(sections) };
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
  const normalizedColumn = column ? normalizeColumn(column) : undefined;
  if (selection.kind === "column") {
    return { kind: "column" as const, section, column: normalizedColumn };
  }
  const row = normalizedColumn?.rows.find((r) => r.id === selection.rowId);
  if (selection.kind === "row") return { kind: "row" as const, section, column: normalizedColumn, row };
  const component = row?.components.find((c) => c.id === selection.componentId);
  return { kind: "component" as const, section, column: normalizedColumn, row, component };
}

export function applyLinkedReusableUpdates(doc: PageDocument): PageDocument {
  const byId = new Map(doc.reusableBlocks.filter((b) => b.linked).map((b) => [b.id, b.component]));
  if (byId.size === 0) return doc;
  return {
    ...doc,
    sections: doc.sections.map((s) => ({
      ...s,
      columns: s.columns.map((col) => {
        const normalized = normalizeColumn(col);
        return {
          ...normalized,
          rows: normalized.rows.map((row) => ({
            ...row,
            components: row.components.map((c) => {
              if (!c.reusableId || !byId.has(c.reusableId)) return c;
              const master = byId.get(c.reusableId)!;
              return { ...master, id: c.id, reusableId: c.reusableId };
            }),
          })),
        };
      }),
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

/** @deprecated use reorderComponentInRow */
export function reorderComponentInColumn(
  doc: PageDocument,
  sectionId: string,
  columnId: string,
  sourceId: string,
  targetId: string,
  after: boolean,
  rowId?: string,
): PageDocument {
  const col = doc.sections.find((s) => s.id === sectionId)?.columns.find((c) => c.id === columnId);
  const resolvedRowId = rowId ?? (col ? getColumnRows(col)[0]?.id : undefined);
  if (!resolvedRowId) return doc;
  return reorderComponentInRow(doc, sectionId, columnId, resolvedRowId, sourceId, targetId, after);
}
