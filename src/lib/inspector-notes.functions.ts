import { invokeServerAction } from "@/lib/server-action-client";

export function loadInspectorNotes(args?: { data?: unknown }) {
  return invokeServerAction("loadInspectorNotes", args?.data);
}

export function listInspectorPositionNotes(args?: { data?: unknown }) {
  return invokeServerAction("listInspectorPositionNotes", args?.data);
}

export function unlinkInspectorPositionNote(args?: { data?: unknown }) {
  return invokeServerAction("unlinkInspectorPositionNote", args?.data);
}

export function deleteInspectorNote(args?: { data?: unknown }) {
  return invokeServerAction("deleteInspectorNote", args?.data);
}

export function reorderInspectorPositionNotes(args?: { data?: unknown }) {
  return invokeServerAction("reorderInspectorPositionNotes", args?.data);
}

export function updateBoundInspectorNote(args?: { data?: unknown }) {
  return invokeServerAction("updateBoundInspectorNote", args?.data);
}

export function loadAllInspectorNotes(args?: { data?: unknown }) {
  return invokeServerAction("loadAllInspectorNotes", args?.data);
}

export function searchInspectorNotes(args?: { data?: unknown }) {
  return invokeServerAction("searchInspectorNotes", args?.data);
}

export function saveInspectorNote(args?: { data?: unknown }) {
  return invokeServerAction("saveInspectorNote", args?.data);
}

export function selectInspectorNote(args?: { data?: unknown }) {
  return invokeServerAction("selectInspectorNote", args?.data);
}

export function submitNoteCorrection(args?: { data?: unknown }) {
  return invokeServerAction("submitNoteCorrection", args?.data);
}

export function listRelatedNotes(args?: { data?: unknown }) {
  return invokeServerAction("listRelatedNotes", args?.data);
}

export function linkRelatedNote(args?: { data?: unknown }) {
  return invokeServerAction("linkRelatedNote", args?.data);
}

export function unlinkRelatedNote(args?: { data?: unknown }) {
  return invokeServerAction("unlinkRelatedNote", args?.data);
}

export function updateRelatedNote(args?: { data?: unknown }) {
  return invokeServerAction("updateRelatedNote", args?.data);
}

export function duplicateInspectorNoteVersion(args?: { data?: unknown }) {
  return invokeServerAction("duplicateInspectorNoteVersion", args?.data);
}
