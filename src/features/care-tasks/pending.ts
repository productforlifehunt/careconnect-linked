import { T } from "@/integrations/wp-schema";

type CareTask = { cared_one_id?: string | number | null; finish_status?: string | null; status?: string | null };
export const carePersonId = (value: unknown) => String(value ?? "").replace(/^wp-/, "");

export function isPendingCareTask(task: CareTask): boolean {
  if (task.finish_status) return task.finish_status === T.careTask.opt.TASK_FINISH_STATUS.NOT_FINISHED;
  return task.status === "pending";
}

export function pendingCareTasks<TTask extends CareTask>(tasks: readonly TTask[] | undefined, personIds: readonly unknown[]): TTask[] {
  const people = new Set(personIds.map(carePersonId).filter(Boolean));
  return (tasks || []).filter((task) => people.has(carePersonId(task.cared_one_id)) && isPendingCareTask(task));
}

export function pendingCareTaskTarget(tasks: readonly CareTask[], fallbackPersonId?: unknown): string {
  const person = carePersonId(tasks[0]?.cared_one_id || fallbackPersonId);
  return person ? `/cared-ones/${person}/tasks` : "/cared-ones";
}