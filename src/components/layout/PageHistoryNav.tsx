import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

const MAX_KEY = "page-history-max-idx";

/** React Router stores the entry position in history.state.idx. */
function currentIdx(): number {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === "number" ? idx : 0;
}

/**
 * One back/forward pair for every page, pinned to the top of the content.
 * Each button only shows when there is somewhere to go.
 */
export function PageHistoryNav() {
  const { pathname, search } = useLocation();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const [state, setState] = useState({ back: false, forward: false });

  useEffect(() => {
    const idx = currentIdx();
    const stored = Number(sessionStorage.getItem(MAX_KEY) ?? "0");
    // A new page (PUSH) drops any forward entries, so the furthest point is here.
    const navType = (window as unknown as { __lastNavPop?: boolean }).__lastNavPop;
    const max = navType ? Math.max(stored, idx) : idx;
    sessionStorage.setItem(MAX_KEY, String(max));
    (window as unknown as { __lastNavPop?: boolean }).__lastNavPop = false;
    setState({ back: idx > 0, forward: idx < max });
  }, [pathname, search]);

  useEffect(() => {
    const onPop = () => {
      (window as unknown as { __lastNavPop?: boolean }).__lastNavPop = true;
    };
    window.addEventListener("popstate", onPop, true);
    return () => window.removeEventListener("popstate", onPop, true);
  }, []);

  if (!state.back && !state.forward) return null;

  const btn =
    "flex h-12 w-12 items-center justify-center rounded-full border bg-card text-foreground shadow-lg transition-transform hover:scale-105 active:scale-95";

  return (
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-3" data-testid="page-history-nav">
      {state.back ? (
        <Button type="button" variant="ghost" size="icon" className={btn} onClick={() => window.history.back()} data-testid="page-back" aria-label={isZh ? "返回" : "Back"} title={isZh ? "返回" : "Back"}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      ) : <span />}
      {state.forward ? (
        <Button type="button" variant="ghost" size="icon" className={btn} onClick={() => window.history.forward()} data-testid="page-forward" aria-label={isZh ? "前进" : "Forward"} title={isZh ? "前进" : "Forward"}>
          <ArrowRight className="h-5 w-5" />
        </Button>
      ) : <span />}
    </div>
  );
}
