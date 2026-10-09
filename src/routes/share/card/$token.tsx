import { createFileRoute } from "@tanstack/react-router";
import SharedInformationCard from "@/pages/SharedInformationCard";

export const Route = createFileRoute("/share/card/$token")({
  component: SharedInformationCard,
});
