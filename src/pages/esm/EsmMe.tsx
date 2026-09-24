import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDraft, getProfile, getSettings, saveDraft, saveProfile, saveSettings, startProfile, type ParticipantRole } from "@/features/esm/store";
import { otherScreening, primaryScreening } from "@/features/esm/questionnaires";

const answered = (value: unknown) => value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);

export default function EsmMe() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialTab = params.get("tab") === "screening" ? "screening" : "profile";
  const [profile, setProfile] = useState(getProfile());
  const [name, setName] = useState(profile?.name ?? "");
  const [settings, setSettingsState] = useState(getSettings());

  const questionnaire = profile?.role === "other" ? otherScreening : primaryScreening;
  const draft = getDraft(questionnaire.id);
  const introduction = questionnaire.groups[0];
  const introductionDone = useMemo(
    () => Boolean(introduction) && introduction.questions.filter((q) => !q.optional).every((q) => answered(draft[q.id])),
    [draft, introduction],
  );

  const chooseRole = (role: ParticipantRole) => {
    const next = startProfile(role);
    setProfile(next);
    setName(next.name ?? "");
  };

  const persistProfile = () => {
    if (!profile) {
      toast.error("Choose Primary or Secondary caregiver first.");
      return;
    }
    const next = { ...profile, name: name.trim() };
    saveProfile(next);
    const nextDraft = { ...getDraft(questionnaire.id), c302_a01: name.trim() };
    saveDraft(questionnaire.id, nextDraft);
    saveSettings(settings);
    setProfile(next);
    toast.success("Profile and settings saved.");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-foreground">Me</h1>
      <Tabs
        defaultValue={initialTab}
        className="mt-4"
        onValueChange={(tab) => setParams(tab === "screening" ? { tab: "screening" } : {})}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile & settings</TabsTrigger>
          <TabsTrigger value="screening">Screening questions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="esm-name">Name</Label>
            <Input id="esm-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            <p className="text-xs text-muted-foreground">Saved with your screening information.</p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            <SettingRow
              label="Hourly reminders"
              detail="Prompt me during the study day"
              checked={settings.hourlyReminders}
              onCheckedChange={(checked) => setSettingsState((current) => ({ ...current, hourlyReminders: checked }))}
            />
            <SettingRow
              label="Daily summary reminder"
              detail="Remind me to complete the daily questionnaire"
              checked={settings.dailyReminder}
              onCheckedChange={(checked) => setSettingsState((current) => ({ ...current, dailyReminder: checked }))}
            />
            <SettingRow
              label="Reduce motion"
              detail="Use less movement when navigating"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => setSettingsState((current) => ({ ...current, reducedMotion: checked }))}
            />
          </div>
          <Button className="w-full" size="lg" onClick={persistProfile}>Save</Button>
        </TabsContent>

        <TabsContent value="screening" className="mt-5 space-y-5">
          <div>
            <h2 className="font-semibold text-foreground">Which describes you?</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant={profile?.role === "primary" ? "default" : "outline"} className="h-auto py-3" onClick={() => chooseRole("primary")}>Primary caregiver</Button>
              <Button variant={profile?.role === "other" ? "default" : "outline"} className="h-auto py-3" onClick={() => chooseRole("other")}>Secondary caregiver</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">This choice stays on this device and selects the matching questionnaire.</p>
          </div>

          {profile && (
            <div className="border-y border-border">
              <button
                className="flex w-full items-center gap-3 py-4 text-left"
                onClick={() => navigate("/screening?section=introduction")}
              >
                {introductionDone ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">{introductionDone ? "Self-introduction questions complete" : "Finish your self-introduction questions"}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{introduction?.title}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
              <button className="flex w-full items-center gap-3 border-t border-border py-4 text-left" onClick={() => navigate("/screening")}> 
                {profile.screeningDone ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">{profile.screeningDone ? "Screening questions complete" : "Continue screening questions"}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{questionnaire.title}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
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