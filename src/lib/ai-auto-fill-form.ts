/**
 * AI AUTO-FILL FORM — the ONE hidden form every AI-driven record goes through.
 *
 * There is a single generic form (this registry). Each "intent" is one row in it
 * and declares: the wording, the allowed outcomes, when the exchange is
 * finished, which existing feature function performs the real database write,
 * and which cached lists refresh afterwards.
 *
 * The AI never writes and never calls a tool. It only returns
 * {done, status, summary}. The confirm / skip buttons are plain front-end UI in
 * src/components/ai/AICompanionChat.tsx, and the single shared entry point is
 * openWriteAssistant() in src/contexts/AIAssistantContext.tsx.
 *
 * READ context (permissions, facts sent to the AI) lives separately in
 * src/lib/ai-dynamic-knowledge.ts. Reads and writes are deliberately kept in
 * two files: one is about what may be shown, this one is about what may be saved.
 */

import {
  buildCheckInContext,
  buildMedicineDoseContext,
  buildMedicineDoseStarter,
} from "../../supabase/functions/_shared/ai-prompts";

type Lang = { isChinese: boolean };

const Z = (isChinese: boolean, zh: string, en: string) => (isChinese ? zh : en);

// ─────────────────────────── Write layer (single source) ────────────────────
/**
 * WRITE SPECS — the one place that says, for each AI-driven record:
 *   • which outcomes are allowed,
 *   • when the AI should consider the exchange finished,
 *   • which existing feature function performs the database write.
 *
 * The AI still writes nothing. It only returns {done, status, summary}; the
 * front end asks for the spec by intent and calls spec.write(). Change a data
 * structure, a status list, or a write rule here and every AI surface follows —
 * no prompt edits, no component edits.
 */
export type WriteIntent = "medicine-dose" | "check-in" | "care-tip";

export interface WriteTarget {
  caredOneId?: string;
  /** Medicine record id (medicine-dose) or check-in record id (check-in). */
  recordId?: string;
  /** Human label used in the rule text, e.g. the medicine or check-in name. */
  label?: string;
  /** Extra plain-language detail, e.g. "Aricept · 5mg · 08:00" or check-in instructions. */
  detail?: string;
}

export interface WriteSpec {
  intent: WriteIntent;
  /** Dialog title shown above the conversation. */
  title: string;
  /** Full context text handed to the AI (scene + finish rule). */
  contextPrompt: string;
  /** First instruction that makes the assistant open the conversation. */
  starterPrompt: string;
  /** Shown if the model is unreachable. */
  starterFallback: string;
  /** Toast text after a successful write, by outcome. */
  toastFor: (status?: string) => string;
  /** Allowed outcomes; the first one is the default when the AI omits status. */
  statuses: string[];
  /** The rule sentence appended to the context so the AI knows when to finish. */
  rule: string;
  /** Performs the real write through the feature layer the manual forms use. */
  write: (result: { status?: string; summary?: string }) => Promise<void>;
  /** Cached lists that must refresh after the write. */
  invalidateKeys: string[][];
}

const asStatus = (spec: string[], status?: string) =>
  status && spec.includes(status) ? status : spec[0];

