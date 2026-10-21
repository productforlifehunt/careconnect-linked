import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ParticipantDetails } from "@/components/esm/ParticipantDetails";
import { compareResearchTitles } from "@/features/interviews/research-order";

const api = vi.hoisted(() => ({ saveParticipantMeta: vi.fn() }));
vi.mock("@/features/interviews/transcribe", () => api);
vi.mock("@/services/wp-auth", () => ({ wpEnsureFreshToken: vi.fn() }));
const meta = { title: "P-CN1-A1 Primary caregiver", recruitmentSource: "", notes: "Existing notes" };
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("research participant code ordering", () => {
  it("uses CN rather than conflicting prose Network numbers", () => {
    expect(["P-CN4-A1 Network2", "P-CN3-A2 Network9"].sort(compareResearchTitles)).toEqual(["P-CN3-A2 Network9", "P-CN4-A1 Network2"]);
  });
  it("orders networks numerically and A before B within each network", () => {
    expect(["P-CN10-A1", "P-CN2-B1", "P-CN1-A2", "P-CN1-A1", "P-CN2-A1"].sort(compareResearchTitles)).toEqual(["P-CN1-A1", "P-CN1-A2", "P-CN2-A1", "P-CN2-B1", "P-CN10-A1"]);
  });
  it("puts occasional P-C participants after all network participants", () => {
    expect(["P-C10", "P-C2", "P-CN20-B1", "P-C1"].sort(compareResearchTitles)).toEqual(["P-CN20-B1", "P-C1", "P-C2", "P-C10"]);
  });
});
describe("researcher-only participant display editing", () => {
  it("saves title and recruitment source with unchanged notes and displays the returned stored values", async () => {
    api.saveParticipantMeta.mockImplementation(async (_id, value) => value);
    const onSaved = vi.fn();
    const view = render(<ParticipantDetails id="68" meta={meta} canEdit onSaved={onSaved} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit participant / 编辑参与者" }));
    fireEvent.change(screen.getByLabelText("Title / 标题（姓名与身份）"), { target: { value: "P-CN3-B1 Lin Mei" } });
    fireEvent.change(screen.getByLabelText("Recruitment source / 招募来源"), { target: { value: "Community referral" } });
    fireEvent.click(screen.getByRole("button", { name: "Save / 保存" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    view.rerender(<ParticipantDetails id="68" meta={onSaved.mock.calls[0]?.[0]} canEdit onSaved={onSaved} />);
    expect(screen.getByText("P-CN3-B1 Lin Mei")).toBeTruthy();
    expect(api.saveParticipantMeta).toHaveBeenCalledWith("68", { title: "P-CN3-B1 Lin Mei", recruitmentSource: "Community referral", notes: "Existing notes" });
    expect(onSaved).toHaveBeenCalledWith({ title: "P-CN3-B1 Lin Mei", recruitmentSource: "Community referral", notes: "Existing notes" });
  });
  it("does not offer editing to visitors", () => {
    render(<ParticipantDetails id="68" meta={meta} canEdit={false} onSaved={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Edit participant / 编辑参与者" })).toBeNull();
    expect(api.saveParticipantMeta).not.toHaveBeenCalled();
  });
  it("retains the draft when saving is refused", async () => {
    api.saveParticipantMeta.mockRejectedValue(new Error("Only the researcher"));
    render(<ParticipantDetails id="68" meta={meta} canEdit onSaved={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit participant / 编辑参与者" }));
    fireEvent.change(screen.getByLabelText("Recruitment source / 招募来源"), { target: { value: "Retained source" } });
    fireEvent.click(screen.getByRole("button", { name: "Save / 保存" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Only the researcher");
    expect(screen.getByLabelText("Recruitment source / 招募来源")).toHaveValue("Retained source");
  });
});