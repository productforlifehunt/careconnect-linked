/**
 * Workspace-wide undo stack. Tracks destructive/reversible operations
 * across pages, sidebar, and databases. Cmd/Ctrl+Shift+Z pops the latest.
 *
 * Not persisted — session-scoped, capped at 50 entries.
 */
import { toast } from "@/hooks/use-toast";

export interface UndoOp {
  label: string;
  undo: () => Promise<void> | void;
  ts: number;
}

const STACK: UndoOp[] = [];
const MAX = 50;
const listeners = new Set<() => void>();

export function pushUndo(label: string, undo: () => Promise<void> | void) {
  STACK.push({ label, undo, ts: Date.now() });
  while (STACK.length > MAX) STACK.shift();
  listeners.forEach((fn) => { try { fn(); } catch {} });
}

export function subscribeUndo(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function undoStackSize() { return STACK.length; }

export async function popUndo(): Promise<boolean> {
  const op = STACK.pop();
  if (!op) {
    toast({ title: "Nothing to undo", description: "The workspace undo stack is empty." });
    return false;
  }
  try {
    await op.undo();
    toast({ title: "Undone", description: op.label });
    listeners.forEach((fn) => { try { fn(); } catch {} });
    return true;
  } catch (e: any) {
    toast({ title: "Undo failed", description: e?.message || "Could not reverse this action.", variant: "destructive" as any });
    return false;
  }
}
