"use client";

import { useCallback, useRef, useState } from "react";
import type { PageDocument } from "@lms-mocks/page-builder-types";

const MAX_HISTORY = 50;

export function usePageHistory(initial: PageDocument) {
  const [document, setDocumentState] = useState(initial);
  const past = useRef<PageDocument[]>([]);
  const future = useRef<PageDocument[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  const setDocument = useCallback(
    (next: PageDocument | ((prev: PageDocument) => PageDocument), skipHistory = false) => {
      setDocumentState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        if (!skipHistory && resolved !== prev) {
          past.current = [...past.current.slice(-MAX_HISTORY + 1), prev];
          future.current = [];
        }
        syncFlags();
        return resolved;
      });
    },
    [syncFlags],
  );

  const reset = useCallback(
    (doc: PageDocument) => {
      past.current = [];
      future.current = [];
      setDocumentState(doc);
      syncFlags();
    },
    [syncFlags],
  );

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    setDocumentState((current) => {
      const previous = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [current, ...future.current];
      syncFlags();
      return previous;
    });
  }, [syncFlags]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    setDocumentState((current) => {
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, current];
      syncFlags();
      return next;
    });
  }, [syncFlags]);

  return { document, setDocument, reset, undo, redo, canUndo, canRedo };
}
