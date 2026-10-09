import { createFileRoute } from "@tanstack/react-router";
import DeleteAfterRead from "@/pages/DeleteAfterRead";

export const Route = createFileRoute("/delete-after-read")({
  component: DeleteAfterRead,
});
