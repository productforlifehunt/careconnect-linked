import { describe, it, expect } from "vitest";
import { nodeAt, removeNodes, curveNodes, reverseNodes, simplifyNodes, sampleBoundary } from "./zone-path";
const pent = () => [[0, 0], [0, 6], [3, 9], [6, 6], [6, 0]].map(p => nodeAt([p[0]!, p[1]!]));
describe("bulk zone editing", () => {
  it("deletes several selected points", () => expect(removeNodes(pent(), [1, 3]).map(n => n.point)).toEqual([[0, 0], [3, 9], [6, 0]]));
  it("refuses deletion that leaves fewer than 3 points", () => expect(removeNodes(pent(), [0, 1, 2]).length).toBe(5));
  it("select all + delete clears the zone", () => expect(removeNodes(pent(), [0, 1, 2, 3, 4])).toEqual([]));
  it("curves and straightens all points", () => {
    const c = curveNodes(pent(), [0, 1, 2, 3, 4], true);
    expect(c.every(n => n.incoming && n.outgoing)).toBe(true);
    expect(curveNodes(c, [0, 1, 2, 3, 4], false)).toEqual(pent());
  });
  it("reversing keeps the same shape", () => {
    const c = curveNodes(pent(), [2], true);
    expect(new Set(sampleBoundary(reverseNodes(c)).map(String))).toEqual(new Set(sampleBoundary(c).map(String)));
  });
  it("simplify drops points lying on a straight edge", () => {
    const n = [[0, 0], [0, 3], [0, 6], [6, 6], [6, 0]].map(p => nodeAt([p[0]!, p[1]!]));
    expect(simplifyNodes(n).map(x => x.point)).toEqual([[0, 0], [0, 6], [6, 6], [6, 0]]);
  });
});
