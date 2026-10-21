import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import InterviewsPanel from "@/pages/researcher/InterviewsPanel";
import { archiveObjectPath, normalizeArchiveLines } from "../../supabase/functions/_shared/interview-archive";

const api = vi.hoisted(() => ({
  listRecordings: vi.fn(), playUrl: vi.fn(), loadTranscriptArchive: vi.fn(), saveTranscriptArchive: vi.fn(),
  generateTranscript: vi.fn(), saveMeta: vi.fn(),
}));
vi.mock("@/features/interviews/transcribe", () => ({ ...api, displayName: (s: string) => s, deleteRecording: vi.fn(), uploadRecording: vi.fn(), replaceRecording: vi.fn() }));
vi.mock("@/services/wp-auth", () => ({ wpEnsureFreshToken: vi.fn(), wpLogin: vi.fn() }));
const raw = { lines: [{ s: "A", zh: "原始录音", en: "Original transcript", t: 30 }], savedAt: "2026-10-21" };
let edited: typeof raw | null;
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.clearAllMocks(); localStorage.clear(); edited = null;
  api.listRecordings.mockResolvedValue([{ path: "sample.wav", size: 500, meta: { title: "Network1 Caregiver1", notes: "", instructions: "" } }]);
  api.playUrl.mockResolvedValue("");
  api.loadTranscriptArchive.mockImplementation(async (_path, kind) => kind === "edited" ? edited : raw);
  api.saveTranscriptArchive.mockImplementation(async (_path, lines, kind) => {
    if (kind !== "edited") throw new Error("Must not overwrite Raw");
    edited = { lines, savedAt: "2026-10-21" }; return edited;
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("independent interview archives", () => {
  it("saves a researcher playback switch without generating or rewriting archives", async () => {
    api.saveMeta.mockImplementation(async (_path, value) => ({ title: "Network1", ...value }));
    render(<InterviewsPanel canEdit />);
    fireEvent.click(await screen.findByRole("switch", { name: "Allow visitor playback / 允许访客播放" }));
    await waitFor(() => expect(api.saveMeta).toHaveBeenCalledWith("sample.wav", expect.objectContaining({ playbackAllowed: false })));
    expect(api.generateTranscript).not.toHaveBeenCalled();
    expect(api.saveTranscriptArchive).not.toHaveBeenCalled();
  });
  it("persists all three switches across reload without changing recording metadata", async () => {
    let stored = { title: "Network1", notes: "Keep notes", instructions: "Keep instructions", playbackAllowed: true, showPlayback: true, showGenerate: true };
    api.listRecordings.mockImplementation(async () => [{ path: "sample.wav", size: 500, meta: stored }]);
    api.saveMeta.mockImplementation(async (_path, patch) => { stored = { ...stored, ...patch }; return stored; });
    const view = render(<InterviewsPanel canEdit />);
    for (const name of ["Allow visitor playback / 允许访客播放", "Show visitor player / 显示访客播放器", "Show visitor Generate New / 显示访客重新生成"]) {
      const control = await screen.findByRole("switch", { name });
      await waitFor(() => expect(control).toBeEnabled());
      fireEvent.click(control);
      await waitFor(() => expect(control).not.toBeChecked());
    }
    view.unmount();
    render(<InterviewsPanel canEdit />);
    expect(await screen.findByRole("switch", { name: "Allow visitor playback / 允许访客播放" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Show visitor player / 显示访客播放器" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Show visitor Generate New / 显示访客重新生成" })).not.toBeChecked();
    expect(stored).toEqual({ title: "Network1", notes: "Keep notes", instructions: "Keep instructions", playbackAllowed: false, showPlayback: false, showGenerate: false });
    expect(api.generateTranscript).not.toHaveBeenCalled();
    expect(api.saveTranscriptArchive).not.toHaveBeenCalled();
  });
  it("disables visitor playback without obtaining audio and preserves generation", async () => {
    api.listRecordings.mockResolvedValue([{ path: "sample.wav", size: 500, meta: { title: "Network1", notes: "", instructions: "", playbackAllowed: false, showPlayback: true } }]);
    render(<InterviewsPanel canEdit={false} />);
    expect(await screen.findByRole("button", { name: "Play recording" })).toBeDisabled();
    expect(api.playUrl).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Generate New Raw/ })).toBeEnabled();
  });
  it("hides visitor player and new generation while retaining Raw and Edited archive access", async () => {
    edited = raw;
    api.listRecordings.mockResolvedValue([{ path: "sample.wav", size: 500, meta: { title: "Network1", notes: "", instructions: "", showPlayback: false, showGenerate: false } }]);
    render(<InterviewsPanel canEdit={false} />);
    const rawButton = await screen.findByRole("button", { name: "View Raw Archived Translation and Transcription / 查看原始翻译与转录归档" });
    await waitFor(() => expect(rawButton).toBeEnabled());
    expect(screen.queryByRole("button", { name: "Play recording" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Generate New Raw/ })).toBeNull();
    expect(screen.getByRole("button", { name: "View Edited Archived Translation and Transcription / 查看修订翻译与转录归档" })).toBeEnabled();
    expect(api.playUrl).not.toHaveBeenCalled();
  });
  it("saves recruitment source with existing title, notes and instructions without generating a transcript", async () => {
    api.saveMeta.mockImplementation(async (_path, value) => value);
    render(<InterviewsPanel canEdit />);
    fireEvent.change(await screen.findByLabelText("Recruitment source / 招募来源"), { target: { value: "Hospital referral" } });
    fireEvent.click(screen.getByRole("button", { name: "Save / 保存" }));
    await waitFor(() => expect(api.saveMeta).toHaveBeenCalledWith("sample.wav", { title: "Network1 Caregiver1", notes: "", instructions: "", recruitmentSource: "Hospital referral" }));
    expect(api.generateTranscript).not.toHaveBeenCalled();
    expect(api.saveTranscriptArchive).not.toHaveBeenCalled();
  });
  it("keeps existing Raw objects and Edited objects at different paths", () => {
    expect(archiveObjectPath("sample.wav")).toBe("archive/sample.wav.json");
    expect(archiveObjectPath("sample.wav", "edited")).toBe("archive-edited/sample.wav.json");
    expect(() => archiveObjectPath("sample.wav", "other")).toThrow();
  });
  it("preserves manually corrected speaker, Chinese, English and original position", () => {
    expect(normalizeArchiveLines([{ s: "B", zh: "修订", en: "Corrected", t: 30 }])).toEqual([{ s: "B", zh: "修订", en: "Corrected", t: 30 }]);
  });
  it("allows researcher corrections only into Edited and reads them back without changing Raw", async () => {
    render(<InterviewsPanel canEdit />);
    fireEvent.click(await screen.findByRole("button", { name: "Edit transcript archive / 编辑转录归档" }));
    fireEvent.change(screen.getByLabelText("Chinese transcript 1"), { target: { value: "手动修订" } });
    fireEvent.change(screen.getByLabelText("English translation 1"), { target: { value: "Manual correction" } });
    fireEvent.change(screen.getByLabelText("Speaker 1"), { target: { value: "B" } });
    fireEvent.click(screen.getByRole("button", { name: "Save to Edited archive / 存入修订归档" }));
    await screen.findByText("手动修订");
    expect(api.saveTranscriptArchive).toHaveBeenCalledWith("sample.wav", [{ s: "B", zh: "手动修订", en: "Manual correction", t: 30 }], "edited");
    expect(api.loadTranscriptArchive).toHaveBeenCalledWith("sample.wav", "edited");
    fireEvent.click(screen.getByRole("button", { name: "View Raw Archived Translation and Transcription / 查看原始翻译与转录归档" }));
    expect(await screen.findByText("原始录音")).toBeTruthy();
  });
  it("lets visitors read Edited but never offers edit or save operations", async () => {
    edited = { ...raw, lines: [{ s: "B", zh: "修订公开", en: "Edited read-only", t: 30 }] };
    render(<InterviewsPanel canEdit={false} />);
    const view = await screen.findByRole("button", { name: "View Edited Archived Translation and Transcription / 查看修订翻译与转录归档" });
    await waitFor(() => expect(view).not.toBeDisabled()); fireEvent.click(view);
    expect(await screen.findByText("修订公开")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Edit transcript archive / 编辑转录归档" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save to Edited archive / 存入修订归档" })).toBeNull();
    expect(api.saveTranscriptArchive).not.toHaveBeenCalled();
  });
  it("requires confirmation before replacing an existing Edited archive", async () => {
    edited = raw;
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<InterviewsPanel canEdit />);
    fireEvent.click(await screen.findByRole("button", { name: "Edit transcript archive / 编辑转录归档" }));
    fireEvent.click(screen.getByRole("button", { name: "Save to Edited archive / 存入修订归档" }));
    expect(confirm).toHaveBeenCalled(); expect(api.saveTranscriptArchive).not.toHaveBeenCalled(); confirm.mockRestore();
  });
});