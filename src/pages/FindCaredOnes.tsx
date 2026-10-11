import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/care/LocationCard";
import { useUserCaredOnes } from "@/hooks/use-care-data";

/**
 * Find page for the care apps: the signed-in user's own cared ones (REL 219,
 * accepted), switchable, each shown with the same LocationCard used on the
 * cared-one page and the care-group location tab.
 */
export default function FindCaredOnes() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { data: caredOnes, isLoading } = useUserCaredOnes();

  const people = useMemo(
    () =>
      (caredOnes || [])
        .filter((c: any) => !c.invitation_status || c.invitation_status === "accepted")
        .map((c: any) => ({
          id: String(c.user_id ?? c.cared_one?.id ?? "").replace(/^wp-/, ""),
          name: c.cared_one?.full_name || Z("被护理者", "Cared one"),
        }))
        .filter((p) => p.id),
    [caredOnes, isCN],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = people.find((p) => p.id === selectedId) || people[0];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">{Z("定位", "Find")}</h1>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{Z("加载中…", "Loading…")}</div>
      ) : people.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{Z("你还没有被护理者，先在「被护理者」页面添加。", "You have no cared ones yet — add one on the Cared Ones page first.")}</p>
        </div>
      ) : (
        <>
          {people.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {people.map((p) => (
                <Button key={p.id} size="sm" variant={active?.id === p.id ? "default" : "outline"} onClick={() => setSelectedId(p.id)}>
                  {p.name}
                </Button>
              ))}
            </div>
          )}
          {active && <LocationCard key={active.id} caredOneId={active.id} caredOneName={active.name} />}
        </>
      )}
    </div>
  );
}
