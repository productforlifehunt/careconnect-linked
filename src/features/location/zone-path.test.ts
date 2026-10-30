import { describe, it, expect } from "vitest";
import { nodeAt, smoothNode, moveNode, moveHandle, insertNode, segment, sampleBoundary } from "./zone-path";
const square = () => [[0, 0], [0, 6], [6, 6], [6, 0]].map(p => nodeAt([p[0] ?? 0, p[1] ?? 0]));
describe("editable region boundary", () => {
  it("keeps straight polygon coordinates unchanged", () => expect(sampleBoundary(square())).toEqual([[0, 0], [0, 6], [6, 6], [6, 0]]));
  it("creates two independently draggable curve handles", () => {
    const nodes = smoothNode(square(), 1);
    expect(nodes[1]?.incoming).toEqual([-1, 5]);
    expect(nodes[1]?.outgoing).toEqual([1, 7]);
    expect(sampleBoundary(nodes).length).toBeGreaterThan(4);
  });
  it("moves both handles with their anchor", () => {
    const n = smoothNode(square(), 1)[1];
    if (!n) throw Error("Missing node");
    expect(moveNode(n, [2, 8])).toEqual({ point: [2, 8], incoming: [1, 7], outgoing: [3, 9] });
  });
  it("linked handle reflects its opposite; unlinked retains it", () => {
    const n = smoothNode(square(), 1)[1];
    if (!n) throw Error("Missing node");
    expect(moveHandle(n, "outgoing", [2, 9], true).incoming).toEqual([-2, 3]);
    expect(moveHandle(n, "outgoing", [2, 9], false).incoming).toEqual([-1, 5]);
  });
  it("adds a point without changing the curve", () => {
    const nodes = smoothNode(square(), 1), next = insertNode(nodes, 1);
    const a = nodes[1], b = nodes[2], left = next[1], middle = next[2], right = next[3];
    if (!a || !b || !left || !middle || !right) throw Error("Missing nodes");
    expect(next).toHaveLength(5);
    for (const t of [0, .2, .5, .8, 1]) {
      const original = segment(a, b).get(t);
      const split = t <= .5 ? segment(left, middle).get(t * 2) : segment(middle, right).get((t - .5) * 2);
      expect(split.x).toBeCloseTo(original.x, 10);
      expect(split.y).toBeCloseTo(original.y, 10);
    }
  });
  it("removing handles restores the original straight boundary", () => {
    const nodes = smoothNode(square(), 1).map(n => ({ ...n, incoming: null, outgoing: null }));
    expect(sampleBoundary(nodes)).toEqual(sampleBoundary(square()));
  });
});