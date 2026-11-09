import { lazyRetry } from "@/lib/lazy-retry";
import { Suspense, useEffect, useRef, useState, type PointerEvent } from "react";
import { Button } from '@/components/ui/button';
import { ScanSearch } from 'lucide-react';
import { isResearcherAccount } from "@/features/inspector/recorder";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { getWPToken } from "@/services/wp-auth";
import { inspectModeOn, setInspectMode } from '@/features/inspector/recorder';

const ReadWriteInspector = lazyRetry(() => import("./ReadWriteInspector"), "ReadWriteInspector");

/** Loads the read/write inspector only for the signed-in researcher account. */
export function InspectorGate() {
  const [researcher, setResearcher] = useState(isResearcherAccount());
  const [opened, setOpened] = useState(inspectModeOn());
  const [launcherPosition, setLauncherPosition] = useState<{ left: number; top: number } | null>(null);
  const drag = useRef<{ pointerId: number; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  // Clicks/focus inside the inspector (including this launcher) never count as "outside" for an open pop-up,
  // so opening the inspector does not close the dialog the researcher wants to inspect.
  useEffect(() => {
    const inside = (n: EventTarget | null) => n instanceof Element && !!n.closest("[data-rw-inspector]");
    const guard = (e: Event) => {
      const rel = (e as FocusEvent).relatedTarget ?? null;
      if (inside(e.target) || (e.type === "focusout" && inside(rel))) e.stopImmediatePropagation();
    };
    const evs = ["pointerdown", "mousedown", "touchstart", "focusin", "focusout"] as const;
    evs.forEach((ev) => document.addEventListener(ev, guard));
    return () => evs.forEach((ev) => document.removeEventListener(ev, guard));
  }, []);
  const handleLauncherPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    suppressClick.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  };
  const handleLauncherPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== e.pointerId) return;
    if (Math.hypot(e.clientX - active.startX, e.clientY - active.startY) > 4) active.moved = true;
    if (!active.moved) return;
    const { width, height } = e.currentTarget.getBoundingClientRect();
    setLauncherPosition({
      left: Math.max(8, Math.min(window.innerWidth - width - 8, e.clientX - active.offsetX)),
      top: Math.max(8, Math.min(window.innerHeight - height - 8, e.clientY - active.offsetY)),
    });
    e.preventDefault();
  };
  const handleLauncherPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== e.pointerId) return;
    suppressClick.current = active.moved;
    if (active.moved) window.setTimeout(() => { suppressClick.current = false; }, 0);
    drag.current = null;
  };
  useEffect(() => {
    let session = "";
    const check = () => {
      const allowed = isResearcherAccount();
      const next = allowed ? getWPToken() || "" : "";
      setResearcher(allowed);
      if (next === session) return;
      session = next;
      inspectorNotesCache.reset();
      if (!allowed) setOpened(false);
    };
    check();
    const t = setInterval(check, 2000);
    window.addEventListener("storage", check);
    return () => { clearInterval(t); window.removeEventListener("storage", check); inspectorNotesCache.reset(); };
  }, []);
  if (!researcher) return null;
  if (!opened) return <div data-rw-inspector className="fixed z-[9999] touch-none select-none" style={{ pointerEvents: "auto", ...(launcherPosition ? { left: launcherPosition.left, top: launcherPosition.top } : { right: 8, top: 64 }) }}
    onPointerDown={handleLauncherPointerDown} onPointerMove={handleLauncherPointerMove} onPointerUp={handleLauncherPointerUp} onPointerCancel={handleLauncherPointerUp}
    onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()}>
    <Button size="sm" variant="outline" className="cursor-grab bg-background active:cursor-grabbing" onClick={(e) => { if (suppressClick.current) { suppressClick.current = false; e.preventDefault(); return; } setInspectMode(true); setOpened(true); }}>
      <ScanSearch className="mr-1 h-3 w-3" />读写核对 / Inspect
    </Button>
  </div>;
  return <Suspense fallback={null}><ReadWriteInspector /></Suspense>;
}
