import { expect, it } from "vitest";
import {
  findPositionBindings,
  positionBindings,
  updatePositionBindings,
} from "./position-bindings";
const binding = {
  key: "el|/care-circle/28|Stats|@div0>span0",
  id: "10527",
  scope: "element" as const,
  page: "/care-circle/28",
  label: "任务",
  locked: true,
};
it("CCT324 a59 preserves pre-existing metadata and REL325 reference metadata verbatim", () => {
  const original = {
    version: 2,
    relatedNoteIds: ["6857"],
    frontendTargets: [{ app: "afresh", pageKey: "/" }],
    otherAssociations: ["keep"],
  };
  const saved = updatePositionBindings(JSON.stringify(original), [binding]);
  expect(JSON.parse(saved)).toEqual({
    ...original,
    inspectorBindings: [binding],
  });
  expect(positionBindings(saved, "10527")).toEqual([binding]);
});
it("migration preserves exact element keys, note IDs and lock state without source guessing", () => {
  expect(
    findPositionBindings(
      positionBindings(updatePositionBindings("", [binding]), "10527"),
      "el|/care-circle/:id|Stats|@div0>span0",
    ),
  ).toEqual([binding]);
  expect(
    findPositionBindings([binding], "el|/care-circle/28|Stats|@div0>span1"),
  ).toEqual([]);
});
it("one note retains separate page and multiple element positions", () => {
  const list = [
    binding,
    { ...binding, key: "page|/settings", scope: "page" as const },
    { ...binding, key: "el|*|scope:ai-chat-dialog|@div>div0" },
  ];
  expect(positionBindings(updatePositionBindings(null, list), "10527")).toEqual(
    list,
  );
});
it("rejects corrupted a59 without overwriting it", () => {
  expect(() =>
    updatePositionBindings("manual non-JSON content", [binding]),
  ).toThrow();
  expect(() =>
    positionBindings('{"inspectorBindings":[{"id":"3"}]}', "10527"),
  ).toThrow();
});
it("returns every note linked to the same position across record routes", () => {
  const otherNote = {
    ...binding,
    key: binding.key.replace("/28", "/31"),
    id: "10537",
  };
  expect(findPositionBindings([binding, otherNote], binding.key)).toEqual([
    binding,
    otherNote,
  ]);
});
