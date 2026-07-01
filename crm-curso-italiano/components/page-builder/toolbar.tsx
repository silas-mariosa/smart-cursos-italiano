"use client";

import Link from "next/link";
import { Eye, Monitor, Redo2, Smartphone, Tablet, Undo2 } from "lucide-react";
import type { Breakpoint } from "@lms-mocks/page-builder-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageBuilderToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  breakpoint: Breakpoint;
  saved: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBreakpoint: (bp: Breakpoint) => void;
  previewHref?: string;
  onPreview?: () => void;
}

export function PageBuilderToolbar({
  canUndo,
  canRedo,
  breakpoint,
  saved,
  onUndo,
  onRedo,
  onBreakpoint,
  previewHref,
  onPreview,
}: PageBuilderToolbarProps) {
  const devices: { id: Breakpoint; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b bg-muted/30">
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="sm" disabled={!canUndo} onClick={onUndo} title="Desfazer">
          <Undo2 className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={!canRedo} onClick={onRedo} title="Refazer">
          <Redo2 className="size-4" />
        </Button>
        <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">Page Builder · WYSIWYG</span>
      </div>

      <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-background">
        {devices.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => onBreakpoint(id)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              breakpoint === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {saved && <Badge variant="success">Salvo automaticamente</Badge>}
        {previewHref ? (
          <Link href={previewHref}>
            <Button variant="outline" size="sm">
              <Eye className="size-3.5 mr-1" /> Pré-visualizar
            </Button>
          </Link>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={onPreview}>
            <Eye className="size-3.5 mr-1" /> Pré-visualizar
          </Button>
        )}
      </div>
    </div>
  );
}
