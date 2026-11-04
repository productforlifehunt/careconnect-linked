import { lazyRetry } from "@/lib/lazy-retry";
import { Suspense, useEffect, useState } from "react";
import { isResearcherAccount } from "@/features/inspector/recorder";
import { useServerFn } from "@tanstack/react-start";
import { loadAllInspectorNotes } from "@/lib/inspector-notes.functions";
import { inspectorNotesCache } from "@/features/inspector/notes-cache";
import { getWPToken } from "@/services/wp-auth";

const ReadWriteInspector = lazyRetry(() => import("./ReadWriteInspector"), "ReadWriteInspector");

/** Loads the read/write inspector only for the signed-in researcher account. */
export function InspectorGate() {
  const [researcher, setResearcher] = useState(isResearcherAccount());
  const loadNotes = useServerFn(loadAllInspectorNotes);
  useEffect(() => {
    let session = "";
    const check = () => {
      const allowed = isResearcherAccount();
      const next = allowed ? getWPToken() || "" : "";
      setResearcher(allowed);
      if (next === session) return;
      session = next;
      inspectorNotesCache.reset();
      if (next) void inspectorNotesCache.load(next, () => loadNotes()).catch(() => {});
    };
    check();
    const t = setInterval(check, 2000);
    window.addEventListener("storage", check);
    return () => { clearInterval(t); window.removeEventListener("storage", check); inspectorNotesCache.reset(); };
  }, [loadNotes]);
  if (!researcher) return null;
  return <Suspense fallback={null}><ReadWriteInspector /></Suspense>;
}
