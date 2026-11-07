import { invokeServerAction } from "@/lib/server-action-client";

export function getInterviewOverview(args?: { data?: unknown }) {
  return invokeServerAction("getInterviewOverview", args?.data);
}
