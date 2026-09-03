import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, ShieldCheck, User as UserIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyAppUserName, saveMyAppUserName } from "@/features/profile/app-user-name";
import { disableMyLocationSharingWordPress } from "@/features/location/source.wordpress-extended";

/** "Me" screen — identity, sharing kill-switch and appearance. */
export default function SafetySettings() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(true);

  useEffect(() => {
    fetchMyAppUserName().then((n) => { if (n) setName(n); }).catch(() => { /* keep local value */ });
    try { setSharing(localStorage.getItem("notchsafety:sharing") !== "off"); } catch { /* ignore */ }
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await saveMyAppUserName(name.trim());
      toast({ title: L("已保存", "Saved") });
    } catch (e: any) {
      toast({ title: L("暂时无法保存", "Couldn't save just now"), description: e?.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const toggleSharing = async (on: boolean) => {
    setSharing(on);
    try { localStorage.setItem("notchsafety:sharing", on ? "on" : "off"); } catch { /* ignore */ }
    if (!on) {
      try {
        await disableMyLocationSharingWordPress();
        toast({ title: L("已停止共享位置", "Location sharing stopped") });
      } catch (e: any) {
        toast({ title: L("暂时无法停止", "Couldn't stop just now"), description: e?.message, variant: "destructive" });
      }
    } else {
      toast({ title: L("在地图页开启共享即可开始", "Turn sharing on from the Map screen to start") });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold md:text-2xl">{L("我的", "Me")}</h1>

      <Card className="border-transparent card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="h-4 w-4 text-primary" />{L("家人看到的名字", "Name your family sees")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="nn-me-name" className="sr-only">{L("名字", "Name")}</Label>
          <Input id="nn-me-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={L("例如：爸爸", "e.g. Dad")} />
          <Button onClick={save} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{L("保存", "Save")}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" />{L("位置隐私", "Location privacy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{L("与我的圈子共享位置", "Share my location with my circle")}</p>
              <p className="text-sm text-muted-foreground">
                {L("关闭后，家人将看不到你的位置。", "When off, nobody in your circle can see where you are.")}
              </p>
            </div>
            <Switch checked={sharing} onCheckedChange={toggleSharing} aria-label={L("共享位置", "Share location")} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader className="pb-3"><CardTitle className="text-base">{L("显示与语言", "Appearance & language")}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline" className="gap-2"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? L("浅色模式", "Light mode") : L("深色模式", "Dark mode")}
          </Button>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full gap-2 text-destructive"
        onClick={async () => { await logout(); navigate("/"); }}
      >
        <LogOut className="h-4 w-4" />{L("退出登录", "Sign out")}
      </Button>
    </div>
  );
}
