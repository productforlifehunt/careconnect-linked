import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Shield, Heart, Loader2 } from "lucide-react";
import { useSavedProviders, useToggleSavedProvider } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";

export default function Favorites() {
  const navigate = useNavigate();
  const { data: savedProviders, isLoading } = useSavedProviders();
  const toggleSaved = useToggleSavedProvider();
  const { t, i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");

  const removeFavorite = (providerId: string) => {
    toggleSaved.mutate(providerId);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const favorites = savedProviders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{t("favorites.favorites")}</h1>
      <p className="text-sm text-muted-foreground mt-0.5 mb-1">{t("favorites.caregiversSaved")}</p>
      <p className="text-xs text-muted-foreground mb-5">{isZh ? "这份名单只存在你现在用的这台设备上，换手机看不到。" : "This list is kept on the device you are using now, so it will not show up on another phone."}</p>


      {favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map((sp: any) => {
            const cg = sp.provider;
            if (!cg) return null;
            return (
              <Card key={sp.id} className="card-elevated border-transparent">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <img src={cg.avatar_url || "/placeholder.svg"} alt={cg.full_name || ""} className="w-16 h-16 rounded-xl object-cover cursor-pointer" onClick={() => navigate(`/caregiver/${cg.id}`)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{cg.full_name}</h3>
                        {cg.care_provider_is_background_checked && <Shield className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                        {cg.rating_average != null && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning fill-warning" /> {cg.rating_average.toFixed(1)} ({cg.rating_count || 0})</span>}
                        {cg.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cg.location}</span>}
                        {cg.care_provider_starts_hourly_rate
                          ? <span>{isZh ? "¥" : "$"}{cg.care_provider_starts_hourly_rate}{t("common.perHour")}</span>
                          : <span>{isZh ? "价格待询" : "Rate on request"}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(cg.service_type_slugs || []).map((s: string) => <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{careServiceTypeLabel(s, !!isZh)}</Badge>)}
                      </div>


                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="coral" size="sm" onClick={() => navigate(`/caregiver/${cg.id}`)}>{t("common.book")}</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFavorite(sp.provider_id)}>
                        <Heart className="h-4 w-4 fill-coral text-coral" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{t("favorites.noFavorites")}</p>
          <Button variant="coral" className="mt-4" onClick={() => navigate("/search")}>{t("favorites.browseCaregivers")}</Button>
        </div>
      )}
    </div>
  );
}
