import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { addFamilyVoice, listFamilyVoices, renameFamilyVoice } from "@/lib/family-voices";
import { FamilyVoiceCard } from "@/components/cared-ones/FamilyVoiceCard";

const api = vi.hoisted(() => ({ createClonedVoice: vi.fn(), deleteClonedVoice: vi.fn(), speakClonedVoice: vi.fn() }));
vi.mock("@/lib/voice-clone.functions", () => api);
vi.mock("@/lib/ai", () => ({ VoiceRecorder: vi.fn() }));
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