export function resolveWriteSpec(
  intent: WriteIntent,
  target: WriteTarget,
  { isChinese }: Lang
): WriteSpec {
  const name = target.label || "";

  if (intent === "medicine-dose") {
    const statuses = ["taken", "skipped", "no-response"];
    const dose = target.detail || name;
    const rule = Z(
        isChinese,
        `这是${name || "这次"}用药的记录对话。确认服用、跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"taken|skipped|no-response","summary":"一两句说明"}。不要询问剂量以外的医疗判断。`,
        `This exchange records the ${name || "current"} dose. When it is confirmed taken, skipped, or the person never responds, return JSON: {"done":true,"status":"taken|skipped|no-response","summary":"one or two sentences"}. Do not give medical judgement beyond the dose.`
    );
    return {
      intent,
      statuses,
      rule,
      title: Z(isChinese, "用药提醒", "Medicine reminder"),
      contextPrompt: [buildMedicineDoseContext(dose, isChinese), rule].join("\n\n"),
      starterPrompt: buildMedicineDoseStarter(dose, isChinese),
      starterFallback: Z(
        isChinese,
        `到了 ${name} 的用药时间。已经服用了吗？`,
        `It is time for ${name}. Has this dose been taken?`
      ),
      toastFor: (status) =>
        asStatus(statuses, status) === "taken"
          ? Z(isChinese, `${name} 已记录服用`, `${name} recorded as taken`)
          : Z(isChinese, `${name} 已跳过`, `${name} skipped`),
      write: async ({ status, summary }) => {
        const { logMedicineWordPress } = await import("@/features/medicine/source.medicine");
        await logMedicineWordPress({
          medicine_id: String(target.recordId),
          status: asStatus(statuses, status) === "taken" ? "taken" : "skipped",
          note: summary || undefined,
          user_id: target.caredOneId,
        } as any);
      },
      invalidateKeys: [["medicineLogs"], ["todayMedicineLogs"]],
    };
  }

  if (intent === "check-in") {
    const statuses = ["checked", "skipped", "no-response"];
    const rule = Z(
        isChinese,
        `这是${name || "本次"}签到对话。签到完成、对方选择跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"checked|skipped|no-response","summary":"把问到的情况写成一两句"}。`,
        `This exchange is the ${name || "current"} check-in. When it is completed, skipped, or the person never responds, return JSON: {"done":true,"status":"checked|skipped|no-response","summary":"one or two sentences of what was reported"}.`
    );
    return {
      intent,
      statuses,
      rule,
      title: Z(isChinese, "AI 签到", "AI Check-In"),
      contextPrompt: [
        buildCheckInContext(
          name || Z(isChinese, "签到", "Check-In"),
          target.detail || "",
          Z(isChinese, "被护理者", "the cared one"),
          isChinese
        ),
        rule,
      ].join("\n\n"),
      starterPrompt: Z(isChinese, "现在请开始签到。", "Please start the check-in now."),
      starterFallback: Z(
        isChinese,
        "你好，到了签到时间。今天感觉怎么样？",
        "Hi, it is check-in time. How are you today?"
      ),
      toastFor: () => Z(isChinese, "AI 签到已保存", "AI check-in saved"),
      write: async ({ status, summary }) => {
        const { logCheckinWordPress } = await import("@/features/cared-ones/source.wordpress-extended");
        const s = asStatus(statuses, status);
        await logCheckinWordPress({
          checkin_id: String(target.recordId),
          status: s === "checked" ? "checked" : s === "skipped" ? "skipped" : "missed",
          note: summary || "",
          checked_by_ai: true,
          cared_one_id: target.caredOneId,
          checkin_name: name || undefined,
        });
      },
      invalidateKeys: [["checkinLogs"], ["todayCheckinLogs"]],
    };
  }

  const statuses = ["saved", "discarded"];
  const tipRule = Z(
      isChinese,
      `当用户想把一条护理小贴士存下来时，返回 JSON：{"done":true,"status":"saved","summary":"小贴士正文"}；用户改主意就用 status "discarded"。`,
      `When the user wants a care tip saved, return JSON: {"done":true,"status":"saved","summary":"the tip text"}; use status "discarded" if they change their mind.`
  );
  return {
    intent: "care-tip",
    statuses,
    rule: tipRule,
    title: Z(isChinese, "护理小贴士", "Care tip"),
    contextPrompt: tipRule,
    starterPrompt: Z(isChinese, "请帮我把这条护理小贴士整理好。", "Help me word this care tip."),
    starterFallback: Z(isChinese, "想记下哪一条护理小贴士？", "Which care tip would you like to save?"),
    toastFor: (status) =>
      asStatus(statuses, status) === "saved"
        ? Z(isChinese, "小贴士已保存", "Care tip saved")
        : Z(isChinese, "已丢弃", "Discarded"),
    write: async ({ status, summary }) => {
      if (asStatus(statuses, status) !== "saved" || !summary) return;
      const { createCareTipWordPress } = await import("@/features/cared-ones/source.wordpress-extended");
      await createCareTipWordPress({ user_id: String(target.caredOneId), content: summary });
    },
    invalidateKeys: [["careTips"]],
  };
}


