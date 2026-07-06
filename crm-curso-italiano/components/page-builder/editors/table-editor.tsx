"use client";

import { Plus, Trash2 } from "lucide-react";
import type { TableCellData } from "@lms-mocks/page-builder-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableEditorProps {
  headers: string[];
  rows: TableCellData[][];
  onChange: (headers: string[], rows: TableCellData[][]) => void;
}

function normalizeRows(rows: TableCellData[][], colCount: number): TableCellData[][] {
  return rows.map((row) => {
    const next = [...row];
    while (next.length < colCount) next.push({ content: "" });
    return next.slice(0, colCount);
  });
}

export function TableEditor({ headers, rows, onChange }: TableEditorProps) {
  const colCount = headers.length;

  function setHeaders(next: string[]) {
    onChange(next, normalizeRows(rows, next.length));
  }

  function setRows(next: TableCellData[][]) {
    onChange(headers, normalizeRows(next, colCount));
  }

  function updateHeader(i: number, value: string) {
    const next = [...headers];
    next[i] = value;
    setHeaders(next);
  }

  function updateCell(ri: number, ci: number, patch: Partial<TableCellData>) {
    const next = rows.map((row, r) =>
      r === ri ? row.map((cell, c) => (c === ci ? { ...cell, ...patch } : cell)) : row,
    );
    setRows(next);
  }

  function addColumn() {
    setHeaders([...headers, `Coluna ${colCount + 1}`]);
  }

  function removeColumn(i: number) {
    if (colCount <= 1) return;
    setHeaders(headers.filter((_, idx) => idx !== i));
    setRows(rows.map((row) => row.filter((_, idx) => idx !== i)));
  }

  function addRow() {
    setRows([...rows, headers.map(() => ({ content: "" }))]);
  }

  function removeRow(i: number) {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Colunas ({colCount})</Label>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addColumn}>
          <Plus className="size-3 mr-1" /> Coluna
        </Button>
      </div>
      <div className="space-y-1">
        {headers.map((h, i) => (
          <div key={i} className="flex gap-1">
            <Input className="h-8 text-xs flex-1" value={h} onChange={(e) => updateHeader(i, e.target.value)} placeholder={`Cabeçalho ${i + 1}`} />
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" disabled={colCount <= 1} onClick={() => removeColumn(i)}>
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <Label className="text-xs">Linhas ({rows.length})</Label>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addRow}>
          <Plus className="size-3 mr-1" /> Linha
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {rows.map((row, ri) => (
          <div key={ri} className="border rounded-lg p-2 space-y-1 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground">Linha {ri + 1}</span>
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={rows.length <= 1} onClick={() => removeRow(ri)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
            {row.map((cell, ci) => (
              <div key={ci} className="space-y-1">
                <Input
                  className="h-8 text-xs"
                  value={cell.content}
                  onChange={(e) => updateCell(ri, ci, { content: e.target.value })}
                  placeholder={headers[ci] ?? `Célula ${ci + 1}`}
                />
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min={1}
                    className="h-7 text-[10px] w-16"
                    placeholder="rowspan"
                    title="Mesclar linhas (rowspan)"
                    value={cell.rowspan ?? ""}
                    onChange={(e) => updateCell(ri, ci, { rowspan: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <Input
                    type="number"
                    min={1}
                    className="h-7 text-[10px] w-16"
                    placeholder="colspan"
                    title="Mesclar colunas (colspan)"
                    value={cell.colspan ?? ""}
                    onChange={(e) => updateCell(ri, ci, { colspan: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
