import { describe, expect, it } from "vitest";
import { isPendingCareTask, pendingCareTasks, pendingCareTaskTarget } from "./pending";

describe("traceable pending care tasks", () => {
  const tasks = [
    { id: "1", cared_one_id: "wp-70", finish_status: "b55", status: "pending" },
    { id: "2", cared_one_id: "71", finish_status: "b56", status: "pending" },
    { id: "3", cared_one_id: "99", finish_status: "b55" },
    { id: "4", cared_one_id: null, finish_status: "b55" },
  ];
  it("one pending task means the same one task in the matching person's list", () => {
    const home = pendingCareTasks(tasks, [70, "wp-71"]);
    expect(home.map(t => t.id)).toEqual(["1"]);
    expect(pendingCareTasks(tasks, ["70"])).toEqual(home);
    expect(pendingCareTasks(tasks, [71])).toEqual([]);
  });
  it("clicking the count of 1 opens person 70's tasks, not a generic person page", () => {
    expect(pendingCareTaskTarget(pendingCareTasks(tasks, [70, 71]), 71)).toBe("/cared-ones/70/tasks");
  });
  it("finished dictionary status wins over a stale legacy pending label", () => {
    expect(isPendingCareTask({ finish_status: "b56", status: "pending" })).toBe(false);
  });
  it("unknown status is not invented as pending", () => {
    expect(isPendingCareTask({ cared_one_id: "70" })).toBe(false);
    expect(isPendingCareTask({ finish_status: "bad", status: "pending" })).toBe(false);
  });
  it("legacy pending remains usable and empty counts still open the chosen person's tasks", () => {
    expect(isPendingCareTask({ status: "pending" })).toBe(true);
    expect(pendingCareTaskTarget([], "wp-71")).toBe("/cared-ones/71/tasks");
    expect(pendingCareTaskTarget([])).toBe("/cared-ones");
  });
});