// ═══════════════════════════ Settings layer (same registry) ══════════════════
/**
 * APP SETTINGS live in this same file on purpose: settings are just the other
 * kind of "one hidden form". Each setting is one row below and declares its
 * wording, which apps show it, where the value lives (backend blob / this
 * device / an OS permission), how to read it and how to write it.
 *
 * Every entry point — the settings panel, the header theme button, the language
 * menu, the Safety shell — reads and writes through readSetting()/applySetting()
 * here, so one row is the only thing that ever changes.
 *
 * Storage rules:
 *   backend → one JSON blob on JetEngine CCT 151 (a95 ChallengeD / a96 CareCNC)
 *   local   → this device only (localStorage / i18next)
 *   device  → an OS permission; we only record that we asked
 */
import {
  fetchAppSettings,
  saveAppSettings,
  DEFAULT_APP_SETTINGS,
  type AppSettings,
} from "@/features/settings/app-settings";
import { applyDisplaySettings } from "@/features/settings/display";
import { currentAppScope, type AppScope } from "@/features/shared/app-scope";
import { checkPermission, requestPermission, type PermissionKind } from "@/features/settings/permissions";

export type { AppSettings };
export { DEFAULT_APP_SETTINGS, fetchAppSettings };


export type SettingGroupId = "channels" | "categories" | "quiet" | "display" | "language" | "permissions";
export type SettingStorage = "backend" | "local" | "device";
export type SettingKind = "switch" | "choice" | "time" | "permission";

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingSpec<V = any> {
  id: string;
  group: SettingGroupId;
  kind: SettingKind;
  storage: SettingStorage;
  /** "all" = every app on the shared backend. */
  apps: AppScope[] | "all";
  label: (isChinese: boolean) => string;
  hint?: (isChinese: boolean) => string;
  options?: (isChinese: boolean) => SettingOption[];
  /** Current value out of the settings blob. */
  read: (s: AppSettings) => V;
  /** Backend settings: the patch to persist. */
  patch?: (s: AppSettings, value: V) => Partial<AppSettings>;
  /** Local settings: the device-only write. */
  localWrite?: (value: V) => void;
  /** Device permissions: which OS permission this row asks for. */
  permission?: PermissionKind;
  /** Cannot be switched off (safety alerts). */
  locked?: boolean;
}

/* ── languages (shared by the header menu and the settings tab) ───────────── */

export const LANGUAGES = [
  { code: "en", flag: "🇺🇸" },
  { code: "zh-CN", flag: "🇨🇳" },
  { code: "zh-TW", flag: "🇹🇼" },
  { code: "ja", flag: "🇯🇵" },
  { code: "ko", flag: "🇰🇷" },
  { code: "es", flag: "🇪🇸" },
  { code: "fr", flag: "🇫🇷" },
  { code: "de", flag: "🇩🇪" },
  { code: "pt", flag: "🇧🇷" },
  { code: "hi", flag: "🇮🇳" },
  { code: "ar", flag: "🇸🇦" },
  { code: "vi", flag: "🇻🇳" },
  { code: "th", flag: "🇹🇭" },
  { code: "id", flag: "🇮🇩" },
  { code: "tl", flag: "🇵🇭" },
  { code: "ru", flag: "🇷🇺" },
  { code: "it", flag: "🇮🇹" },
] as const;

/* ── the registry ────────────────────────────────────────────────────────── */

