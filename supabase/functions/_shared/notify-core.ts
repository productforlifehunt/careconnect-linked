/**
 * Unified notification core — ONE dispatcher per app.
 *
 * Every outbound message for an app (in-app inbox row, web push, email, SMS)
 * goes through exactly one edge function (`challenged-notify` / `carecnc-notify`)
 * so there is a single place to audit, and no channel can double-send.
 *
 * Backend of record is WordPress (JetEngine CCTs), reached through the same
 * public REST API the frontend uses. The caller's WP JWT is forwarded.
 *
 *   CCT 185 users_notification   in-app inbox  (a55 type, a56 title, a57 body,
 *                                              a58 action url, a59 read, a60 app)
 *   Rel 188  user -> notification
 *   CCT 186 users_notif_token    push tokens   (a55 endpoint, a56 provider,
 *                                              a58 auth, a59 p256dh, a60 active, a61 app)
 *   Rel 189  user -> token
 *   CCT 151 users_extended_prof  a95 challenged / a96 carecnc general settings JSON
 */

export const WP_BASE = "https://app.challenged-dementia.com/afresh";

export type AppKey = "challenged" | "carecnc";

/** a60 on CCT 185 / a61 on CCT 186 */
const APP_CODE: Record<AppKey, string> = { challenged: "b59", carecnc: "b60" };
/** a95 / a96 on CCT 151 */
const SETTINGS_FIELD: Record<AppKey, string> = { challenged: "a95", carecnc: "a96" };

const NOTIFICATION_SLUG = "users_notification";
const TOKEN_SLUG = "users_notif_token";
const PROFILE1_SLUG = "users_extended_prof";
const REL_USER_NOTIFICATION = 188;
const REL_USER_TOKEN = 189;

const YES = "b55";

/** Notification categories = CCT 185 a55 radio codes. */
/** Semantic event type → the mute category the user sees in Settings. */
export const MUTE_CATEGORY: Record<string, string> = {
  chat: "chat",
  message: "chat",
  booking: "booking",
  location: "location",
  safe_zone: "location",
  safe_zone_breach: "location",
  location_alert: "location",
  location_request: "location",
  emergency_location_request: "location",
  sos_emergency: "location",
  check_in: "check_in",
  checkin: "check_in",
  medicine: "medicine",
  task: "system",
  job: "system",
  community: "system",
  system: "system",
};

export const TYPE_CODE: Record<string, string> = {
  chat: "b55",
  message: "b55",
  booking: "b56",
  system: "b57",
  location: "b58",
  safe_zone: "b58",
  safe_zone_breach: "b58",
  location_alert: "b58",
  location_request: "b58",
  emergency_location_request: "b58",
  sos_emergency: "b58",
  check_in: "b59",
  checkin: "b59",
  medicine: "b60",
};

export interface NotifyRequest {
  /** WP user id of the recipient */
  user_id: string | number;
  /** semantic category — mapped to the CCT radio code */
  type: string;
  title: string;
  message: string;
  /** in-app route, e.g. "/bookings?id=12" */
  action_url?: string | null;
  /** recipient email; required only when the email channel should fire */
  email?: string | null;
  /** recipient phone in E.164; required only for SMS */
  phone?: string | null;
  /** channel opt-in from the caller. Defaults: inbox on, push on, email/sms off. */
  channels?: { inbox?: boolean; push?: boolean; email?: boolean; sms?: boolean };
  /** de-dupe key: identical key within 60s is dropped */
  idempotency_key?: string;
}

export interface ChannelResult {
  inbox: "sent" | "skipped" | "failed";
  push: "sent" | "skipped" | "failed" | "no_token";
  email: "sent" | "skipped" | "failed" | "not_configured";
  sms: "sent" | "skipped" | "failed" | "not_configured";
  notification_id?: string;
  reason?: string;
}

/* ── de-dupe (per isolate, 60s window) ─────────────────────────── */
const recent = new Map<string, number>();
function isDuplicate(key: string): boolean {
  const now = Date.now();
  for (const [k, t] of recent) if (now - t > 60_000) recent.delete(k);
  if (recent.has(key)) return true;
  recent.set(key, now);
  return false;
}

