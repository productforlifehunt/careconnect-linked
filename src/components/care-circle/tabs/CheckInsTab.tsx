import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";
import { CheckInCard } from "@/components/cared-ones/CheckInCard";
import { useTranslation } from "react-i18next";

interface CheckInsTabProps {
  groupCaredOnes: any[];
  activeGroupId: string | null;
}

export function CheckInsTab({ groupCaredOnes, activeGroupId }: CheckInsTabProps) {
  const site = useSite();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [selectedCaredOne, setSelectedCaredOne] = useState<string | null>(null);
  const activeCOId = selectedCaredOne || (groupCaredOnes.length > 0 ? groupCaredOnes[0].user_id : null);

  if (groupCaredOnes.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground mb-2">{Z("暂无可签到的家人。", "No loved ones to check in on.")}</p>
        <p className="text-sm text-muted-foreground">{Z("请前往「家人」标签先添加一位家人。", "Go to the Loved Ones tab and add one first.")}</p>
      </div>
    );
  }

  return (
    <div>
      {groupCaredOnes.length > 1 && (
        <div className="flex gap-2 mb-4">
          {groupCaredOnes.map((co: any) => (
            <Badge key={co.user_id} variant={activeCOId === co.user_id ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCaredOne(co.user_id)}>{co.profile?.full_name || (isCN ? "家人" : site.caredOneSingular)}</Badge>
          ))}
        </div>
      )}
      {activeCOId ? <CheckInCard caredOneId={activeCOId} /> : null}
    </div>
  );
}
