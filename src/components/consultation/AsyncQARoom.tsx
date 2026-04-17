import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload } from 'lucide-react';
import type { ConsultationDelivery } from '@/types/consultation';
import { useTranslation } from 'react-i18next';

interface Props {
  delivery: ConsultationDelivery;
  isProvider: boolean;
}

export function AsyncQARoom({ delivery, isProvider }: Props) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith('zh');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {zh ? '异步图文问诊' : 'Async Q&A Consultation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          {zh
            ? '上传症状描述、图片、化验单,医生将在 24 小时内书面回复。'
            : 'Upload your symptoms, photos, lab reports — the provider will reply in writing within 24 hours.'}
        </div>

        {!isProvider && (
          <div className="space-y-2">
            <Label>{zh ? '您的问题' : 'Your question'}</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={zh ? '请详细描述您的症状、病史、用药情况…' : 'Describe your symptoms, history, current medications…'}
              rows={5}
            />
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {zh ? '上传图片/化验单' : 'Attach images / lab reports'}
            </Button>
            <Button className="w-full" disabled={!question.trim()}>
              {zh ? '提交问题' : 'Submit Question'}
            </Button>
          </div>
        )}

        {isProvider && (
          <div className="space-y-2">
            <Label>{zh ? '书面回复' : 'Written response'}</Label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={zh ? '请提供专业建议、注意事项、转诊建议…' : 'Provide your assessment, recommendations, follow-up…'}
              rows={8}
            />
            <Button className="w-full" disabled={!answer.trim()}>
              {zh ? '发送回复' : 'Send Response'}
            </Button>
          </div>
        )}

        {delivery.async_post_id && (
          <p className="text-xs text-muted-foreground">
            {zh ? '问答 ID' : 'Thread ID'}: {delivery.async_post_id}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
