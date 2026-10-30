import { Bezier } from "bezier-js";

export type ZonePoint = [number, number];
export type PathNode = { point: ZonePoint; incoming: ZonePoint | null; outgoing: ZonePoint | null };
export const nodeAt = (point: ZonePoint): PathNode => ({ point, incoming: null, outgoing: null });
const xy = (p: ZonePoint) => ({ x: p[0], y: p[1] });
const pair = (p: { x: number; y: number }): ZonePoint => [p.x, p.y];
export function segment(a: PathNode, b: PathNode) {
  return new Bezier(xy(a.point), xy(a.outgoing ?? a.point), xy(b.incoming ?? b.point), xy(b.point));
}
export function sampleBoundary(nodes: PathNode[]): ZonePoint[] {
  if (nodes.length < 3) return nodes.map(n => n.point);
  return nodes.flatMap((a, i) => {
    const b = nodes[(i + 1) % nodes.length];
    if (!b || (!a.outgoing && !b.incoming)) return [a.point];
    return segment(a, b).getLUT(32).slice(0, -1).map(pair);
  });
}
export function smoothNode(nodes: PathNode[], i: number): PathNode[] {
  const n = nodes[i], before = nodes[(i - 1 + nodes.length) % nodes.length], after = nodes[(i + 1) % nodes.length];
  if (!n || !before || !after) return nodes;
  const delta: ZonePoint = [(after.point[0] - before.point[0]) / 6, (after.point[1] - before.point[1]) / 6];
  return nodes.map((p, j) => j !== i ? p : { ...p,
    incoming: [p.point[0] - delta[0], p.point[1] - delta[1]],
    outgoing: [p.point[0] + delta[0], p.point[1] + delta[1]],
  });
}
export function moveNode(n: PathNode, point: ZonePoint): PathNode {
  const shift = (p: ZonePoint | null): ZonePoint | null => p ? [p[0] + point[0] - n.point[0], p[1] + point[1] - n.point[1]] : null;
  return { point, incoming: shift(n.incoming), outgoing: shift(n.outgoing) };
}
export function moveHandle(n: PathNode, side: "incoming" | "outgoing", point: ZonePoint, linked: boolean): PathNode {
  const other = side === "incoming" ? "outgoing" : "incoming";
  return { ...n, [side]: point, ...(linked ? { [other]: [2 * n.point[0] - point[0], 2 * n.point[1] - point[1]] } : {}) };
}
export function insertNode(nodes: PathNode[], i: number): PathNode[] {
  const a = nodes[i], b = nodes[(i + 1) % nodes.length];
  if (!a || !b) return nodes;
  if (!a.outgoing && !b.incoming) {
    const copy = [...nodes];
    copy.splice(i + 1, 0, nodeAt([(a.point[0] + b.point[0]) / 2, (a.point[1] + b.point[1]) / 2]));
    return copy;
  }
  const { left, right } = segment(a, b).split(0.5);
  const l = left.points, r = right.points;
  if (!l[1] || !l[2] || !l[3] || !r[1] || !r[2]) return nodes;
  const leftOut = pair(l[1]), rightIn = pair(r[2]);
  const copy = nodes.map((n, j) => j === i ? { ...n, outgoing: leftOut } : j === (i + 1) % nodes.length ? { ...n, incoming: rightIn } : n);
  copy.splice(i + 1, 0, { point: pair(l[3]), incoming: pair(l[2]), outgoing: pair(r[1]) });
  return copy;
}