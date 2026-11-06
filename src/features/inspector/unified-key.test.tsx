import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { stableAnchor, stableElementKey } from "./inspect-dom";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function StatCard({ label, tagged }: { label: string; tagged: boolean }) {
  const src = (line: number) => (tagged ? { "data-tsd-source": `/src/components/StatCard.tsx:${line}:3` } : {});
  return <button {...src(12)}><span {...src(13)}>{label}</span><p {...src(14)}>0</p></button>;
}
function GroupHome({ tagged, rows }: { tagged: boolean; rows: number[] }) {
  return (
    <div>
      <h1>Group</h1>
      <section>{["Pending Tasks", "Members", "Cared Ones"].map((l) => <StatCard key={l} label={l} tagged={tagged} />)}</section>
      <ul>{rows.map((id) => <li key={id}><a>post {id}</a></li>)}</ul>
    </div>
  );
}

async function render(tagged: boolean, rows = [4877, 4878]) {
  const host = document.createElement("div"); document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(<GroupHome tagged={tagged} rows={rows} />));
  const key = (el: Element) => stableElementKey("/care-circle/28", stableAnchor(el));
  return { host, key, done: () => { act(() => root.unmount()); host.remove(); } };
}

describe("one element identity for editor preview and published site", () => {
  it("same key with or without source-line markers, and no file or line in it", async () => {
    const dev = await render(true); const pub = await render(false);
    const devKeys = [...dev.host.querySelectorAll("p")].map(dev.key);
    const pubKeys = [...pub.host.querySelectorAll("p")].map(pub.key);
    expect(devKeys).toEqual(pubKeys);
    for (const k of devKeys) expect(k).not.toMatch(/\.tsx|:\d+/);
    expect(devKeys[0]).toBe("el|/care-circle/:id|StatCard<GroupHome|@button[Pending Tasks]>p0");
    dev.done(); pub.done();
  });
  it("the three stat cards keep three different keys", async () => {
    const r = await render(false);
    expect(new Set([...r.host.querySelectorAll("p")].map(r.key)).size).toBe(3);
    r.done();
  });
  it("rows of one data list share one key, across group ids and different rows", async () => {
    const a = await render(false, [4877, 4878]); const b = await render(false, [9001]);
    const keys = [...a.host.querySelectorAll("a"), ...b.host.querySelectorAll("a")].map(a.key);
    expect(new Set(keys).size).toBe(1);
    a.done(); b.done();
  });
  it("two headings-level siblings of the same tag stay apart", async () => {
    const r = await render(false);
    expect(r.key(r.host.querySelector("h1")!)).not.toBe(r.key(r.host.querySelector("section")!));
    r.done();
  });
});