const channel = (key: "push" | "email" | "sms", zh: string, en: string, zhHint: string, enHint: string): SettingSpec<boolean> => ({
  id: `channels.${key}`,
  group: "channels",
  kind: "switch",
  storage: "backend",
  apps: "all",
  label: (cn) => Z(cn, zh, en),
  hint: (cn) => Z(cn, zhHint, enHint),
  read: (s) => s.notifications[key],
  patch: (s, value) => ({ notifications: { ...s.notifications, [key]: value } }),
});

const category = (
  key: string,
  zh: string,
  en: string,
  zhHint: string,
  enHint: string,
  opts: { apps?: AppScope[] | "all"; locked?: boolean } = {},
): SettingSpec<boolean> => ({
  id: `categories.${key}`,
  group: "categories",
  kind: "switch",
  storage: "backend",
  apps: opts.apps ?? "all",
  locked: opts.locked,
  label: (cn) => Z(cn, zh, en),
  hint: (cn) => Z(cn, zhHint, enHint),
  read: (s) => !s.notifications.muted_types.includes(key),
  patch: (s, value) => {
    const muted = new Set(s.notifications.muted_types);
    value ? muted.delete(key) : muted.add(key);
    return { notifications: { ...s.notifications, muted_types: [...muted] } };
  },
});

const quietDefaults = { enabled: false, from: "22:00", to: "07:00" };
const quiet = (s: AppSettings) => ({ ...quietDefaults, ...(s.notifications.quiet_hours ?? {}) });

