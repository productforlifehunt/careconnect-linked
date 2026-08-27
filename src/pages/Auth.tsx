import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { wpRequestPasswordReset } from "@/services/wp-auth";
import { BrandMark } from "@/components/BrandMark";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const site = useSite();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: t("common.weak"), color: "bg-destructive" };
    if (score <= 2) return { score, label: t("common.fair"), color: "bg-warning" };
    if (score <= 3) return { score, label: t("common.good"), color: "bg-primary" };
    return { score, label: t("common.strong"), color: "bg-success" };
  };

  const pwStrength = passwordStrength(signupPassword);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({ title: t("auth.fillAllFields"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast({ title: t("auth.welcomeBack") });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: t("auth.loginFailed"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) {
      toast({ title: t("auth.fillAllFields"), variant: "destructive" });
      return;
    }
    if (signupPassword.length < 8) {
      toast({ title: t("auth.passwordTooShort"), description: t("auth.passwordTooShortDesc"), variant: "destructive" });
      return;
    }
    if (pwStrength.score < 2) {
      toast({ title: t("auth.passwordTooWeak"), description: t("auth.passwordTooWeakDesc"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signup(signupName, signupEmail, signupPassword, "care-seeker");
      toast({ title: t("auth.accountCreated") });
    } catch (err: any) {
      toast({ title: t("auth.signupFailed"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-transparent card-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <BrandMark size={56} />
          </div>
          <CardTitle className="text-2xl">{site.name}</CardTitle>
          <CardDescription>{t(`site.${site.id}.authSubtitle`)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={initialMode}>
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="login" className="text-xs sm:text-sm px-1.5 py-1.5">{t("common.signIn")}</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs sm:text-sm px-1.5 py-1.5">{t("common.signUp")}</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-4">
              <div>
                <Label>{t("common.email")}</Label>
                <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <div>
                <Label>{t("common.password")}</Label>
                <PasswordInput value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder={t("auth.passwordPlaceholder")} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <Button variant="coral" className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? t("auth.signingIn") : t("common.signIn")}
              </Button>
              <div className="text-center">
                <button type="button" className="text-sm text-primary hover:underline" onClick={() => setForgotOpen(true)}>{t("auth.forgotPassword")}</button>
              </div>
              {forgotOpen && (
                <div className="border rounded-lg p-4 mt-2 space-y-3 bg-muted/30">
                  <p className="text-sm text-foreground font-medium">{t("auth.resetPassword")}</p>
                  <Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder={t("auth.enterEmail")} />
                  <Button variant="outline" className="w-full" disabled={forgotLoading} onClick={async () => {
                    if (!forgotEmail) { toast({ title: t("auth.enterEmail"), variant: "destructive" }); return; }
                    setForgotLoading(true);
                    try {
                      await wpRequestPasswordReset(forgotEmail);
                      toast({ title: t("auth.resetLinkSent", "Reset Link Sent"), description: t("auth.resetLinkSentDesc", "Check your email for a password reset link.") });
                      setForgotOpen(false);
                    } catch (err: any) {
                      toast({ title: t("common.errorOccurred"), description: err.message, variant: "destructive" });
                    } finally {
                      setForgotLoading(false);
                    }
                  }}>
                    {forgotLoading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div>
                <Label>{t("common.fullName")}</Label>
                <Input value={signupName} onChange={e => setSignupName(e.target.value)} placeholder={t("auth.namePlaceholder")} />
              </div>
              <div>
                <Label>{t("common.email")}</Label>
                <Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} />
              </div>
              <div>
                <Label>{t("common.password")}</Label>
                <PasswordInput value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder={t("auth.passwordHint")} />
                {signupPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= pwStrength.score ? pwStrength.color : "bg-muted"}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${pwStrength.score <= 1 ? "text-destructive" : pwStrength.score <= 2 ? "text-warning" : "text-success"}`}>{pwStrength.label}</p>
                  </div>
                )}
              </div>
              <Button variant="coral" className="w-full" onClick={handleSignup} disabled={loading}>
                {loading ? t("auth.creatingAccount") : t("common.signUp")}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
