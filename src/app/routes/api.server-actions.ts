import type { ActionFunctionArgs } from "react-router";
import { runServerAction } from "@/lib/server-actions.server";

export async function action({ request }: ActionFunctionArgs) {
  const headers = { "Cache-Control": "private, no-store" };
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400, headers });
  }
  if (!payload || typeof payload !== "object" || !("name" in payload) || typeof payload.name !== "string") {
    return Response.json({ error: "Invalid request" }, { status: 400, headers });
  }
  try {
    const result = await runServerAction(payload.name, "data" in payload ? payload.data : undefined, request);
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500, headers },
    );
  }
}
