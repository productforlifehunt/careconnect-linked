import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { saveSOAP } from '@/services/consultation-delivery';
import type { SOAPNote } from '@/types/consultation';
import { useTranslation } from 'react-i18next';

interface Props {
  orderId: number;
  itemId: number;
  providerId: string;
  initial?: SOAPNote;
  onSaved?: () => void;
}

export function SOAPNoteForm({ orderId, itemId, providerId, initial, onSaved }: Props) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const zh = i18n.language?.startsWith('zh');
  const [s, setS] = useState(initial?.subjective || '');
  const [o, setO] = useState(initial?.objective || '');
  const [a, setA] = useState(initial?.assessment || '');
  const [p, setP] = useState(initial?.plan || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSOAP(orderId, itemId, { subjective: s, objective: o, assessment: a, plan: p }, providerId);
      toast({ title: zh ? '问诊记录已保存' : 'SOAP note saved' });
      onSaved?.();
    } catch (e: any) {
      toast({ title: zh ? '保存失败' : 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: zh ? 'S — 主诉 (患者描述)' : 'S — Subjective (Patient reports)', value: s, setter: setS, hint: zh ? '症状、感受、病史' : 'Symptoms, feelings, history' },
    { label: zh ? 'O — 客观 (观察/检查)' : 'O — Objective (Findings)', value: o, setter: setO, hint: zh ? '体征、化验、影像' : 'Signs, labs, imaging' },
    { label: zh ? 'A — 评估 (诊断)' : 'A — Assessment (Diagnosis)', value: a, setter: setA, hint: zh ? '诊断、鉴别诊断' : 'Diagnosis, differentials' },
    { label: zh ? 'P — 计划 (治疗)' : 'P — Plan (Treatment)', value: p, setter: setP, hint: zh ? '处方、随访、转诊' : 'Prescriptions, follow-up, referrals' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{zh ? '问诊记录 (SOAP)' : 'Consultation Note (SOAP)'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((f) => (
          <div key={f.label} className="space-y-2">
            <Label className="text-sm font-medium">{f.label}</Label>
            <Textarea value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.hint} rows={3} />
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (zh ? '保存中…' : 'Saving…') : (zh ? '保存并签字' : 'Save & Sign')}
        </Button>
      </CardContent>
    </Card>
  );
}
