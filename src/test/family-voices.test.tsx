import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { addFamilyVoice, listFamilyVoices, renameFamilyVoice, playBase64Mp3 } from "@/lib/family-voices";
import { FamilyVoiceCard } from "@/components/cared-ones/FamilyVoiceCard";
import { DEFAULT_FAMILY_VOICE_MODEL, resolveFamilyVoiceModel, VOICE_RECORDING_SECONDS, VOICE_MIN_RECORDING_SECONDS } from "@/lib/family-voice-models";
import { saveFamilyVoiceRecording } from "@/lib/family-voices";

const api = vi.hoisted(() => ({ familyVoiceAction: vi.fn(), createClonedVoice: vi.fn(), deleteClonedVoice: vi.fn(), speakClonedVoice: vi.fn(), transcribeAudio: vi.fn(), start: vi.fn(), stop: vi.fn(), cancel: vi.fn() }));
vi.mock("@/lib/family-voice.functions", () => ({ familyVoiceAction: api.familyVoiceAction }));
vi.mock("@/lib/ai", () => ({ VoiceRecorder: class { start = api.start; stop = api.stop; cancel = api.cancel; }, transcribeAudio: api.transcribeAudio }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" } }) }));
const voice = { id: "7", voiceId: "existing-provider-voice", label: "亲友声音", caredOneId: "46", caredOneName: "家人", state: "b56", audioSaved: true, createdAt: "2026-10-29T15:00:00Z" };
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); addFamilyVoice(voice); api.familyVoiceAction.mockImplementation(async ({ data }: { data: any }) => {
  if (data.action === "list") return { voices: listFamilyVoices(data.caredOneId) };
  if (data.action === "rename") { renameFamilyVoice(data.id, data.label); return { voice: listFamilyVoices(data.caredOneId)[0] }; }
  if (data.action === "speak") return api.speakClonedVoice({ data: { voiceId: voice.voiceId, text: data.text, ...(listFamilyVoices(data.caredOneId)[0]?.model ? { model: listFamilyVoices(data.caredOneId)[0]?.model } : {}) } });
  if (data.action === "delete") return api.deleteClonedVoice({ data: { voiceId: voice.voiceId } });
  return {};
}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("renames to 儿子 without changing the cloned voice identity and notifies consumers", () => {
  const changed = vi.fn(); window.addEventListener("family-voices-changed", changed);
  renameFamilyVoice(voice.id, " 儿子 ");
  expect(listFamilyVoices("46")).toEqual([{ ...voice, label: "儿子" }]);
  expect(changed).toHaveBeenCalledTimes(1);
  window.removeEventListener("family-voices-changed", changed);
});

it("saves a manual rename and synthesizes the entered words with the original voice", async () => {
  api.speakClonedVoice.mockResolvedValue({ audioBase64: "test-audio" });
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
  fireEvent.click(await screen.findByRole("button", { name: "改名：亲友声音" }));
  fireEvent.change(screen.getByLabelText("声音名称"), { target: { value: "儿子" } });
  fireEvent.click(screen.getByRole("button", { name: "保存名称" }));
  await waitFor(() => expect(listFamilyVoices("46")[0]).toEqual({ ...voice, label: "儿子" }));
  await screen.findByRole("button", { name: "改名：亲友声音" }).catch(() => screen.findByRole("button", { name: "改名：儿子" }));
  fireEvent.change(screen.getByLabelText("试听文字"), { target: { value: "妈妈，这个人是来帮忙的。" } });
  fireEvent.click(screen.getByRole("button", { name: "合成并播放" }));
  await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
  expect(api.speakClonedVoice).toHaveBeenCalledWith({ data: { voiceId: voice.voiceId, text: "妈妈，这个人是来帮忙的。" } });
  expect(api.createClonedVoice).not.toHaveBeenCalled();
});

it("retains the old Qwen binding for previously saved voices", () => {
  expect(resolveFamilyVoiceModel(listFamilyVoices("46")[0]?.model)).toBe("qwen-audio-3.1-tts-flash");
});

it("plays a multi-sentence preview once at constant 100% volume without sentence splitting", async () => {
  api.speakClonedVoice.mockResolvedValue({ audioBase64: "test-audio" });
  const players: HTMLAudioElement[] = [];
  vi.stubGlobal("Audio", function (src: string) {
    const player = document.createElement("audio");
    player.src = src;
    player.volume = 0.25;
    players.push(player);
    return player;
  });
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  try {
    render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
    await screen.findByRole("button", { name: "改名：亲友声音" });
    const text = "你好。今天我来陪你。我们慢慢聊，不着急。";
    fireEvent.change(screen.getByLabelText("试听文字"), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: "合成并播放" }));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    expect(api.speakClonedVoice).toHaveBeenCalledTimes(1);
    expect(api.speakClonedVoice).toHaveBeenCalledWith({ data: { voiceId: voice.voiceId, text } });
    expect(players).toHaveLength(1);
    expect(players[0]?.volume).toBe(1);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(players[0]?.volume).toBe(1);
  } finally { vi.unstubAllGlobals(); }
});

