import { invokeServerAction } from "@/lib/server-action-client";

export function explainReadWrite(args?: { data?: unknown }) {
  return invokeServerAction("explainReadWrite", args?.data);
}

export function checkNoteConflicts(args?: { data?: unknown }) {
  return invokeServerAction("checkNoteConflicts", args?.data);
}

export function analyzeSiteNote(args?: { data?: unknown }) {
  return invokeServerAction("analyzeSiteNote", args?.data);
}

export function chatAboutCorrection(args?: { data?: unknown }) {
  return invokeServerAction("chatAboutCorrection", args?.data);
}
