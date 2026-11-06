import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { stableAnchor, stableElementKey } from "./inspect-dom";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("visible inspector scopes", () => {
  it("keeps a portal dialog key after unrelated owner markup and content change", async () => {
    const host = document.createElement("div"); document.body.append(host);
    const portal = document.createElement("div"); document.body.append(portal);
    const root = createRoot(host);
    const render = async (changed: boolean) => {
      await act(async () => root.render(<div>{changed && <div>Unrelated</div>}{createPortal(<div data-inspector-scope="ai-chat-dialog"><p>{changed ? "新消息" : "Welcome"}</p></div>, portal)}</div>));
      const dialog = portal.querySelector("[data-inspector-scope]");
      if (!dialog) throw new Error("dialog missing");
      return stableElementKey("/dashboard", stableAnchor(dialog));
    };
    const before = await render(false);
    expect(before).toBe("el|/dashboard|scope:ai-chat-dialog|@div");
    expect(await render(true)).toBe(before);
    await act(async () => root.unmount()); host.remove(); portal.remove();
  });
  it("keeps deeply nested form inputs distinct and independent of values and source tags", () => {
    const host = document.createElement("div");
    host.innerHTML = '<div data-inspector-scope="settings-personal-form"><div><div><div><div><input value="first"></div></div></div></div><div><div><div><div><input value="second"></div></div></div></div></div>';
    const inputs = [...host.querySelectorAll("input")];
    const key = (el: Element) => stableElementKey("/settings", stableAnchor(el));
    const before = inputs.map(key);
    expect(new Set(before).size).toBe(2);
    inputs.forEach(input => { input.value = "changed"; input.setAttribute("data-tsd-source", "src/pages/Profile.tsx:999"); });
    expect(inputs.map(key)).toEqual(before);
    const scope = host.firstElementChild;
    if (!scope) throw new Error("form missing");
    expect(key(scope)).toBe("el|/settings|scope:settings-personal-form|@div");
  });
});