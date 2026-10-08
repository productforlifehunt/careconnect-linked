import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AnswerCard } from "@/pages/researcher/ResearcherApp";
import { screeningItemsForRole, screeningRole, screeningSource } from "@/features/esm/screening-source";

describe("role-specific researcher screening", () => {
  it("primary ends at DAS20 and excludes every secondary personal question", () => {
    const items = screeningItemsForRole("primary");
    expect(items).toHaveLength(133);
    expect(items.at(-1)?.label).toBe("I would like to get to know people with dementia better.");
    expect(items.every((i) => i.group.startsWith("1."))).toBe(true);
  });
  it("secondary contains 13 personal items followed by all 30 ADKS and 20 DAS", () => {
    const items = screeningItemsForRole("secondary");
    expect(items).toHaveLength(63);
    expect(items.filter((i) => i.code.startsWith("1.7.1."))).toHaveLength(30);
    expect(items.filter((i) => i.code.startsWith("1.7.2."))).toHaveLength(20);
    expect(items.slice(0, 13).every((i) => i.group.startsWith("2."))).toBe(true);
    expect(items.every((i) => i.group.startsWith("2.") || i.code.startsWith("1.7."))).toBe(true);
    for (const item of items.slice(13)) {
      const source = screeningSource(item, "secondary");
      expect(source.source).toContain("Secondary caregiver screening");
      expect(source.reference).toContain("Original section 2.2.");
    }
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
      expect(document.querySelectorAll("dt")).toHaveLength(role === "primary" ? 133 : 63);
      cleanup();
    });
  }
});