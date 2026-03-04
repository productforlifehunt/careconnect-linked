import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { careAuth } from "@/integrations/supabase/external-client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Heart, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = careAuth.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setIsRecovery(true);
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      toast({ title: t("resetPw.passwordMinLength"), variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: t("resetPw.passwordsMismatch"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await careAuth.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: t("resetPw.passwordUpdated") });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: t("resetPw.resetFailed"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-transparent card-elevated">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t("resetPw.verifyingLink")}</p>
            <p className="text-xs text-muted-foreground mt-2">{t("resetPw.linkExpired")}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/auth")}>{t("resetPw.backToSignIn")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-transparent card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mb-3">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t("resetPw.title")}</CardTitle>
          <CardDescription>{t("resetPw.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("resetPw.newPassword")}</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleReset()} />
          </div>
          <div>
            <Label>{t("resetPw.confirmPassword")}</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleReset()} />
          </div>
          <Button variant="coral" className="w-full" onClick={handleReset} disabled={loading}>
            {loading ? t("resetPw.updating") : t("resetPw.updatePassword")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
