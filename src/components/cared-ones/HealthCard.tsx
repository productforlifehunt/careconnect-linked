import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Activity, Loader2 } from "lucide-react";
import { useHealthVitals, useCreateHealthVital } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function HealthCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const VITAL_TYPES = [
    { value: "blood_pressure", label: Z("血压", "Blood Pressure"), unit: "mmHg", placeholder: "120/80" },
    { value: "heart_rate", label: Z("心率", "Heart Rate"), unit: Z("次/分", "bpm"), placeholder: "72" },
    { value: "blood_sugar", label: Z("血糖", "Blood Sugar"), unit: "mg/dL", placeholder: "100" },
    { value: "weight", label: Z("体重", "Weight"), unit: Z("公斤", "lbs"), placeholder: "150" },
    { value: "temperature", label: Z("体温", "Temperature"), unit: "°F", placeholder: "98.6" },
    { value: "oxygen", label: Z("血氧饱和度", "O2 Saturation"), unit: "%", placeholder: "98" },
  ];

  const { data: vitals, isLoading } = useHealthVitals(caredOneId);
  const create = useCreateHealthVital();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ vital_type: "blood_pressure", value: "", note: "" });
  const selectedType = VITAL_TYPES.find(t => t.value === form.vital_type)!;

  const handleSubmit = () => {
    if (!form.value) return;
    const numericValue = form.vital_type === "blood_pressure" ? 0 : parseFloat(form.value);
    const noteWithBP = form.vital_type === "blood_pressure" ? [form.value, form.note].filter(Boolean).join(" - ") : form.note || undefined;
    create.mutate({ user_id: caredOneId, vital_type: form.vital_type, value: numericValue, unit: selectedType.unit, notes: noteWithBP || undefined }, {
      onSuccess: () => { setForm({ vital_type: "blood_pressure", value: "", note: "" }); setAddOpen(false); toast({ title: Z("已记录指标 ✓", "Vital recorded ✓") }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("健康追踪", "Health Tracking")}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("记录", "Record")}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("记录指标", "Record Vital")}</DialogTitle>
            <DialogDescription>{Z("记录一项健康测量数据", "Log a health measurement")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("指标类型", "Vital Type")}</Label>
                <Select value={form.vital_type} onValueChange={v => setForm(p => ({ ...p, vital_type: v, value: "" }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{VITAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{Z("数值", "Value")} ({selectedType.unit})</Label><Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={selectedType.placeholder} className="mt-1" /></div>
            </div>
            <div><Label>{Z("备注", "Notes")}</Label><Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder={Z("可选备注", "Optional notes")} className="mt-1" /></div>
            <Button variant="coral" className="w-full" onClick={handleSubmit} disabled={create.isPending || !form.value}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("保存记录", "Record Vital")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (vitals || []).length === 0 ? (
        <div className="text-center py-12">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("暂无健康记录", "No vitals recorded yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加第一条记录", "Record First Vital")}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(vitals || []).map((v: any) => (
            <Card key={v.id} className="border-transparent card-elevated">
              <CardContent className="p-3 flex justify-between items-center">
                <div><div className="flex items-center gap-2"><Badge variant="secondary" className="text-xs">{VITAL_TYPES.find(t => t.value === v.vital_type)?.label || v.vital_type}</Badge>
                  <span className="font-semibold text-foreground text-sm">{v.vital_type === "blood_pressure" && v.note ? v.note.split(" - ")[0] : v.value} {v.unit}</span></div>
                  {v.note && v.vital_type !== "blood_pressure" && <p className="text-xs text-muted-foreground mt-0.5">{v.note}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString(isCN ? "zh-CN" : "en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
