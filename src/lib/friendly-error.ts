/**
 * Plain-language messages for older caregivers.
 *
 * Nobody using this app is a programmer. Any technical text that leaks out of a
 * failed request (HTTP codes, "Failed to fetch", REST error slugs, stack
 * traces, JSON blobs, context/provider errors) gets replaced with a sentence a
 * 70-year-old caregiver can act on.
 */
import i18n from "i18next";

const isZh = () => (i18n.language || "").startsWith("zh");

type Kind =
  | "offline"
  | "signedOut"
  | "noPermission"
  | "notFound"
  | "server"
  | "tooMany"
  | "timeout"
  | "invalid"
  | "unknown";

const TEXT: Record<Kind, { zh: string; en: string }> = {
  offline: {
    zh: "网络好像断开了。请检查手机或电脑的网络，然后再试一次。",
    en: "The internet connection seems to be down. Please check your network and try again.",
  },
  signedOut: {
    zh: "您已经退出登录了。请重新登录后再继续。",
    en: "You have been signed out. Please sign in again to continue.",
  },
  noPermission: {
    zh: "这一项您暂时没有权限查看或修改。如果需要，请让护理小组的管理员开通。",
    en: "You don't have permission for this. Ask the care group organiser to give you access.",
  },
  notFound: {
    zh: "没有找到这条内容，可能已经被删除了。",
    en: "We couldn't find this item — it may have been removed.",
  },
  server: {
    zh: "系统暂时忙不过来，请稍等一会儿再试。您填写的内容没有丢。",
    en: "The system is having trouble right now. Please wait a moment and try again — nothing you typed is lost.",
  },
  tooMany: {
    zh: "操作太频繁了，请休息一分钟再试。",
    en: "That was a bit too fast. Please wait a minute and try again.",
  },
  timeout: {
    zh: "等待时间太长了，请再试一次。",
    en: "That took too long. Please try again.",
  },
  invalid: {
    zh: "有些信息填得不完整或格式不对，请检查后再保存。",
    en: "Some details are missing or don't look right. Please check them and save again.",
  },
  unknown: {
    zh: "刚才没有成功，请再试一次。如果一直不行，请稍后再来。",
    en: "That didn't work. Please try again, and come back a little later if it keeps failing.",
  },
};

const say = (kind: Kind) => (isZh() ? TEXT[kind].zh : TEXT[kind].en);

/** Patterns that mean "this text is for developers, not for people". */
const TECHNICAL = [
  /\b(fetch|network(request)?|networkerror|err_|econn|enotfound|dns)\b/i,
  /\b(undefined|null|nan|typeerror|referenceerror|syntaxerror|json|parse)\b/i,
  /\b(provider|context|hook|render|component|props|useauth|usecontext)\b/i,
  /\b(rest_|wp_|jetengine|supabase|postgres|sql|cct|api|endpoint|payload|token|cors)\b/i,
  /\b(http|status|code)\s*[:=]?\s*\d{3}\b/i,
  /\b\d{3}\s*(bad request|unauthorized|forbidden|not found|error)\b/i,
  /[{}[\]<>]|\bat\s+\w+\s*\(/,
];

function classify(raw: string): Kind | null {
  const t = raw.toLowerCase();
  if (/failed to fetch|networkerror|offline|err_internet|err_network|econnrefused|dns/.test(t)) return "offline";
  if (/\b401\b|unauthorized|invalid token|jwt|not logged in|session expired|useauth/.test(t)) return "signedOut";
  if (/\b403\b|forbidden|not allowed|permission|rest_forbidden/.test(t)) return "noPermission";
  if (/\b404\b|not found|rest_no_route|does not exist/.test(t)) return "notFound";
  if (/\b429\b|rate limit|too many/.test(t)) return "tooMany";
  if (/timeout|timed out|aborted/.test(t)) return "timeout";
  if (/\b4\d\d\b|invalid|required|missing|validation|bad request/.test(t)) return "invalid";
  if (/\b5\d\d\b|server error|internal|gateway|unavailable/.test(t)) return "server";
  return null;
}

/** True when the text reads like developer output. */
export function isTechnical(text: string): boolean {
  return TECHNICAL.some((re) => re.test(text));
}

/**
 * Turn anything (Error, string, unknown) into a sentence a caregiver can read.
 * Human-written messages are left alone.
 */
export function friendlyMessage(input: unknown): string {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof Error
        ? input.message
        : typeof (input as any)?.message === "string"
          ? (input as any).message
          : "";
  const text = raw.trim();
  if (!text) return say("unknown");

  const kind = classify(text);
  if (kind) return say(kind);
  if (isTechnical(text) || text.length > 180) return say("unknown");
  return text;
}

/** Same, but only rewrites strings; other React nodes pass through untouched. */
export function friendlyNode<T>(value: T): T | string {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return value;
  const kind = classify(text);
  if (kind) return say(kind);
  if (isTechnical(text) || text.length > 180) return say("unknown");
  return value;
}

/** Generic heading for an error screen. */
export function friendlyErrorTitle(): string {
  return isZh() ? "刚才出了点小问题" : "Something didn't work";
}

export function friendlyRetryLabel(): string {
  return isZh() ? "重新加载" : "Try again";
}
