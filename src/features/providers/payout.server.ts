import { z } from "zod";

/** Write only the live caller's Dokan store, using the already-supported store endpoint. */
export async function saveOwnPayout(raw: unknown, request: Request) {
  const payment = z.object({
    paypal: z.object({ email: z.string() }).optional(),
    bank: z.record(z.string()).optional(),
  }).parse(raw);
  const token = request.headers.get("X-WP-Token");
  if (!token) throw new Response("Please sign in", { status: 401 });
  const base = "https://app.challenged-dementia.com/afresh/wp-json";
  const identityResponse = await fetch(`${base}/wp/v2/users/me?context=edit`, { headers: { Authorization: `Bearer ${token}` } });
  if (!identityResponse.ok) throw new Response("Session could not be verified", { status: 401 });
  const identity = await identityResponse.json() as { id?: number };
  if (!identity.id) throw new Response("Session could not be verified", { status: 401 });
  const admin = process.env["WP_ADMIN_USER"];
  const password = process.env["WP_ADMIN_APP_PASSWORD"];
  if (!admin || !password) throw new Response("Payout service is unavailable", { status: 503 });
  const response = await fetch(`${base}/dokan/v1/stores/${identity.id}`, {
    method: "PUT",
    headers: { Authorization: `Basic ${btoa(`${admin}:${password}`)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ payment }),
  });
  if (!response.ok) {
    const details = await response.text();
    console.error(`Payout save failed [${response.status}]: ${details}`);
    throw new Error(`Payout save failed [${response.status}]: ${details}`);
  }
  const saved = await response.json() as { payment?: typeof payment };
  return saved.payment ?? payment;
}