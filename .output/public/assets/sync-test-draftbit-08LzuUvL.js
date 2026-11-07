var e=`import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

function DraftbitSyncTestPage() {
  useEffect(() => {
    const titleTimer = window.setTimeout(() => {
      document.title = "Care Connect — Draftbit Sync Test";
    }, 0);
    return () => window.clearTimeout(titleTimer);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 data-testid="careconnect-draftbit-sync-ok" className="text-4xl font-bold">
        Care Connect：Draftbit → GitHub → Lovable 同步测试成功
      </h1>
      <p className="text-muted-foreground">本次读取基线：cc40d474</p>
    </main>
  );
}

export const Route = createFileRoute("/sync-test-draftbit")({
  head: () => ({ meta: [{ title: "Care Connect — Draftbit Sync Test" }] }),
  component: DraftbitSyncTestPage,
});
`;export{e as default};