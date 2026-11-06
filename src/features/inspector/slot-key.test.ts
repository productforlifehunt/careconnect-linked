import { describe, expect, it } from "vitest";
import { staticSlotKey } from "./inspect-dom";

describe("staticSlotKey", () => {
  it("keeps fixed card labels so each stat card gets its own note", () => {
    expect(staticSlotKey("Pending Tasks")).toBe("Pending Tasks");
    expect(staticSlotKey("收件箱未读")).toBe("收件箱未读");
  });
  it("ignores data row ids so rows of one list share one note", () => {
    expect(staticSlotKey(4877)).toBeUndefined();
    expect(staticSlotKey("4877")).toBeUndefined();
    expect(staticSlotKey("post-4877")).toBeUndefined();
    expect(staticSlotKey("3f2a9c1e-77aa-4b0e-9a6e-1b2c3d4e5f60")).toBeUndefined();
  });
});

describe("stat cards without source tags (preview build)", () => {
  it("gives each of the three cards its own slot", async () => {
    const { inspectElement } = await import("./inspect-dom");
    const grid = document.createElement("div");
    const gridFiber = { key: null, return: null };
    (grid as any).__reactFiber$t = gridFiber;
    const vals: HTMLElement[] = [];
    for (const label of ["Pending Tasks", "Members", "Cared Ones"]) {
      const btn = document.createElement("button");
      const btnFiber = { key: label, return: gridFiber, type: "button" };
      (btn as any).__reactFiber$t = btnFiber;
      const p = document.createElement("p"); p.textContent = "0";
      (p as any).__reactFiber$t = { key: null, return: btnFiber, type: "p" };
      btn.appendChild(p); grid.appendChild(btn); vals.push(p);
    }
    document.body.appendChild(grid);
    expect(vals.map((p) => inspectElement(p, []).itemSlot)).toEqual(["Pending Tasks", "Members", "Cared Ones"]);
  });
});

describe("one component used from several places", () => {
  it("adds the use site only when the same line is used from more than one place", async () => {
    const { inspectElement } = await import("./inspect-dom");
    document.body.innerHTML = `
      <div data-tsd-source="/src/pages/A.tsx:10"><p data-tsd-source="/src/components/Stat.tsx:5">1</p></div>
      <div data-tsd-source="/src/pages/A.tsx:20"><p data-tsd-source="/src/components/Stat.tsx:5">2</p></div>
      <div data-tsd-source="/src/pages/A.tsx:30"><p data-tsd-source="/src/components/Once.tsx:5">3</p></div>`;
    const ps = [...document.querySelectorAll("p")];
    const a = inspectElement(ps[0]!, []).callSite, b = inspectElement(ps[1]!, []).callSite;
    expect(a).toBeTruthy(); expect(b).toBeTruthy(); expect(a).not.toBe(b);
    expect(inspectElement(ps[2]!, []).callSite).toBeUndefined();
  });
});
