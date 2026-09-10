import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  completeOnboarding,
  currentAppId,
  fetchMyAppUserName,
  fetchMyCommunityName,
} from "@/features/shared/app-profile";

/**
 * One short welcome screen per sub-app. Same file, same shell, brand wording
 * comes from the active site config — no separate onboarding app per brand.
 *
 * It writes only to this app's own CCT 151 row (a55 name, a56 forum name,
 * a70 finished/skipped) and triggers the 10 welcome AI credits on paid apps,
 * on both "Continue" and "Skip".
 */
export default function Onboarding() {
  const { t } = useTranslation();
  const site = useSite();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const app = currentAppId();
  const isSafety = app === "notchsafety";
  const home = isSafety ? "/map" : "/dashboard";

  const [name, setName] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [saving, setSaving] = useState<"skip" | "done" | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [existingName, existingCommunity] = await Promise.all([
        fetchMyAppUserName().catch(() => ""),
        fetchMyCommunityName().catch(() => ""),
      ]);
      if (cancelled) return;
      setName(existingName || user?.full_name || "");
      setCommunityName(existingCommunity || "");
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const finish = async (mode: "skip" | "done") => {
    setSaving(mode);
    try {
      const granted = await completeOnboarding(
        mode === "done" ? { name, communityName } : {},
      );
      if (granted > 0) {
        toast({
          title: t("settings.creditsGrantedTitle", { defaultValue: "10 AI credits added" }),
          description: t("settings.creditsGrantedBody", {
            defaultValue: "You have 10 AI credits to try the assistant in this app.",
          }),
        });
      }
      // The gate cached "not onboarded" — refresh it before leaving.
      await qc.invalidateQueries({ queryKey: ["appOnboarding"] });
      navigate(home, { replace: true });
    } catch (err: any) {
      toast({
        title: t("onboarding.saveFailed", { defaultValue: "Could not save" }),
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const intro = isSafety
    ? t("onboarding.introSafety", {
        defaultValue: "See where your family is, get told when they arrive home, and call for help fast.",
      })
    : app === "carecnc"
      ? t("onboarding.introCare", {
          defaultValue: "Find caregivers you can trust and keep everyone caring for your loved one on the same page.",
        })
      : t("onboarding.introChallenged", {
          defaultValue: "Learn about dementia care, keep daily routines in one place, and share the care with your family.",
        });

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-foreground">{site.logoText}</span>
          <span className="text-primary">{site.logoAccent}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{site.tagline}</p>
      </div>

      <Card className="border-transparent card-elevated">
        <CardContent className="p-5 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">
              {t("onboarding.welcome", { defaultValue: "Welcome" })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{intro}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ob-name">
              {t("onboarding.nameLabel", { defaultValue: "Your name here" })}
            </Label>
            <Input
              id="ob-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("onboarding.namePlaceholder", { defaultValue: "How your family sees you" })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ob-community">
              {t("onboarding.communityLabel", { defaultValue: "Your name on the forum" })}
            </Label>
            <Input
              id="ob-community"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder={t("onboarding.communityPlaceholder", { defaultValue: "Shown on posts and replies" })}
            />
            <p className="text-xs text-muted-foreground">
              {t("onboarding.communityHelp", {
                defaultValue: "This forum name is only used here, so you can pick a different one in each app.",
              })}
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {t("onboarding.creditsHint", {
                defaultValue: "You get 10 free AI credits to try the assistant.",
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="coral" onClick={() => finish("done")} disabled={saving !== null}>
              {saving === "done" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("onboarding.continue", { defaultValue: "Save and continue" })}
            </Button>
            <Button variant="ghost" onClick={() => finish("skip")} disabled={saving !== null}>
              {saving === "skip" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("onboarding.skip", { defaultValue: "Skip for now" })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
