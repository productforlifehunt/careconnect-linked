import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ConsultationDelivery } from '@/types/consultation';
import { useTranslation } from 'react-i18next';

interface Props {
  delivery: ConsultationDelivery;
  isProvider: boolean;
}

export function TextChatRoom({ delivery, isProvider }: Props) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith('zh');
  const convoId = delivery.conversation_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {zh ? '文字咨询' : 'Text Consultation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {zh
            ? '本次咨询通过站内即时消息进行,聊天记录会自动归档到本订单。'
            : 'This consultation uses the in-app chat. Messages are automatically archived to this order.'}
        </p>
        {convoId ? (
          <Button asChild className="w-full">
            <Link to={`/messages?conversation=${convoId}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {zh ? '打开聊天室' : 'Open Chat Room'}
            </Link>
          </Button>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            {isProvider
              ? (zh ? '等待系统创建聊天会话…' : 'Waiting for chat session to be created…')
              : (zh ? '医生即将与您建立连接…' : 'The provider will connect with you shortly…')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
