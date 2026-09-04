/**
 * Dementia Stage Selector — allows caregivers to set and update the
 * cognitive stage for their cared one, personalizing the entire care experience.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Check, ChevronRight } from "lucide-react";
import { useUpdateDementiaStage } from "@/hooks/use-care-data";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface DementiaStageSelectorProps {
  caredOneId: string;
  caredOneName: string;
  currentStage?: string | null;
}

export function DementiaStageSelector({ caredOneId, caredOneName, currentStage }: DementiaStageSelectorProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(currentStage || "");
  const updateStage = useUpdateDementiaStage();

  const STAGES = [
    {
      value: "early",
      label: t("dementiaStage.earlyStage"),
      description: t("dementiaStage.earlyDesc"),
      color: "border-success/50 bg-success/5",
      badgeClass: "bg-success/10 text-success",
    },
    {
      value: "middle",
      label: t("dementiaStage.middleStage"),
      description: t("dementiaStage.middleDesc"),
      color: "border-warning/50 bg-warning/5",
      badgeClass: "bg-warning/10 text-warning",
    },
    {
      value: "late",
      label: t("dementiaStage.lateStage"),
      description: t("dementiaStage.lateDesc"),
      color: "border-destructive/50 bg-destructive/5",
      badgeClass: "bg-destructive/10 text-destructive",
    },
  ];

  const handleSave = async (stage: string) => {
    setSelected(stage);
    try {
      await updateStage.mutateAsync({ caredOneId, stage });
      toast({
        title: t("dementiaStage.stageUpdated"),
        description: t("dementiaStage.stageUpdatedDesc", { name: caredOneName, stage }),
      });
    } catch (err: any) {
      toast({ title: t("common.errorOccurred"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          {t("dementiaStage.cognitiveStage")} — {caredOneName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {STAGES.map(stage => {
          const isActive = selected === stage.value;
          return (
            <button
              key={stage.value}
              onClick={() => handleSave(stage.value)}
              disabled={updateStage.isPending}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                isActive ? stage.color + " ring-1 ring-primary/30" : "border-transparent bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                    {isActive && (
                      <Badge variant="outline" className={`text-[9px] px-1.5 ${stage.badgeClass}`}>
                        <Check className="h-2.5 w-2.5 mr-0.5" /> {t("dementiaStage.current")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                </div>
                {!isActive && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
            </button>
          );
        })}
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          {t("dementiaStage.adjustsNote")}
        </p>
      </CardContent>
    </Card>
  );
}
