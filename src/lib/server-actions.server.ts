export async function runServerAction(name: string, data: unknown, request: Request): Promise<unknown> {
  switch (name) {
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
    case "loadAllInspectorNotes":
      return (await import("@/lib/inspector-notes.functions.server")).loadAllInspectorNotes(data, request);
    case "searchInspectorNotes":
      return (await import("@/lib/inspector-notes.functions.server")).searchInspectorNotes(data, request);
    case "saveInspectorNote":
      return (await import("@/lib/inspector-notes.functions.server")).saveInspectorNote(data, request);
    case "selectInspectorNote":
      return (await import("@/lib/inspector-notes.functions.server")).selectInspectorNote(data, request);
    case "submitNoteCorrection":
      return (await import("@/lib/inspector-notes.functions.server")).submitNoteCorrection(data, request);
    case "listRelatedNotes":
      return (await import("@/lib/inspector-notes.functions.server")).listRelatedNotes(data, request);
    case "linkRelatedNote":
      return (await import("@/lib/inspector-notes.functions.server")).linkRelatedNote(data, request);
    case "unlinkRelatedNote":
      return (await import("@/lib/inspector-notes.functions.server")).unlinkRelatedNote(data, request);
    case "updateRelatedNote":
      return (await import("@/lib/inspector-notes.functions.server")).updateRelatedNote(data, request);
    case "duplicateInspectorNoteVersion":
      return (await import("@/lib/inspector-notes.functions.server")).duplicateInspectorNoteVersion(data, request);
    default:
      throw new Response("Unknown server action", { status: 404 });
  }
}