/* ── WP REST helpers ───────────────────────────────────────────── */
async function wp(
  path: string,
  token: string | null,
  init: { method?: string; body?: unknown; params?: Record<string, string | number> } = {},
): Promise<any> {
  const url = new URL(`${WP_BASE}/wp-json/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(init.params ?? {})) url.searchParams.set(k, String(v));

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method: init.method ?? "GET",
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`WP ${path} ${res.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/* ── preferences ───────────────────────────────────────────────── */
export interface Prefs {
  push: boolean;
  email: boolean;
  sms: boolean;
  /** per-category mutes from the general settings blob */
  muted: string[];
  /** local "do not disturb" window; inbox is never suppressed by it */
  quiet?: { enabled: boolean; from: string; to: string };
}

export async function loadPrefs(app: AppKey, userId: string | number, token: string | null): Promise<Prefs> {
  const prefs: Prefs = { push: true, email: true, sms: false, muted: [] };
  try {
    const rows = await wp(`jet-cct/${PROFILE1_SLUG}`, token, {
      params: { cct_author_id: String(userId), _limit: 1 },
    });
    const row = Array.isArray(rows) ? rows[0] : null;
    const raw = row?.[SETTINGS_FIELD[app]];
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const n = parsed?.notifications ?? {};
      if (typeof n.push === "boolean") prefs.push = n.push;
      if (typeof n.email === "boolean") prefs.email = n.email;
      if (typeof n.sms === "boolean") prefs.sms = n.sms;
      if (Array.isArray(n.muted_types)) prefs.muted = n.muted_types.map(String);
      if (n.quiet_hours && typeof n.quiet_hours === "object") {
        prefs.quiet = {
          enabled: !!n.quiet_hours.enabled,
          from: String(n.quiet_hours.from ?? "22:00"),
          to: String(n.quiet_hours.to ?? "07:00"),
        };
      }
    }
  } catch { /* malformed blob → defaults */ }

  return prefs;
}

/* ── channels ──────────────────────────────────────────────────── */
async function writeInbox(app: AppKey, req: NotifyRequest, token: string | null): Promise<string | null> {
  const created = await wp(`jet-cct/${NOTIFICATION_SLUG}`, token, {
    method: "POST",
    body: {
      a55: TYPE_CODE[req.type] ?? TYPE_CODE.system,
      a56: req.title,
      a57: req.message,
      a58: req.action_url ?? "",
      a59: "b56", // unread
      a60: APP_CODE[app],
    },
  });
  const id = created?.item_id ?? created?._ID ?? created?.id;
  if (!id) return null;
  try {
    await wp(`jet-rel/${REL_USER_NOTIFICATION}`, token, {
      method: "POST",
      body: {
        parent_id: String(req.user_id),
        child_id: String(id),
        context: "child_object",
        store_items_type: "update",
      },
    });
  } catch { /* row still exists; relation retry is not worth a failed send */ }
  return String(id);
}

async function sendWebPush(app: AppKey, req: NotifyRequest, token: string | null): Promise<ChannelResult["push"]> {
  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");

  let tokens: any[] = [];
  try {
    const rows = await wp(`jet-rel/${REL_USER_TOKEN}/parent/${req.user_id}`, token);
    tokens = (Array.isArray(rows) ? rows : []).filter(
      (t) => String(t.a61) === APP_CODE[app] && String(t.a60) === YES,
    );
  } catch {
    return "no_token";
  }
  if (tokens.length === 0) return "no_token";
  if (!vapidPublic || !vapidPrivate) return "not_configured" as ChannelResult["push"] as any;

  let ok = 0;
  for (const t of tokens) {
    try {
      const { default: webpush } = await import("npm:web-push@3.6.7");
      webpush.setVapidDetails(
        Deno.env.get("VAPID_SUBJECT") ?? "mailto:notifications@challenged-dementia.com",
        vapidPublic,
        vapidPrivate,
      );
      await webpush.sendNotification(
        { endpoint: t.a55, keys: { auth: t.a58, p256dh: t.a59 } },
        JSON.stringify({ title: req.title, body: req.message, url: req.action_url ?? "/notifications" }),
      );
      ok++;
    } catch { /* dead endpoint — ignore */ }
  }
  return ok > 0 ? "sent" : "failed";
}

/**
 * Email via SMTP. Credentials are read from secrets; when they are absent the
 * channel reports `not_configured` instead of failing the whole dispatch, so
 * the provider can be chosen later without touching this code.
 */
async function sendEmail(app: AppKey, req: NotifyRequest): Promise<ChannelResult["email"]> {
  const host = Deno.env.get("SMTP_HOST");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASSWORD");
  const from =
    Deno.env.get("SMTP_FROM") ??
    (app === "challenged" ? "ChallengeD <no-reply@challenged-dementia.com>" : "CareCNC <no-reply@challenged-dementia.com>");
  if (!host || !user || !pass || !req.email) return "not_configured";

  try {
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: Number(Deno.env.get("SMTP_PORT") ?? 465),
        tls: (Deno.env.get("SMTP_SECURE") ?? "true") !== "false",
        auth: { username: user, password: pass },
      },
    });
    await client.send({
      from,
      to: req.email,
      subject: req.title,
      content: req.message,
      html: `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6">
        <h2 style="margin:0 0 12px;font-size:18px">${escapeHtml(req.title)}</h2>
        <p style="margin:0 0 16px;white-space:pre-wrap">${escapeHtml(req.message)}</p>
        ${req.action_url ? `<p><a href="${WP_BASE}${req.action_url}">Open in app</a></p>` : ""}
      </div>`,
    });
    await client.close();
    return "sent";
  } catch {
    return "failed";
  }
}

