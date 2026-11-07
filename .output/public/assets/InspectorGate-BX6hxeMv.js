var e=`import { lazyRetry } from "@/lib/lazy-retry";
import { Suspense, useEffect, useState } from "react";
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
  if (!opened) return <div data-rw-inspector className="fixed right-2 top-16 z-[9999]" style={{ pointerEvents: "auto" }}
    onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()}>
    <Button size="sm" variant="outline" className="bg-background" onClick={() => { setInspectMode(true); setOpened(true); }}>
      <ScanSearch className="mr-1 h-3 w-3" />读写核对 / Inspect
    </Button>
  </div>;
  return <Suspense fallback={null}><ReadWriteInspector /></Suspense>;
}
`;export{e as default};