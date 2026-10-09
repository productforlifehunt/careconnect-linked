import { createFileRoute } from "@tanstack/react-router";
import JoinGroup from "@/pages/JoinGroup";

export const Route = createFileRoute("/join/$code")({
  component: JoinGroup,
});
