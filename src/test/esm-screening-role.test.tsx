import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AnswerCard } from "@/pages/researcher/ResearcherApp";
import { screeningItemsForRole, screeningRole, screeningSource } from "@/features/esm/screening-source";

describe("role-specific researcher screening", () => {
  it("primary ends at DAS20 and excludes every secondary personal question", () => {
    const items = screeningItemsForRole("primary");
    expect(items).toHaveLength(135);
    expect(items.at(-1)?.label).toBe("I would like to get to know people with dementia better.");
    expect(items.every((i) => i.group.startsWith("1."))).toBe(true);
  });
  it("secondary contains 11 personal fields including follow-ups, then all 30 ADKS and 20 DAS", () => {
    const items = screeningItemsForRole("secondary");
    expect(items).toHaveLength(61);
    expect(items.filter((i) => i.code.startsWith("1.7.1."))).toHaveLength(30);
    expect(items.filter((i) => i.code.startsWith("1.7.2."))).toHaveLength(20);
    expect(items.slice(0, 11).every((i) => i.group.startsWith("2."))).toBe(true);
    expect(items.every((i) => i.group.startsWith("2.") || i.code.startsWith("1.7."))).toBe(true);
    for (const item of items.slice(11)) {
      const source = screeningSource(item, "secondary");
      expect(source.source).toContain("Secondary caregiver screening");
      expect(source.reference).toContain("Original section 2.2.");
      expect(source.reference).not.toContain("1.7.");
    }
  });
  it("secondary provenance follows the supplied Section 2.1 numbering exactly", () => {
    const items = screeningItemsForRole("secondary").slice(0, 11);
    const references = Object.fromEntries(items.map((item) => [item.id, screeningSource(item, "secondary").reference]));
    expect(references["c318_a134"]).toContain("Original question 2.1.1");
    expect(references["c318_a135"]).toContain("Original question 2.1.2");
    expect(references["c318_a136"]).toBe("Original section 2.1, Education Level (unnumbered) / 原问卷 2.1 节，教育程度（原文未单独编号）");
    expect(references["c318_a137"]).toContain("Original question 2.1.3");
    expect(references["c318_a1371"]).toContain("Original question 2.1.3");
    expect(references["c318_a138"]).toContain("Original question 2.1.4");
    expect(references["c318_a1381"]).toContain("Original question 2.1.4");
    expect(references["c318_a139"]).toContain("Original question 2.1.5");
    expect(references["c318_a140"]).toContain("Original question 2.1.6");
    expect(references["c318_a142"]).toContain("Original question 2.1.7");
    expect(references["c318_a143"]).toContain("Original question 2.1.8");
  });
  it("interview role overrides mixed legacy rows without guessing ambiguous roles", () => {
    const mixed = { a02: 34, a134: 32 };
    expect(screeningRole("Primary caregiver", mixed)).toBe("primary");
    expect(screeningRole("Secondary caregiver", mixed)).toBe("secondary");
    expect(screeningRole("Unknown", mixed)).toBeNull();
  });
  for (const role of ["primary", "secondary"] as const) {
    it(`${role}: viewing and editing show only the correct questionnaire`, () => {
      const row = Object.fromEntries([...screeningItemsForRole("primary"), ...screeningItemsForRole("secondary")].map((i) => [i.column, "1"]));
      render(<AnswerCard kind="screening" row={row} participantName={`${role} caregiver`} start={null} canEdit />);
      const forbidden = role === "primary" ? "Relationship to Primary Caregiver" : "Care Recipient Education Level";
      expect(screen.queryByText((text) => text.startsWith(forbidden))).toBeNull();
      expect(screen.getByText((text) => text.startsWith("I would like to get to know people with dementia better."))).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Edit / 编辑" }));
      expect(screen.queryByText((text) => text.startsWith(forbidden))).toBeNull();
      expect(document.querySelectorAll("dt")).toHaveLength(role === "primary" ? 135 : 61);
      cleanup();
    });
  }
});
