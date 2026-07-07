/**
 * Notch Note — Independent WP auth (separate token key from CareCNC/ChallengeD).
 * Uses Simple JWT Login plugin, same WP endpoint, own storage keys.
 */
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";

const TOKEN_KEY = "nn_wp_token";
const USER_KEY = "nn_wp_user";

export interface NNUser {
  user_id: number;
  user_email: string;
  user_login: string;
  user_display_name: string;
}

export function getNNToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getNNUser(): NNUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as NNUser) : null;
}

export function clearNNSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const norm = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = norm.padEnd(Math.ceil(norm.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export async function nnLogin(emailOrUsername: string, password: string): Promise<NNUser> {
  const url = buildWPUrl("simple-jwt-login/v1/auth", {});
  const isEmail = emailOrUsername.includes("@");
  const body: Record<string, string> = { password };
  if (isEmail) body.email = emailOrUsername;
  else body.username = emailOrUsername;
  const res = await fetch(url, {
    method: "POST",
    headers: buildWPHeaders(null, "application/json"),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Login failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const token: string = data?.data?.jwt || data?.jwt || data?.token;
  if (!token) throw new Error("No token in login response");
  const payload = decodeJwt(token) || {};
  const d = payload.data ?? payload;
  const user: NNUser = {
    user_id: Number(d.user_id ?? payload.id ?? 0),
    user_email: String(d.user_email ?? payload.email ?? emailOrUsername),
    user_login: String(d.user_login ?? payload.username ?? emailOrUsername),
    user_display_name: String(d.user_display_name ?? payload.username ?? emailOrUsername),
  };
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function nnRegister(
  email: string,
  password: string,
  displayName?: string
): Promise<NNUser> {
  const url = buildWPUrl("simple-jwt-login/v1/users", {});
  const res = await fetch(url, {
    method: "POST",
    headers: buildWPHeaders(null, "application/json"),
    body: JSON.stringify({
      email,
      password,
      user_login: email,
      display_name: displayName || email.split("@")[0],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Signup failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return nnLogin(email, password);
}
