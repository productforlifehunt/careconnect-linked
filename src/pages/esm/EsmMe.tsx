import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { CheckCircle2, Circle, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDraft, getProfile, getSettings, saveDraft, saveProfile, saveSettings, startProfile, type ParticipantRole, type QuietPeriod } from "@/features/esm/store";
import { otherScreening, primaryScreening } from "@/features/esm/questionnaires";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, localizeQuestionnaire, uiText } from "@/features/esm/i18n";

const answered = (value: unknown) => value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);

export default function EsmMe() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialTab = params.get("tab") === "screening" ? "screening" : "profile";
  const [profile, setProfile] = useState(getProfile());
  const [name, setName] = useState(profile?.name ?? "");
  const [settings, setSettingsState] = useState(getSettings());
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);

  const questionnaire = profile?.role === "other" ? otherScreening : primaryScreening;
  const displayedQuestionnaire = localizeQuestionnaire(questionnaire, zh);
  const draft = getDraft(questionnaire.id);
  const introduction = questionnaire.groups[0];
  const introductionDone = useMemo(
    () => Boolean(introduction) && introduction!.questions.filter((q) => !q.optional).every((q) => answered(draft[q.id])),
    [draft, introduction],
  );

  const chooseRole = (role: ParticipantRole) => {
    const next = startProfile(role);
    setProfile(next);
    setName(next.name ?? "");
  };

  const persistProfile = () => {
    if (!profile) {
      toast.error(uiText(zh, "Choose Primary or Secondary caregiver first.", "请先选择主要护理者或协助护理者。"));
      return;
    }
    const next = { ...profile, name: name.trim() };
    saveProfile(next);
    const nextDraft = { ...getDraft(questionnaire.id), c318_a01: name.trim() };
    saveDraft(questionnaire.id, nextDraft);
    saveSettings(settings);
    setProfile(next);
    toast.success(uiText(zh, "Profile and settings saved.", "个人资料和设置已保存。"));
  };

  const updateQuietPeriod = (id: string, key: "start" | "end", value: string) => {
    setSettingsState((current) => ({
      ...current,
      quietPeriods: current.quietPeriods.map((period) => period.id === id ? { ...period, [key]: value } : period),
    }));
  };

  const addQuietPeriod = () => {
    const period: QuietPeriod = { id: `quiet-${Date.now()}`, start: "12:00", end: "13:00" };
    setSettingsState((current) => ({ ...current, quietPeriods: [...current.quietPeriods, period] }));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
       <h1 className="text-2xl font-semibold text-foreground">{name || uiText(zh, "Me", "我")}</h1>
      <Tabs
        defaultValue={initialTab}
        className="mt-4"
        onValueChange={(tab) => setParams(tab === "screening" ? { tab: "screening" } : {})}
      >
        <TabsList className="grid w-full grid-cols-2">
           <TabsTrigger value="profile">{uiText(zh, "Profile & settings", "个人资料与设置")}</TabsTrigger>
           <TabsTrigger value="screening">{uiText(zh, "Screening questions", "初始问卷")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5 space-y-6">
          <div className="space-y-2">
             <Label htmlFor="esm-name">{uiText(zh, "Name", "姓名")}</Label>
             <Input id="esm-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={uiText(zh, "Your name", "您的姓名")} />
             <p className="text-xs text-muted-foreground">{uiText(zh, "Saved with your screening information.", "姓名会保存在您的初始问卷信息中。")}</p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            <SettingRow
               label={uiText(zh, "Hourly reminders", "每小时提醒")}
               detail={uiText(zh, "Prompt me during the study day", "在研究记录期间提醒我填写")}
              checked={settings.hourlyReminders}
              onCheckedChange={(checked) => setSettingsState((current) => ({ ...current, hourlyReminders: checked }))}
            />
            <div className="space-y-3 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{uiText(zh, "Hourly reminder times", "每小时提醒时段")}</p>
                <p className="text-xs text-muted-foreground">{uiText(zh, "One reminder each hour during this period.", "在此时段内每小时提醒一次。")}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label htmlFor="reminder-start">{uiText(zh, "Start", "开始")}</Label><Input id="reminder-start" type="time" value={settings.reminderStart} min="08:00" max="22:00" onChange={(event) => setSettingsState((current) => ({ ...current, reminderStart: event.target.value }))} /></div>
                <div className="space-y-1"><Label htmlFor="reminder-end">{uiText(zh, "End", "结束")}</Label><Input id="reminder-end" type="time" value={settings.reminderEnd} min="08:00" max="22:00" onChange={(event) => setSettingsState((current) => ({ ...current, reminderEnd: event.target.value }))} /></div>
              </div>
            </div>
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-medium text-foreground">{uiText(zh, "Do not disturb", "免打扰时段")}</p><p className="text-xs text-muted-foreground">{uiText(zh, "Add more than one quiet period if needed.", "可按需要添加多个免打扰时段。")}</p></div>
                <Button type="button" variant="outline" size="icon" onClick={addQuietPeriod} aria-label={uiText(zh, "Add quiet period", "添加免打扰时段")}><Plus className="h-4 w-4" /></Button>
              </div>
              {settings.quietPeriods.map((period) => (
                <div key={period.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <div className="space-y-1"><Label htmlFor={`${period.id}-start`}>{uiText(zh, "From", "从")}</Label><Input id={`${period.id}-start`} type="time" value={period.start} onChange={(event) => updateQuietPeriod(period.id, "start", event.target.value)} /></div>
                  <div className="space-y-1"><Label htmlFor={`${period.id}-end`}>{uiText(zh, "To", "到")}</Label><Input id={`${period.id}-end`} type="time" value={period.end} onChange={(event) => updateQuietPeriod(period.id, "end", event.target.value)} /></div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSettingsState((current) => ({ ...current, quietPeriods: current.quietPeriods.filter((item) => item.id !== period.id) }))} aria-label={uiText(zh, "Remove quiet period", "删除免打扰时段")}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <div className="py-4">
              <p className="text-sm font-medium text-foreground">{uiText(zh, "Daily care summary reminder · 10:00 PM", "每日照护总结提醒 · 晚上10:00")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{uiText(zh, "Always on. If yesterday is incomplete, reminders appear with the first morning reminder, at noon, and again at 10:00 PM.", "始终开启。若昨天未完成，将在今早第一条提醒、中午12点及晚上10点再次提醒。")}</p>
            </div>
            <SettingRow
               label={uiText(zh, "Reduce motion", "减少动态效果")}
               detail={uiText(zh, "Use less movement when navigating", "浏览页面时减少动画")}
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => setSettingsState((current) => ({ ...current, reducedMotion: checked }))}
            />
          </div>
           <Button className="w-full" size="lg" onClick={persistProfile}>{uiText(zh, "Save", "保存")}</Button>
        </TabsContent>

        <TabsContent value="screening" className="mt-5 space-y-5">
          <div>
             <h2 className="font-semibold text-foreground">{uiText(zh, "Which describes you?", "哪一种身份更符合您的情况？")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
               <Button variant={profile?.role === "primary" ? "default" : "outline"} className="h-auto py-3" onClick={() => chooseRole("primary")}>{uiText(zh, "Primary caregiver", "主要护理者")}</Button>
               <Button variant={profile?.role === "other" ? "default" : "outline"} className="h-auto py-3" onClick={() => chooseRole("other")}>{uiText(zh, "Secondary caregiver", "协助护理者")}</Button>
            </div>
             <p className="mt-2 text-xs text-muted-foreground">{uiText(zh, "This choice stays on this device and selects the matching questionnaire.", "此选择只保存在本设备，用于显示与您身份相符的问卷。")}</p>
          </div>

          {profile && (
            <div className="border-y border-border">
              <button
                className="flex w-full items-center gap-3 py-4 text-left"
                onClick={() => navigate("/screening?section=introduction")}
              >
                {introductionDone ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1">
                   <span className="block font-semibold text-foreground">{introductionDone ? uiText(zh, "Self-introduction questions complete", "个人基本信息已完成") : uiText(zh, "Finish your self-introduction questions", "完成个人基本信息")}</span>
                   <span className="mt-0.5 block text-sm text-muted-foreground">{localizeQuestionnaire(questionnaire, zh).groups[0]?.title}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
              <button className="flex w-full items-center gap-3 border-t border-border py-4 text-left" onClick={() => navigate("/screening")}> 
                {profile.screeningDone ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1">
                   <span className="block font-semibold text-foreground">{profile.screeningDone ? uiText(zh, "Screening questions complete", "初始问卷已完成") : uiText(zh, "Continue screening questions", "继续填写初始问卷")}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{displayedQuestionnaire.title}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
              {displayedQuestionnaire.groups.map((group, index) => {
                const required = group.questions.filter((question) => !question.optional);
                const completed = required.length > 0 && required.every((question) => answered(draft[question.id]));
                return (
                  <button
                    key={group.id}
                    className="flex w-full items-center gap-3 border-t border-border py-3 text-left"
                    onClick={() => navigate(`/screening?step=${index}`)}
                  >
                    {completed ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{group.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{uiText(zh, `${group.questions.length} questions`, `${group.questions.length} 个问题`)}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingRow({ label, detail, checked, onCheckedChange }: { label: string; detail: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}