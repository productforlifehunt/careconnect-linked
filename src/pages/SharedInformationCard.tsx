import { useState } from "react";
import { useParams } from "react-router-dom";
import { useInformationCardByToken } from "@/hooks/use-care-data";
import { useQuery } from "@tanstack/react-query";
import { fetchInformationCardContactIdsWordPress, fetchInformationCardCaredOneIdWordPress } from "@/features/cared-ones/source.information-cards";
import { fetchEmergencyContactsWordPress } from "@/features/cared-ones/source.wordpress-extended";
import { fetchCurrentLocation } from "@/features/location/source.wordpress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IdCard, MapPin, Phone, Loader2, ShieldOff, Navigation, Bot, Home, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InfoSheetAIDialog } from "@/components/cared-ones/InfoSheetAIDialog";

export default function SharedInformationCard() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { token } = useParams<{ token: string }>();
  const { data: card, isLoading, isError } = useInformationCardByToken(token || null);
  const [aiOpen, setAiOpen] = useState(false);

  // REL 220: the loved one this sheet belongs to.
  const { data: caredOneId } = useQuery({
    queryKey: ["sharedCardCaredOne", card?.id],
    queryFn: () => fetchInformationCardCaredOneIdWordPress(String(card?.id)),
    enabled: !!card?.id,
  });

  // REL 221: the emergency contacts selected for this sheet.
  const { data: contactIds } = useQuery({
    queryKey: ["sharedCardContactIds", card?.id],
    queryFn: () => fetchInformationCardContactIdsWordPress(String(card?.id)),
    enabled: !!card?.id,
  });

  const { data: contacts } = useQuery({
    queryKey: ["sharedCardContacts", caredOneId, contactIds?.join(",")],
    queryFn: async () => {
      if (!caredOneId || !contactIds?.length) return [];
      const all = await fetchEmergencyContactsWordPress(String(caredOneId));
      const selected = new Set(contactIds.map(String));
      return (all || []).filter((contact: any) => selected.has(String(contact.id)));
    },
    enabled: !!caredOneId && !!contactIds,
  });

  const { data: location } = useQuery({
    queryKey: ["sharedCardLocation", caredOneId],
    queryFn: () => fetchCurrentLocation(String(caredOneId)),
    enabled: !!caredOneId && card?.displays_location === "Yes",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <h1 className="sr-only">{Z("正在加载照护须知", "Loading care info sheet")}</h1>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <ShieldOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-lg font-semibold mb-1">{Z("照护须知不可用", "Care info sheet unavailable")}</h1>
          <p className="text-sm text-muted-foreground">{Z("此分享链接无效、已过期或不再公开。", "This share link is invalid, expired, or no longer public.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card className="card-elevated">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <IdCard className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold leading-tight break-words">
                  {card.cared_ones_information_card_name || Z("照护须知", "Care info sheet")}
                </h1>
                {card.cared_ones_name && <p className="text-sm text-muted-foreground mt-0.5">{card.cared_ones_name}</p>}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {card.displays_location === "Yes" && (
                    <Badge variant="outline" className="text-[10px]"><MapPin className="h-2.5 w-2.5 mr-1" />{Z("显示位置", "Location shared")}</Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]"><Home className="h-2.5 w-2.5 mr-1" />{Z("共享须知", "Shared sheet")}</Badge>
                </div>
              </div>
            </div>

            {card.cared_ones_description && (
              <section className="border-t pt-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> {Z("基本情况", "Background")}
                </h2>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{card.cared_ones_description}</p>
              </section>
            )}

            {card.cared_ones_information_card_description && (
              <section className="border-t pt-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{Z("这次的具体安排", "What's needed this time")}</h2>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{card.cared_ones_information_card_description}</p>
              </section>
            )}

            {card.displays_location === "Yes" && (
              <section className="border-t pt-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{Z("最近位置", "Last known location")}</h2>
                {location?.latitude != null && location?.longitude != null ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition"
                  >
                    <Navigation className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{location.address_text || `${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)}`}</div>
                      {location.captured_at && <div className="text-xs text-muted-foreground truncate">{new Date(String(location.captured_at).replace(" ", "T")).toLocaleString()}</div>}
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{Z("暂无位置记录。", "No location record yet.")}</p>
                )}
              </section>
            )}

            {!!contacts?.length && (
              <section className="border-t pt-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{Z("紧急联系人", "Emergency contacts")}</h2>
                <div className="space-y-2">
                  {contacts.map((contact: any) => (
                    <a key={contact.id} href={`tel:${contact.phone}`} className="flex items-start gap-3 rounded-md border p-3 hover:bg-accent transition">
                      <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{contact.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{contact.phone}{contact.relationship ? ` • ${contact.relationship}` : ""}</div>
                        {contact.content && <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{contact.content}</div>}
                        {contact.address && <div className="text-xs text-muted-foreground mt-0.5">{contact.address}</div>}
                        {contact.note && <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{contact.note}</div>}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <Button className="w-full" onClick={() => setAiOpen(true)}>
              <Bot className="h-4 w-4 mr-2" /> {Z("有问题？直接问 AI", "Have a question? Ask AI")}
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-[11px] text-muted-foreground mt-4">{Z("由忆畅分享", "Shared via ChallengeD")}</p>
      </div>

      <InfoSheetAIDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        context={{
          sheetName: card.cared_ones_information_card_name,
          caredOneName: card.cared_ones_name,
          description: card.cared_ones_description,
          situationDetails: card.cared_ones_information_card_description,
          contacts: contacts || [],
          locationText: location?.address_text || null,
        }}
      />
    </div>
  );
}