export const SETTING_SPECS: SettingSpec[] = [
  /* how we reach you */
  channel("push", "手机提醒", "Phone alerts", "直接弹在你手机或电脑上", "Pop up on your phone or computer"),
  channel("email", "邮件", "Email", "发到你注册时用的邮箱", "Sent to the email address on your account"),
  channel("sms", "短信", "Text message", "只在紧急情况下发，比如老人走失", "Only for urgent things, such as a loved one going missing"),

  /* what you hear about */
  category("chat", "消息", "Messages", "家人或护理者给你发新消息时", "When family or a caregiver sends you a new message"),
  category("booking", "预约", "Appointments", "预约被接受、确认或取消时", "When an appointment is accepted, confirmed or cancelled"),
  category("check_in", "探望与签到", "Visits and check-ins", "到了该去看看老人、该签到的时候", "Reminders when it is time to visit or check in"),
  category("medicine", "吃药提醒", "Medicine reminders", "到了吃药或日常安排的时间", "When it is time for medicine or a daily routine"),
  category("location", "走失提醒", "Safety alerts", "老人走出安全范围时马上告诉你，这一项不能关", "If your loved one leaves the area you marked as safe — this one cannot be switched off", { locked: true }),
  category("system", "账号消息", "Account messages", "登录、密码和账号安全相关的通知", "Sign-in, password and account safety notices"),

  /* quiet hours */
  {
    id: "quiet.enabled",
    group: "quiet",
    kind: "switch",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "夜里不要打扰我", "Do not disturb at night"),
    hint: (cn) => Z(cn, "走失这类紧急提醒仍然会发。", "Urgent alerts, such as a loved one going missing, still come through."),
    read: (s) => quiet(s).enabled,
    patch: (s, value) => ({ notifications: { ...s.notifications, quiet_hours: { ...quiet(s), enabled: value } } }),
  },
  {
    id: "quiet.from",
    group: "quiet",
    kind: "time",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "从", "From"),
    read: (s) => quiet(s).from,
    patch: (s, value) => ({ notifications: { ...s.notifications, quiet_hours: { ...quiet(s), from: value } } }),
  },
  {
    id: "quiet.to",
    group: "quiet",
    kind: "time",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "到", "Until"),
    read: (s) => quiet(s).to,
    patch: (s, value) => ({ notifications: { ...s.notifications, quiet_hours: { ...quiet(s), to: value } } }),
  },

  /* display */
  {
    id: "display.text_size",
    group: "display",
    kind: "choice",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "字的大小", "Text size"),
    options: (cn) => [
      { value: "default", label: Z(cn, "标准", "Standard") },
      { value: "large", label: Z(cn, "大", "Large") },
      { value: "xlarge", label: Z(cn, "特大", "Extra large") },
    ],
    read: (s) => s.display.text_size,
    patch: (s, value) => ({ display: { ...s.display, text_size: value } }),
  },
  {
    id: "display.theme",
    group: "display",
    kind: "choice",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "亮色或暗色", "Light or dark"),
    options: (cn) => [
      { value: "system", label: Z(cn, "跟手机一样", "Match my device") },
      { value: "light", label: Z(cn, "亮色", "Light") },
      { value: "dark", label: Z(cn, "暗色", "Dark") },
    ],
    read: (s) => s.display.theme,
    patch: (s, value) => ({ display: { ...s.display, theme: value } }),
  },
  {
    id: "display.reduce_motion",
    group: "display",
    kind: "switch",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "减少晃动效果", "Reduce movement"),
    hint: (cn) => Z(cn, "关掉画面的滑动和淡入淡出，看着更稳。", "Turns off sliding and fading, which can feel steadier."),
    read: (s) => s.display.reduce_motion,
    patch: (s, value) => ({ display: { ...s.display, reduce_motion: value } }),
  },

  /* language — this device only, so a shared account can be read in two languages */
  {
    id: "language.app",
    group: "language",
    kind: "choice",
    storage: "local",
    apps: "all",
    label: (cn) => Z(cn, "语言", "Language"),
    options: () => LANGUAGES.map((l) => ({ value: l.code, label: `${l.flag} ${l.code}` })),
    read: () => {
      try {
        return localStorage.getItem("i18nextLng") || "en";
      } catch {
        return "en";
      }
    },
    localWrite: (value: string) => {
      try {
        localStorage.setItem("i18nextLng", value);
      } catch {
        /* ignore */
      }
    },
  },

  /* device permissions */
  {
    id: "permissions.push",
    group: "permissions",
    kind: "permission",
    storage: "device",
    apps: "all",
    permission: "push",
    label: (cn) => Z(cn, "手机提醒", "Phone alerts"),
    hint: (cn) => Z(cn, "允许后，即使没打开这个应用也能收到提醒", "Lets us reach you even when the app is closed"),
    read: (s) => !!s.permissions_asked.push,
    patch: (s, value) => ({ permissions_asked: { ...s.permissions_asked, push: value } }),
  },
  {
    id: "permissions.location",
    group: "permissions",
    kind: "permission",
    storage: "device",
    apps: "all",
    permission: "location",
    label: (cn) => Z(cn, "位置", "Location"),
    hint: (cn) => Z(cn, "用来看老人在哪里，以及是否走出安全范围", "Used to show where your loved one is and whether they left the safe area"),
    read: (s) => !!s.permissions_asked.location,
    patch: (s, value) => ({ permissions_asked: { ...s.permissions_asked, location: value } }),
  },
  {
    id: "permissions.calendar",
    group: "permissions",
    kind: "permission",
    storage: "device",
    apps: "all",
    permission: "calendar",
    label: (cn) => Z(cn, "日历", "Calendar"),
    hint: (cn) => Z(cn, "可选：把探望安排一起写进你手机的日历", "Optional: also writes visits into your phone's own calendar"),
    read: (s) => !!s.permissions_asked.calendar,
    patch: (s, value) => ({ permissions_asked: { ...s.permissions_asked, calendar: value } }),
  },
];

/* ── group wording (also one place) ──────────────────────────────────────── */

