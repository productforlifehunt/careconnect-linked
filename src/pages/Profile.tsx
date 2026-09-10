import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfile } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { wpUploadMedia } from "@/services/wp-auth";
import { runSettingSkill } from "@/lib/ai-dynamic-knowledge";
import { User, Bell, Shield, MapPin, Loader2, Upload, Camera, Download, Trash2, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";
import { AppSettingsPanel } from "@/components/settings/AppSettingsPanel";

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const site = useSite();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfile();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setAddress(profile.location || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setRoles((profile.general_user_role || []).filter((role) => role === "cared one" || role === "caring one"));
      setEmailNotifs(true);
      setPushNotifs(true);
    }
  }, [profile]);

  const handleSave = async () => {
    setSavingProfile(true);
    try {
      // One write path: the "set-personal-profile" skill.
      await runSettingSkill("set-personal-profile", {
        full_name: name,
        phone,
        location: address,
        bio,
        avatar_url: avatarUrl || null,
        general_user_role: roles,
      });
      await qc.invalidateQueries({ queryKey: ["myProfile"] });
      toast({ title: t("profile.profileUpdated") });
    } catch (err: any) {
      toast({ title: t("profile.updateFailed"), description: err.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadData = async () => {
    setDownloadingData(true);
    try {
      // The "download-my-data" skill assembles what may be exported.
      const exportData = await runSettingSkill("download-my-data");
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("profile.dataDownloaded", "Your data has been downloaded") });
    } catch (err: any) {
      toast({ title: t("profile.downloadFailed"), description: err.message, variant: "destructive" });
    } finally {
      setDownloadingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await runSettingSkill("close-my-account");
      toast({
        title: t("profile.accountDeleted", "Account Deleted"),
        description: t("profile.accountDeletedDesc", "Your account data has been anonymized and you have been logged out."),
      });
      navigate("/");
    } catch (err: any) {
      toast({ title: t("profile.deletionFailed"), description: err.message, variant: "destructive" });
    } finally {
      setDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-48 w-full rounded-xl" /></div>
      </div>
    );
  }

  const displayName = name || user?.full_name || "User";
  const roleLabel = roles.length ? roles.join(" · ") : "—";
  const toggleRole = (role: string, checked: boolean) => setRoles((current) => checked ? [...new Set([...current, role])] : current.filter((item) => item !== role));

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-5">{t("nav.settings", "Settings")}</h1>

      <Tabs defaultValue="personal">
        <TabsList className="mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="personal" className="gap-2"><User className="h-4 w-4" /> {t("common.personal")}</TabsTrigger>
          <TabsTrigger value="display" className="gap-2"><Monitor className="h-4 w-4" /> {t("common.display", "Display")}</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> {t("common.notifications")}</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2"><Shield className="h-4 w-4" /> {t("common.privacy")}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <div className="relative group shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xl sm:text-2xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                   <button type="button" aria-label={t("profile.changeAvatar", "Change profile photo")} className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                    {avatarUploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { toast({ title: t("profile.fileTooLarge"), description: t("profile.maxSize"), variant: "destructive" }); return; }
                    setAvatarUploading(true);
                    try {
                      const url = await wpUploadMedia(file);
                      setAvatarUrl(url);
                      toast({ title: t("profile.avatarUploaded", "Avatar uploaded") });
                    } catch (err: any) {
                      toast({ title: t("profile.uploadFailed"), description: err.message, variant: "destructive" });
                    } finally { setAvatarUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
                  }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">{displayName}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{email}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">{roleLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>{t("profile.personalInfo")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>{t("common.fullName")}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div><Label>{t("common.email")}</Label><Input value={email} disabled className="opacity-60" /></div>
                <div><Label>{t("common.phone")}</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </div>
              <div>
                <Label>{t("profile.avatar")}</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder={t("profile.avatarUrlPlaceholder")} className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}><Upload className="h-4 w-4 mr-1" /> {t("common.upload")}</Button>
                </div>
              </div>
              <div>
                <Label>{t("common.address")}</Label>
                <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={address} onChange={e => setAddress(e.target.value)} className="pl-9" /></div>
              </div>
              <div><Label>{t("profile.aboutMe")}</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} /></div>
              <div className="space-y-3">
                <Label>{t("common.role", "Role")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("profile.roleHelp", "Turn on everything that describes you. This decides which care tools you see.")}
                </p>
                {([
                  { value: "cared one" as const, label: t("profile.roleCaredOne", "I receive care") },
                  { value: "caring one" as const, label: t("profile.roleCaringOne", "I care for someone") },
                ]).map((role) => (
                  <div key={role.value} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{role.label}</span>
                    <Switch checked={roles.includes(role.value)} onCheckedChange={(checked) => toggleRole(role.value, checked)} aria-label={role.label} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="coral" onClick={handleSave} disabled={savingProfile}>
            {savingProfile ? t("common.saving") : t("profile.saveChanges")}
          </Button>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <AppSettingsPanel sections={["display"]} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <AppSettingsPanel sections={["channels", "categories", "quiet", "permissions"]} />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>{t("profile.yourData")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("profile.downloadDesc")}</p>
              <Button variant="outline" className="w-full" onClick={handleDownloadData} disabled={downloadingData}>
                {downloadingData ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                {downloadingData ? t("profile.preparingDownload") : t("profile.downloadMyData")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated border-destructive/20">
            <CardHeader><CardTitle className="text-destructive">{t("profile.dangerZone")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("profile.deleteConfirmDesc")}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={deletingAccount}>
                    {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    {t("profile.deleteAccount")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("profile.deleteConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("profile.deleteConfirmDesc")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("profile.yesDeleteAccount")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
