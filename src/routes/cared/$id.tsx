import { createFileRoute } from "@tanstack/react-router";
import ChallengedArticleDetail from "@/pages/ChallengedArticleDetail";

export const Route = createFileRoute("/cared/$id")({
  component: ChallengedArticleDetail,
});
