import { createFileRoute } from "@tanstack/react-router";
import ArticlePost from "@/pages/ArticlePost";

export const Route = createFileRoute("/articles/$id")({
  component: ArticlePost,
});
