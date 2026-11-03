import { lazyRetry } from "@/lib/lazy-retry";
import { lazy, Suspense, useEffect, useState } from "react";
import { isResearcherAccount } from "@/features/inspector/recorder";

const ReadWriteInspector = lazyRetry(() => import("./ReadWriteInspector"), "ReadWriteInspector");

/** Loads the read/write inspector only for the signed-in researcher account. */
export function InspectorGate() {
  const [researcher, setResearcher] = useState(isResearcherAccount());
  useEffect(() => {
    const check = () => setResearcher(isResearcherAccount());
    const t = setInterval(check, 2000);
    window.addEventListener("storage", check);
    return () => { clearInterval(t); window.removeEventListener("storage", check); };
  }, []);
  if (!researcher) return null;
  return <Suspense fallback={null}><ReadWriteInspector /></Suspense>;
}
