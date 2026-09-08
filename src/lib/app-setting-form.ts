/**
 * APP SETTING FORM — the ONE registry every setting in every app goes through.
 *
 * Same idea as src/lib/ai-auto-fill-form.ts (the single AI write registry):
 * there is exactly ONE generic settings form. Each setting is one row in this
 * file and declares:
 *   • its wording (Chinese / English),
 *   • which apps it appears in (challenged | carecnc | notchsafety-as-challenged | afresh…),
 *   • where the value lives (backend blob, this device only, or an OS permission),
 *   • how to read it and how to write it.
 *
 * Every entry point — the Profile settings tabs, the header theme button, the
 * header language menu, the onboarding nudges — reads and writes through
 * `readSetting()` / `applySetting()` here. No screen persists a setting itself,
 * so a change to a field, a default, or an app scope is a one-file change.
 *
 * Storage rules (single source of truth):
 *   backend → one JSON blob on JetEngine CCT 151 (a95 ChallengeD / a96 CareCNC)
 *             via src/features/settings/app-settings.ts. Anything the server
 *             must obey (notification channels, mutes, quiet hours) lives here.
 *   local   → this device only (localStorage / i18next). Nothing the server needs.
 *   device  → an OS permission; the answer belongs to the phone, we only record
 *             that we asked (permissions_asked in the backend blob).
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

const Z = (isChinese: boolean, zh: string, en: string) => (isChinese ? zh : en);

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

/** Plain-language description of the settings data structure, for the AI context. */
export function describeSettingsForAI(isChinese = false): string {
  const rows = SETTING_SPECS.filter((s) => settingAppliesTo(s)).map(
    (s) => `- ${s.id} (${s.storage}): ${s.label(isChinese)}`,
  );
  return [
    Z(
      isChinese,
      "用户设置都保存在同一处（扩展资料 CCT 151 的应用设置 JSON），下面是可用项：",
      "All user settings live in one place (the app-settings JSON on extended profile CCT 151). Available items:",
    ),
    ...rows,
  ].join("\n");
}
