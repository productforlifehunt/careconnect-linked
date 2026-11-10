export async function runServerAction(name: string, data: unknown, request: Request): Promise<unknown> {
  switch (name) {
    case "saveOwnPayout":
      return (await import("@/features/providers/payout.server")).saveOwnPayout(data, request);
    case "editOwnReview":
      return (await import("@/features/reviews/edit.server")).editOwnReview(data, request);
    case "familyVoiceAction":
      return (await import("@/lib/family-voice.functions.server")).familyVoiceAction(data, request);
    case "getInterviewOverview":
      return (await import("@/lib/interview-overview.functions.server")).getInterviewOverview(data, request);
    case "explainReadWrite":
      return (await import("@/lib/inspector-ai.functions.server")).explainReadWrite(data, request);
    case "checkNoteConflicts":
      return (await import("@/lib/inspector-ai.functions.server")).checkNoteConflicts(data, request);
    case "analyzeSiteNote":
      return (await import("@/lib/inspector-ai.functions.server")).analyzeSiteNote(data, request);
    case "chatAboutCorrection":
      return (await import("@/lib/inspector-ai.functions.server")).chatAboutCorrection(data, request);
    case "loadInspectorNotes":
      return (await import("@/lib/inspector-notes.functions.server")).loadInspectorNotes(data, request);
    case "listInspectorPositionNotes":
      return (await import("@/lib/inspector-notes.functions.server")).listInspectorPositionNotes(data, request);
    case "unlinkInspectorPositionNote":
      return (await import("@/lib/inspector-notes.functions.server")).unlinkInspectorPositionNote(data, request);
    case "deleteInspectorNote":
      return (await import("@/lib/inspector-notes.functions.server")).deleteInspectorNote(data, request);
    case "reorderInspectorPositionNotes":
      return (await import("@/lib/inspector-notes.functions.server")).reorderInspectorPositionNotes(data, request);
    case "loadAllInspectorNotes":
      return (await import("@/lib/inspector-notes.functions.server")).loadAllInspectorNotes(data, request);
    case "searchInspectorNotes":
      return (await import("@/lib/inspector-notes.functions.server")).searchInspectorNotes(data, request);
    case "saveInspectorNote":
      return (await import("@/lib/inspector-notes.functions.server")).saveInspectorNote(data, request);
    case "updateBoundInspectorNote":
      return (await import("@/lib/inspector-notes.functions.server")).updateBoundInspectorNote(data, request);
    case "selectInspectorNote":
      return (await import("@/lib/inspector-notes.functions.server")).selectInspectorNote(data, request);
    case "submitNoteCorrection":
      return (await import("@/lib/inspector-notes.functions.server")).submitNoteCorrection(data, request);
    case "duplicateInspectorNoteVersion":
      return (await import("@/lib/inspector-notes.functions.server")).duplicateInspectorNoteVersion(data, request);
    default:
      throw new Response("Unknown server action", { status: 404 });
  }
}
