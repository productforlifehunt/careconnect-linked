import { describe, expect, it } from "vitest";
import { ESM_SPEC } from "@/features/esm/spec.generated";
import { scaleRangeLabel } from "@/features/esm/screening-source";

describe("researcher scale range labels", () => {
  for (const item of ESM_SPEC) {
    it(`${item.id}: ${item.scale ? "shows exact defined bounds" : "does not invent numeric bounds"}`, () => {
      expect(scaleRangeLabel(item)).toBe(
        item.scale ? `Scale / 量表范围：${item.scale.min}–${item.scale.max}` : null,
      );
    });
  }
});