import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Upload } from 'lucide-react';
import type { ConsultationDelivery } from '@/types/consultation';
import { useTranslation } from 'react-i18next';

interface Props {
  delivery: ConsultationDelivery;
  isProvider: boolean;
}

export function CarePlanDocRoom({ delivery, isProvider }: Props) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith('zh');
  const docs = delivery.document_ids || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {zh ? '护理方案文档' : 'Care Plan Document'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {zh
            ? '医生将为患者定制书面护理方案 (PDF),包含用药、康复、随访建议。'
            : 'The provider will deliver a written care plan PDF including medications, rehab, and follow-up.'}
        </p>

        {docs.length === 0 ? (
          isProvider ? (
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {zh ? '上传护理方案 PDF' : 'Upload Care Plan PDF'}
            </Button>
          ) : (
            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              {zh ? '医生正在准备您的护理方案…' : 'The provider is preparing your care plan…'}
            </div>
          )
        ) : (
          <ul className="space-y-2">
            {docs.map((id) => (
              <li key={id} className="flex items-center justify-between rounded-md border p-3">
                <span className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  {zh ? '文档' : 'Document'} #{id}
                </span>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {delivery.care_plan_id && (
          <p className="text-xs text-muted-foreground">
            {zh ? '护理方案 ID' : 'Care Plan ID'}: {delivery.care_plan_id}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