/** SMS placeholder — wired the same way as email, provider chosen via secrets. */
async function sendSms(req: NotifyRequest): Promise<ChannelResult["sms"]> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");
  if (!sid || !authToken || !fromNumber || !req.phone) return "not_configured";
  try {
    const body = new URLSearchParams({
      To: req.phone,
      From: fromNumber,
      Body: `${req.title}\n${req.message}`,
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map((n) => Number(n) || 0);
  return h * 60 + m;
};

/** True when "now" falls inside the user's quiet window (wraps past midnight). */
function inQuietHours(quiet: Prefs["quiet"]): boolean {
  if (!quiet?.enabled) return false;
  const now = new Date();
  const cur = now.getUTCHours() * 60 + now.getUTCMinutes();
  const from = minutes(quiet.from);
  const to = minutes(quiet.to);
  return from <= to ? cur >= from && cur < to : cur >= from || cur < to;
}

/** Dispatch one notification across every channel the recipient allows. */
export async function dispatch(app: AppKey, req: NotifyRequest, token: string | null): Promise<ChannelResult> {
  const result: ChannelResult = { inbox: "skipped", push: "skipped", email: "skipped", sms: "skipped" };

  const key = req.idempotency_key ?? `${app}:${req.user_id}:${req.type}:${req.title}:${req.message}`;
  if (isDuplicate(key)) {
    result.reason = "duplicate";
    return result;
  }

  const prefs = await loadPrefs(app, req.user_id, token);
  const category = MUTE_CATEGORY[req.type] ?? "system";
  if (prefs.muted.includes(req.type) || prefs.muted.includes(category)) {
    result.reason = "category_muted";
    return result;
  }

  const want = { inbox: true, push: true, email: false, sms: false, ...(req.channels ?? {}) };

  // Quiet hours silence the noisy channels only; a wandering alert always rings.
  const urgent = MUTE_CATEGORY[req.type] === "location";
  if (!urgent && inQuietHours(prefs.quiet)) {
    want.push = false;
    want.sms = false;
    result.reason = "quiet_hours";
  }

  if (want.inbox) {
    try {
      const id = await writeInbox(app, req, token);
      result.inbox = id ? "sent" : "failed";
      if (id) result.notification_id = id;
    } catch {
      result.inbox = "failed";
    }
  }
  if (want.push && prefs.push) result.push = await sendWebPush(app, req, token);
  if (want.email && prefs.email) result.email = await sendEmail(app, req);
  if (want.sms && prefs.sms) result.sms = await sendSms(req);

  return result;
}
