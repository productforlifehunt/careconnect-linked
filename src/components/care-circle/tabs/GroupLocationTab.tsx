import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import LocationCard from "@/components/care/LocationCard";

interface GroupLocationTabProps {
  groupCaredOnes: any[];
}

/**
 * Shows the location of the group's loved ones. Reuses the exact same
 * LocationCard (current_location CCT + safe_zone CCT) as the cared-one hub —
 * no new data source.
 */
export function GroupLocationTab({ groupCaredOnes }: GroupLocationTabProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const people = useMemo(() => (groupCaredOnes || []).map((co: any) => ({
    id: String(co.user_id || co.profile?.id || co.id).replace(/^wp-/, ""),
    name: co.profile?.full_name || co.full_name || co.name || Z("家人", "Loved one"),
  })), [groupCaredOnes, isCN]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = people.find((p) => p.id === selectedId) || people[0];

  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{Z("本群组还没有家人，先在「群组家人」标签中添加。", "No loved ones in this group yet — add them in the Group Loved Ones tab first.")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {people.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {people.map((p) => (
            <Button key={p.id} size="sm" variant={active?.id === p.id ? "coral" : "outline"} onClick={() => setSelectedId(p.id)}>
              {p.name}
            </Button>
          ))}
        </div>
      )}
      {active && <LocationCard caredOneId={active.id} caredOneName={active.name} />}
    </div>
  );
}
