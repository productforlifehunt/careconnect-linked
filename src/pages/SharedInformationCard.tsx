import { useParams } from "react-router-dom";
import { useInformationCardByToken } from "@/hooks/use-care-data";
import { useQuery } from "@tanstack/react-query";
import { fetchInformationCardContactIdsWordPress, fetchInformationCardCaredOneIdWordPress } from "@/features/cared-ones/source.information-cards";
import { fetchEmergencyContactsWordPress } from "@/features/cared-ones/source.wordpress-extended";
import { fetchCurrentLocation } from "@/features/location/source.wordpress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdCard, MapPin, Phone, Loader2, ShieldOff, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SharedInformationCard() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { token } = useParams<{ token: string }>();
  const { data: card, isLoading, isError } = useInformationCardByToken(token || null);

  // REL 220 parent = the cared one this card belongs to
  const { data: caredOneId } = useQuery({
    queryKey: ["sharedCardCaredOne", card?.id],
    queryFn: () => fetchInformationCardCaredOneIdWordPress(String(card!.id)),
    enabled: !!card?.id,
  });

  // Fetch linked contact IDs (REL 221), then resolve to the cared one's contact rows
  const { data: contactIds } = useQuery({
    queryKey: ["sharedCardContactIds", card?.id],
    queryFn: () => fetchInformationCardContactIdsWordPress(String(card!.id)),
    enabled: !!card?.id,
  });

  const { data: contacts } = useQuery({
    queryKey: ["sharedCardContacts", caredOneId, contactIds?.join(",")],
    queryFn: async () => {
      if (!caredOneId || !contactIds?.length) return [];
      const all = await fetchEmergencyContactsWordPress(String(caredOneId));
      const set = new Set(contactIds.map(String));
      return (all || []).filter((c: any) => set.has(String(c.id)));
    },
    enabled: !!caredOneId && !!contactIds,
  });

  // Real last known location from CCT 213 — only when the card enables it
  const { data: location } = useQuery({
    queryKey: ["sharedCardLocation", caredOneId],
    queryFn: () => fetchCurrentLocation(String(caredOneId)),
    enabled: !!caredOneId && card?.displays_location === "Yes",
  });


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <h1 className="sr-only">{Z("正在加载信息卡", "Loading information card")}</h1>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <ShieldOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-lg font-semibold mb-1">{Z("名片不可用", "Card unavailable")}</h1>
          <p className="text-sm text-muted-foreground">{Z("此分享链接无效、已过期或不再公开。", "This share link is invalid, expired, or no longer public.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card className="card-elevated">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <IdCard className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold leading-tight truncate">
                  {card.cared_ones_information_card_name || Z("信息卡", "Information Card")}
                </h1>
                {card.cared_ones_name && (
                  <p className="text-sm text-muted-foreground mt-0.5">{card.cared_ones_name}</p>
                )}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {card.displays_location === "Yes" && (
                    <Badge variant="outline" className="text-[10px]"><MapPin className="h-2.5 w-2.5 mr-1" />{Z("位置", "Location")}</Badge>
                  )}
                </div>
              </div>
            </div>

            {card.cared_ones_description && (
              <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed border-t pt-4">
                {card.cared_ones_description}
              </div>
            )}

            {card.displays_location === "Yes" && (
              <div className="border-t pt-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {Z("最近位置", "Last known location")}
                </h2>
                {location?.latitude != null && location?.longitude != null ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition"
                  >
                    <Navigation className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {location.address_text || `${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)}`}
                      </div>
                      {location.captured_at && (
                        <div className="text-xs text-muted-foreground truncate">
                          {new Date(String(location.captured_at).replace(" ", "T")).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{Z("暂无位置记录。", "No location record yet.")}</p>
                )}
              </div>
            )}


            {!!contacts?.length && (
              <div className="border-t pt-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {Z("紧急联系人", "Emergency contacts")}
                </h2>
                <div className="space-y-2">
                  {contacts.map((c: any) => (
                    <a
                      key={c.id}
                      href={`tel:${c.phone}`}
                      className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition"
                    >
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {c.phone}{c.relationship ? ` • ${c.relationship}` : ""}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-center text-[11px] text-muted-foreground mt-4">{Z("由忆畅分享", "Shared via ChallengeD")}</p>
      </div>
    </div>
  );
}
