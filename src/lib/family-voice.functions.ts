import { invokeServerAction } from "@/lib/server-action-client";

export function familyVoiceAction(args?: { data?: unknown }) {
  return invokeServerAction("familyVoiceAction", args?.data);
}
