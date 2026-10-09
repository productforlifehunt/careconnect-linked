import { createFileRoute } from "@tanstack/react-router";
import SharedStudyNote from "@/pages/SharedStudyNote";

export const Route = createFileRoute("/share/note")({
  component: SharedStudyNote,
});
