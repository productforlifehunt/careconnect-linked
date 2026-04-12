import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { invokeAI } from "@/lib/ai-service";
import { useTranslation } from "react-i18next";

interface AIMedicationHelperProps {
  medications: any[];
  caredOneName?: string;
}

export function AIMedicationHelper({ medications, caredOneName }: AIMedicationHelperProps) {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!medications.length) return;
    setLoading(true);
    try {
      const medList = medications.map((m: any) => `${m.name} (${m.dosage || "dosage unknown"}, ${m.frequency || "frequency unknown"})`).join(", ");
      const reply = await invokeAI(
        "medication_check",
        `Patient: ${caredOneName || "a person with dementia"}. Current medications: ${medList}. Check for potential interactions and provide timing advice.`
      );
      setAnalysis(reply);
    } catch (err) {
      console.error("Medication check error:", err);
      setAnalysis(t("common.tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  if (!medications.length) return null;

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          {t("ai.aiMedicationChecker")}
        </CardTitle>
        {analysis && (
          <Button variant="ghost" size="sm" onClick={analyze} disabled={loading} className="h-6 text-[10px]">
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} /> {t("ai.recheck")}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!analysis && !loading ? (
          <Button variant="outline" size="sm" onClick={analyze} className="w-full text-xs">
            <Pill className="h-3 w-3 mr-1" /> {t("ai.checkMedications", { count: medications.length, s: medications.length > 1 ? "s" : "" })}
          </Button>
        ) : loading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("ai.analyzingMedications")}
          </div>
        ) : (
          <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
            {analysis}
            <p className="mt-2 text-[10px] text-muted-foreground italic">
              {t("ai.aiDisclaimer")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
