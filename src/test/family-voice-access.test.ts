import { afterEach, expect, it, vi } from "vitest";
import { wordpressStore, verifiedActor } from "@/features/family-voices/store.server";
import { FAMILY_VOICE_RELATION } from "@/features/family-voices/schema";
afterEach(() => vi.unstubAllGlobals());
it("denies a voice to a caregiver with no accepted cared-one relation", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));
  await expect(wordpressStore("test", "test").access("1", "46")).rejects.toThrow("No access");
});
it("allows two existing caregivers linked to the same cared one", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([{ child_object_id: 46, meta: { a58: "b55" } }])));
  const store = wordpressStore("test", "test");
  await expect(store.access("1", "46")).resolves.toBeUndefined();
  await expect(store.access("54", "46")).resolves.toBeUndefined();
});
it("denies a pending caregiver relationship", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([{ child_object_id: 46, meta: { a58: "b56" } }])));
  await expect(wordpressStore("test", "test").access("1", "46")).rejects.toThrow("No access");
});
it("resolves voice ownership only from REL323 and rejects a different cared one", async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json([{ parent_object_id: 46 }])); vi.stubGlobal("fetch", fetcher);
  await expect(wordpressStore("test", "test").owned("1", "7", "54")).rejects.toThrow("different cared one");
  expect(fetcher.mock.calls[0]?.[0]).toContain(`jet-rel/${FAMILY_VOICE_RELATION}/parents/7`);
});
it("rejects unsigned-out callers before any storage request", async () => {
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  await expect(verifiedActor("")).rejects.toThrow("Please sign in"); expect(fetcher).not.toHaveBeenCalled();
});