it("plays the preserved original recording at 100% volume", async () => {
  api.familyVoiceAction.mockImplementation(async ({ data }: { data: any }) => data.action === "list" ? { voices: [voice] } : { audioBase64: "test-audio", mime: "audio/wav" });
  const players: HTMLAudioElement[] = [];
  vi.stubGlobal("Audio", function (src: string) {
    const player = document.createElement("audio");
    player.src = src; player.volume = 0.25; players.push(player);
    return player;
  });
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  try {
    render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
    fireEvent.click(await screen.findByRole("button", { name: "听原始录音" }));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    expect(players[0]?.volume).toBe(1);
    expect(api.familyVoiceAction).toHaveBeenCalledWith({ data: { action: "original", id: "7", caredOneId: "46" } });
  } finally { vi.unstubAllGlobals(); }
});

it("plays AI-call family voice output at 100% volume", () => {
  vi.stubGlobal("Audio", function (src: string) {
    const player = document.createElement("audio");
    player.src = src; player.volume = 0.25;
    return player;
  });
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  try {
    const player = playBase64Mp3("test-audio");
    expect(player.volume).toBe(1);
    expect(play).toHaveBeenCalledTimes(1);
  } finally { vi.unstubAllGlobals(); }
});

it("rejects unlisted providers and models", () => {
  expect(() => resolveFamilyVoiceModel("minimax")).toThrow("Unsupported family voice model");
});

it("enrolls every new recording with the default flash model and keeps stored models resolvable", async () => {
  api.familyVoiceAction.mockResolvedValue({ voice: { ...voice, id: "8", model: DEFAULT_FAMILY_VOICE_MODEL } });
  const blob = new Blob([new Int16Array(16000).fill(1000)], { type: "audio/wav" });
  const saved = await saveFamilyVoiceRecording("46", "儿子", blob);
  expect(api.familyVoiceAction).toHaveBeenCalledWith({ data: expect.objectContaining({ action: "create", model: DEFAULT_FAMILY_VOICE_MODEL }) });
  expect(saved.model).toBe(DEFAULT_FAMILY_VOICE_MODEL);
  expect(resolveFamilyVoiceModel("qwen-audio-3.1-tts-plus")).toBe("qwen-audio-3.1-tts-plus");
});

it("never shows model names, prices or a model picker to users", async () => {
  localStorage.clear();
  addFamilyVoice({ ...voice, model: "qwen-audio-3.1-tts-plus" });
  render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
  await screen.findByRole("button", { name: "开始录音" });
  const text = document.body.textContent || "";
  expect(text).not.toMatch(/Qwen|CosyVoice|千问|¥|万字符|模型/);
  expect(screen.queryByLabelText("复刻模型")).toBeNull();
});

it("allows recording until the official 60-second maximum", () => {
  expect(VOICE_MIN_RECORDING_SECONDS).toBe(10);
  expect(VOICE_RECORDING_SECONDS).toBe(60);
});

it("does not cut off at 20 seconds and stops recording at 60 seconds", async () => {
  await act(async () => {});
  vi.useFakeTimers();
  api.start.mockResolvedValue(undefined);
  api.stop.mockResolvedValue(null);
  try {
    await act(async () => { render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />); });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "开始录音" })); });
    await act(async () => { vi.advanceTimersByTime(20000); });
    expect(api.stop).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(40000); });
    expect(api.stop).toHaveBeenCalledTimes(1);
  } finally { vi.useRealTimers(); }
});

it("transcribes speech into editable preview text without enrolling or synthesizing automatically", async () => {
  const blob = new Blob(["complete recorded speech"], { type: "audio/wav" });
  api.start.mockResolvedValue(undefined); api.stop.mockResolvedValue(blob);
  api.transcribeAudio.mockResolvedValue("妈妈，我晚点给你打电话。");
  render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
  fireEvent.change(screen.getByLabelText("试听文字"), { target: { value: "你好。" } });
  fireEvent.click(screen.getByRole("button", { name: "语音输入" }));
  await screen.findByRole("button", { name: "停止并转文字" });
  fireEvent.click(screen.getByRole("button", { name: "停止并转文字" }));
  await waitFor(() => expect(screen.getByLabelText("试听文字")).toHaveValue("你好。 妈妈，我晚点给你打电话。"));
  expect(api.transcribeAudio).toHaveBeenCalledWith(blob, "zh");
  expect(api.createClonedVoice).not.toHaveBeenCalled();
  expect(api.speakClonedVoice).not.toHaveBeenCalled();
});

it("sends the saved CosyVoice model and exact entered words without re-enrollment", async () => {
  localStorage.clear();
  addFamilyVoice({ ...voice, model: "cosyvoice-v3.5-flash" });
  api.speakClonedVoice.mockResolvedValue({ audioBase64: "test-audio" });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
  await screen.findByRole("button", { name: "改名：亲友声音" }).catch(() => screen.findByRole("button", { name: "改名：儿子" }));
  fireEvent.change(screen.getByLabelText("试听文字"), { target: { value: "妈妈，这个人是来帮忙的。" } });
  fireEvent.click(screen.getByRole("button", { name: "合成并播放" }));
  await waitFor(() => expect(api.speakClonedVoice).toHaveBeenCalledWith({ data: { voiceId: voice.voiceId, model: "cosyvoice-v3.5-flash", text: "妈妈，这个人是来帮忙的。" } }));
  expect(api.createClonedVoice).not.toHaveBeenCalled();
});

it("preserves a voice record when remote deletion fails", async () => {
  api.deleteClonedVoice.mockRejectedValue(new Error("unavailable"));
  render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
  fireEvent.click(await screen.findByRole("button", { name: "删除" }));
  await waitFor(() => expect(api.deleteClonedVoice).toHaveBeenCalled());
  expect(listFamilyVoices("46")).toEqual([voice]);
});