export const SETTING_GROUPS: {
  id: SettingGroupId;
  title: (isChinese: boolean) => string;
  description: (isChinese: boolean) => string;
}[] = [
  {
    id: "channels",
    title: (cn) => Z(cn, "我们怎么联系你", "How we reach you"),
    description: (cn) => Z(cn, "关掉一项，我们就不会再用这个方式联系你。", "Switch one off and we will stop contacting you that way."),
  },
  {
    id: "categories",
    title: (cn) => Z(cn, "你想收到哪些提醒", "What you want to hear about"),
    description: (cn) => Z(cn, "这里的选择对上面每一种联系方式都有效。", "These choices apply to every way of contacting you above."),
  },
  {
    id: "quiet",
    title: (cn) => Z(cn, "免打扰时段", "Quiet hours"),
    description: (cn) => Z(cn, "这段时间里我们不发一般提醒。", "We hold back everyday reminders during these hours."),
  },
  {
    id: "display",
    title: (cn) => Z(cn, "看得清楚一点", "Making it easier to read"),
    description: (cn) => Z(cn, "这些改动马上生效，只影响你自己的界面。", "These take effect right away and only change what you see."),
  },
  {
    id: "language",
    title: (cn) => Z(cn, "语言", "Language"),
    description: (cn) => Z(cn, "只改这台设备上的显示语言。", "Changes the language on this device only."),
  },
  {
    id: "permissions",
    title: (cn) => Z(cn, "这台设备上的权限", "What this device allows"),
    description: (cn) => Z(cn, "只有你自己点了才会去问，随时可以改。", "We only ask when you tap, and you can change it any time."),
  },
];

/* ── the one read / write API ────────────────────────────────────────────── */

export function settingSpec(id: string): SettingSpec | undefined {
  return SETTING_SPECS.find((s) => s.id === id);
}

export function settingAppliesTo(spec: SettingSpec, scope: AppScope = currentAppScope()): boolean {
  return spec.apps === "all" || spec.apps.includes(scope);
}

/** Every setting of one group that the running app shows. */
export function settingsInGroup(group: SettingGroupId, scope: AppScope = currentAppScope()): SettingSpec[] {
  return SETTING_SPECS.filter((s) => s.group === group && settingAppliesTo(s, scope));
}

export function readSetting<V = any>(id: string, settings: AppSettings = DEFAULT_APP_SETTINGS): V | undefined {
  const spec = settingSpec(id);
  if (!spec) return undefined;
  return spec.read(settings) as V;
}

/**
 * The single write path for every setting, from any entry point.
 * Backend settings go through saveAppSettings (CCT 151 blob, app-scoped field);
 * local settings are written on this device; display changes are applied at once.
 */
export async function applySetting(
  id: string,
  value: any,
  current?: AppSettings,
): Promise<AppSettings> {
  const spec = settingSpec(id);
  if (!spec) throw new Error(`Unknown setting: ${id}`);
  if (spec.locked && value === false) throw new Error(`Setting ${id} cannot be switched off`);

  const base = current ?? (await fetchAppSettings());

  if (spec.storage === "local") {
    spec.localWrite?.(value);
    return base;
  }

  if (!spec.patch) return base;
  const next = await saveAppSettings(spec.patch(base, value));
  applyDisplaySettings(next.display);
  return next;
}

/** Ask the OS for a permission, then record that we asked. */
export async function askPermissionSetting(id: string, current?: AppSettings) {
  const spec = settingSpec(id);
  if (!spec?.permission) throw new Error(`Not a permission setting: ${id}`);
  const state = await requestPermission(spec.permission);
  const settings = await applySetting(id, true, current);
  return { state, settings };
}

export async function permissionStates() {
  const specs = SETTING_SPECS.filter((s) => s.kind === "permission" && settingAppliesTo(s));
  const states = await Promise.all(specs.map((s) => checkPermission(s.permission!)));
  return Object.fromEntries(specs.map((s, i) => [s.id, states[i]])) as Record<string, Awaited<ReturnType<typeof checkPermission>>>;
}

/*
 * No settings-for-AI description lives here on purpose.
 * SETTING_SPECS above is the only settings structure; the AI wording is derived
 * from it inside src/lib/ai-dynamic-knowledge.ts, which is the single place that
 * decides what the AI may read.
 */

