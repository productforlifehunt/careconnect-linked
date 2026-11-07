
import { redirect } from "react-router";
export function loader({ params, request }: { params: Record<string, string | undefined>; request: Request }) {
  const id = String(params["groupId"] || "").replace(/\D/g, "");
  const search = new URL(request.url).search;
  return redirect(id ? `/care-circle/${id}${search}` : "/care-circle");
}
