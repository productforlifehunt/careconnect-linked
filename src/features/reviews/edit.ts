import { invokeServerAction } from "@/lib/server-action-client";

export function editOwnReview(data: { id: string; rating: number; content: string }) {
  return invokeServerAction("editOwnReview", data);
}