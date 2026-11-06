import { createFileRoute } from "@tanstack/react-router";

function SyncTestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 data-testid="sync-test-ok" className="text-4xl font-bold">
        Draftbit ↔ Lovable 同步测试 OK
      </h1>
    </main>
  );
}

export const Route = createFileRoute("/sync-test")({
  head: () => ({ meta: [{ title: "Sync Test" }] }),
  component: SyncTestPage,
});
