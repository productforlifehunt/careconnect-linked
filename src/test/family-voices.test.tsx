import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { addFamilyVoice, listFamilyVoices, renameFamilyVoice } from "@/lib/family-voices";
import { FamilyVoiceCard } from "@/components/cared-ones/FamilyVoiceCard";
import { DEFAULT_FAMILY_VOICE_MODEL, FAMILY_VOICE_MODELS, resolveFamilyVoiceModel, VOICE_RECORDING_SECONDS, VOICE_MIN_RECORDING_SECONDS } from "@/lib/family-voice-models";

const api = vi.hoisted(() => ({ createClonedVoice: vi.fn(), deleteClonedVoice: vi.fn(), speakClonedVoice: vi.fn(), transcribeAudio: vi.fn(), start: vi.fn(), stop: vi.fn(), cancel: vi.fn() }));
vi.mock("@/lib/voice-clone.functions", () => api);
vi.mock("@/lib/ai", () => ({ VoiceRecorder: class { start = api.start; stop = api.stop; cancel = api.cancel; }, transcribeAudio: api.transcribeAudio }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" } }) }));
const voice = { id: "saved-voice", voiceId: "existing-provider-voice", label: "亲友声音", caredOneId: "46", caredOneName: "家人", createdAt: "2026-10-29T15:00:00Z" };
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); addFamilyVoice(voice); });
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
  fireEvent.click(screen.getByRole("button", { name: "改名：亲友声音" }));
  fireEvent.change(screen.getByLabelText("声音名称"), { target: { value: "儿子" } });
  fireEvent.click(screen.getByRole("button", { name: "保存名称" }));
  expect(listFamilyVoices("46")[0]).toEqual({ ...voice, label: "儿子" });
  fireEvent.change(screen.getByLabelText("试听文字"), { target: { value: "妈妈，这个人是来帮忙的。" } });
  fireEvent.click(screen.getByRole("button", { name: "合成并播放" }));
  await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
  expect(api.speakClonedVoice).toHaveBeenCalledWith({ data: { voiceId: voice.voiceId, text: "妈妈，这个人是来帮忙的。" } });
  expect(api.createClonedVoice).not.toHaveBeenCalled();
});

it("retains the old Qwen binding for previously saved voices", () => {
  expect(resolveFamilyVoiceModel(listFamilyVoices("46")[0]?.model)).toBe("qwen-audio-3.1-tts-flash");
});

it("rejects unlisted providers and models", () => {
  expect(() => resolveFamilyVoiceModel("minimax")).toThrow("Unsupported family voice model");
});

it("orders character prices and separates token billing without inventing a price", () => {
  expect(FAMILY_VOICE_MODELS.map((v) => v.price)).toEqual([0.8, 1, 1, 1.4, 1.4, 1.5, 2, 2, null]);
  expect(FAMILY_VOICE_MODELS.at(-1)?.id).toBe(DEFAULT_FAMILY_VOICE_MODEL);
});

it("allows recording until the official 60-second maximum", () => {
  expect(VOICE_MIN_RECORDING_SECONDS).toBe(10);
  expect(VOICE_RECORDING_SECONDS).toBe(60);
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
  fireEvent.change(screen.getByLabelText("试听文字"), { target: { value: "妈妈，这个人是来帮忙的。" } });
  fireEvent.click(screen.getByRole("button", { name: "合成并播放" }));
  await waitFor(() => expect(api.speakClonedVoice).toHaveBeenCalledWith({ data: { voiceId: voice.voiceId, model: "cosyvoice-v3.5-flash", text: "妈妈，这个人是来帮忙的。" } }));
  expect(api.createClonedVoice).not.toHaveBeenCalled();
});

it("preserves a voice record when remote deletion fails", async () => {
  api.deleteClonedVoice.mockRejectedValue(new Error("unavailable"));
  render(<FamilyVoiceCard caredOneId="46" caredOneName="家人" />);
  fireEvent.click(screen.getByRole("button", { name: "删除" }));
  await waitFor(() => expect(api.deleteClonedVoice).toHaveBeenCalled());
  expect(listFamilyVoices("46")).toEqual([voice]);
});