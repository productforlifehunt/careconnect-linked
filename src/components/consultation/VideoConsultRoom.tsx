import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, ExternalLink, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateJitsiUrl, setMeetingUrl } from '@/services/consultation-delivery';
import type { ConsultationDelivery } from '@/types/consultation';
import { useTranslation } from 'react-i18next';

interface Props {
  delivery: ConsultationDelivery;
  isProvider: boolean;
  onRefresh: () => void;
}

export function VideoConsultRoom({ delivery, isProvider, onRefresh }: Props) {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const zh = i18n.language?.startsWith('zh');
  const [url, setUrl] = useState(delivery.meeting_url || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setUrl(delivery.meeting_url || ''); }, [delivery.meeting_url]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newUrl = generateJitsiUrl(delivery.order_id, delivery.item_id);
      await setMeetingUrl(delivery.order_id, delivery.item_id, newUrl);
      setUrl(newUrl);
      onRefresh();
      toast({ title: zh ? '会议室已创建' : 'Meeting room created' });
    } catch (e: any) {
      toast({ title: zh ? '创建失败' : 'Failed', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          {zh ? '视频问诊' : 'Video Consultation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!url ? (
          isProvider ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {zh ? '点击下方按钮生成 Jitsi 视频会议室,链接将自动发送给患者。' : 'Click below to create a secure Jitsi room. The patient will see the link instantly.'}
              </p>
              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                <Video className="mr-2 h-4 w-4" />
                {loading ? (zh ? '创建中…' : 'Creating…') : (zh ? '创建视频会议室' : 'Create Video Room')}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {zh ? '等待医生/护理者发起视频通话…' : 'Waiting for the provider to start the video call…'}
            </p>
          )
        ) : (
          <div className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              <iframe
                src={url}
                title="Jitsi Meet"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="h-full w-full border-0"
              />
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
              <code className="flex-1 truncate text-xs">{url}</code>
              <Button size="sm" variant="ghost" onClick={copyUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
