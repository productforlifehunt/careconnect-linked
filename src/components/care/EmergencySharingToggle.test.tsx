// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmergencySharingToggle } from "./EmergencySharingToggle";

afterEach(cleanup);
describe("emergency sharing confirmation", () => {
  it("does not disable permission before confirmation", () => {
    const save = vi.fn();
    render(<EmergencySharingToggle allowed pending={false} isZh onSave={save} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByRole("switch", { hidden: true }).getAttribute("aria-checked")).toBe("true");
  });
  it("cancelling keeps permission enabled without a write", () => {
    const save = vi.fn();
    render(<EmergencySharingToggle allowed pending={false} isZh onSave={save} />);
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  });
  it("confirmation saves false exactly once", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<EmergencySharingToggle allowed pending={false} isZh onSave={save} />);
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "确认关闭" }));
    await waitFor(() => expect(save).toHaveBeenCalledExactlyOnceWith(false));
  });
  it("confirmed enabling saves true", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<EmergencySharingToggle allowed={false} pending={false} isZh onSave={save} />);
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "确认开启" }));
    await waitFor(() => expect(save).toHaveBeenCalledExactlyOnceWith(true));
  });
  it("failed save keeps the permission enabled and dialog open", async () => {
    const save = vi.fn().mockRejectedValue(new Error("failed"));
    render(<EmergencySharingToggle allowed pending={false} isZh onSave={save} />);
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "确认关闭" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "确认关闭" }).hasAttribute("disabled")).toBe(false));
    expect(screen.getByRole("switch", { hidden: true }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });
});