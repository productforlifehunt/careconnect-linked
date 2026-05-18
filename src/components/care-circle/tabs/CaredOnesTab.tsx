import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CaredOnesTabProps {
  groupCaredOnes: any[];
  isAdmin: boolean;
  onAddCaredOne: () => void;
}

export function CaredOnesTab({ groupCaredOnes, isAdmin, onAddCaredOne }: CaredOnesTabProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const caredOneLabel = Z("亲人", "Cared One");
  const caredOnesLabel = Z("亲人", "Cared Ones");

  return (
    <div>
      {isAdmin && (
        <div className="mb-4">
          <Button variant="coral" size="sm" onClick={onAddCaredOne}><Plus className="h-4 w-4 mr-1" /> {Z("添加亲人", `Add ${caredOneLabel}`)}</Button>
        </div>
      )}
      {(groupCaredOnes || []).length > 0 ? (
        <div className="space-y-4">
          {(groupCaredOnes || []).map((co: any) => (
            <Card key={co.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {co.profile?.avatar_url || co.avatar_url ? <img src={co.profile?.avatar_url || co.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary font-medium">{(co.profile?.full_name || co.full_name || co.name || "?")[0]}</span>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{co.profile?.full_name || co.full_name || co.name || caredOneLabel}</h3>
                    <p className="text-xs text-muted-foreground">{co.relationship || caredOneLabel}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/cared-ones")}>{Z("查看健康卡片 →", "View Health Cards →")}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">{Z("本团聚中暂无亲人。", `No ${caredOnesLabel.toLowerCase()} in this group yet.`)}</p>
          {isAdmin ? (
            <Button variant="coral" size="sm" onClick={onAddCaredOne}><Plus className="h-4 w-4 mr-1" /> {Z("添加亲人", `Add ${caredOneLabel}`)}</Button>
          ) : (
            <p className="text-sm text-muted-foreground">{Z("请联系团聚管理员添加亲人。", "Ask a group admin to add a cared one.")}</p>
          )}
        </div>
      )}
    </div>
  );
}
