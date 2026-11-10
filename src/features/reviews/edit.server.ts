import { z } from "zod";
import { T } from "@/integrations/wp-schema";
import { isPostAuthor } from "@/features/posts/ownership";

/** Verify WordPress identity and saved CCT authorship; provider membership is not ownership. */
export async function editOwnReview(raw: unknown, request: Request) {
  const data = z.object({ id: z.string().regex(/^\d+$/), rating: z.number().int().min(1).max(5), content: z.string() }).parse(raw);
  const token = request.headers.get("X-WP-Token");
  if (!token) throw new Response("Please sign in", { status: 401 });
  const base = "https://app.challenged-dementia.com/afresh/wp-json";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [identityResponse, reviewResponse] = await Promise.all([
    fetch(`${base}/wp/v2/users/me?context=edit`, { headers }),
    fetch(`${base}/jet-cct/${T.review.slug}/${data.id}`, { headers }),
  ]);
  if (!identityResponse.ok) throw new Response("Session could not be verified", { status: 401 });
  if (!reviewResponse.ok) throw new Response("Review could not be read", { status: reviewResponse.status });
  const identity = await identityResponse.json() as { id?: number };
  const review = await reviewResponse.json() as { cct_author_id?: unknown };
  if (!isPostAuthor(review.cct_author_id, identity.id)) throw new Response("Only the writer can edit this review", { status: 403 });
  const response = await fetch(`${base}/jet-cct/${T.review.slug}/${data.id}`, {
    method: "PUT", headers,
    body: JSON.stringify({ [T.review.f.CONTENT]: data.content, [T.review.f.RATING]: String(data.rating) }),
  });
  if (!response.ok) throw new Response("Review could not be updated", { status: response.status });
  return { success: true };
}