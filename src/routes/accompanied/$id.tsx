import { createFileRoute } from "@tanstack/react-router";
import ChallengedArticleDetail from "@/pages/ChallengedArticleDetail";

export const Route = createFileRoute("/accompanied/$id")({
  component: ChallengedArticleDetail,
});
