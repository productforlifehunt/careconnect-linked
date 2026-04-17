import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { fetchConsultation, confirmDelivery, markDelivered } from '@/services/consultation-delivery';
import { VideoConsultRoom } from '@/components/consultation/VideoConsultRoom';
import { TextChatRoom } from '@/components/consultation/TextChatRoom';
import { AsyncQARoom } from '@/components/consultation/AsyncQARoom';
import { CarePlanDocRoom } from '@/components/consultation/CarePlanDocRoom';
import { SOAPNoteForm } from '@/components/consultation/SOAPNoteForm';
import { DELIVERY_LABELS } from '@/types/consultation';
import { getStoredWPUser } from '@/services/wp-auth';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

export default function ConsultationRoom() {
  const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const zh = i18n.language?.startsWith('zh');
  const wpUser = getStoredWPUser();
  const userId = wpUser?.user_id ? String(wpUser.user_id) : '';

  const oid = Number(orderId);
  const iid = Number(itemId);

  const { data: delivery, isLoading, refetch } = useQuery({
    queryKey: ['consultation', oid, iid],
    queryFn: () => fetchConsultation(oid, iid),
    enabled: !!oid && !!iid,
  });

  // Heuristic: if logged-in user sold this product (vendor) → provider mode.
  // Until we wire vendor lookup, we treat presence of `?provider=1` query as override.
  const [isProvider, setIsProvider] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsProvider(params.get('provider') === '1');
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{zh ? '问诊未找到' : 'Consultation not found'}</p>
            <Button variant="ghost" onClick={() => navigate('/bookings')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {zh ? '返回预约' : 'Back to Bookings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const label = DELIVERY_LABELS[delivery.delivery_type];

  const handleConfirm = async () => {
    try {
      await confirmDelivery(delivery.order_id, delivery.item_id);
      toast({ title: zh ? '已确认收货,款项将释放给医生' : 'Confirmed — payment released to provider' });
      refetch();
    } catch (e: any) {
      toast({ title: zh ? '确认失败' : 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await markDelivered(delivery.order_id, delivery.item_id);
      toast({ title: zh ? '已标记交付,等待患者确认' : 'Marked delivered — awaiting buyer sign-off' });
      refetch();
    } catch (e: any) {
      toast({ title: zh ? '操作失败' : 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    pending: 'outline',
    in_progress: 'secondary',
    delivered: 'secondary',
    confirmed: 'default',
    auto_confirmed: 'default',
    disputed: 'outline',
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {zh ? '返回' : 'Back'}
        </Button>
        <Badge variant={statusVariant[delivery.delivery_status] || 'outline'}>
          {delivery.delivery_status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{zh ? label.zh : label.en}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {zh ? '订单' : 'Order'} #{delivery.order_id} · {zh ? '项目' : 'Item'} #{delivery.item_id}
          </p>
        </CardHeader>
      </Card>

      {delivery.delivery_type === 'video' && (
        <VideoConsultRoom delivery={delivery} isProvider={isProvider} onRefresh={refetch} />
      )}
      {delivery.delivery_type === 'text' && (
        <TextChatRoom delivery={delivery} isProvider={isProvider} />
      )}
      {delivery.delivery_type === 'async' && (
        <AsyncQARoom delivery={delivery} isProvider={isProvider} />
      )}
      {delivery.delivery_type === 'care_plan' && (
        <CarePlanDocRoom delivery={delivery} isProvider={isProvider} />
      )}

      {isProvider && (
        <SOAPNoteForm
          orderId={delivery.order_id}
          itemId={delivery.item_id}
          providerId={userId}
          initial={delivery.soap}
          onSaved={refetch}
        />
      )}

      {!isProvider && delivery.soap?.signed_at && (
        <Card>
          <CardHeader>
            <CardTitle>{zh ? '医生记录' : "Provider's Note"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><strong>S:</strong> {delivery.soap.subjective}</div>
            <div><strong>O:</strong> {delivery.soap.objective}</div>
            <div><strong>A:</strong> {delivery.soap.assessment}</div>
            <div><strong>P:</strong> {delivery.soap.plan}</div>
          </CardContent>
        </Card>
      )}

      {/* Sign-off / delivery actions */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          {isProvider && delivery.delivery_status !== 'confirmed' && delivery.delivery_status !== 'delivered' && (
            <Button onClick={handleMarkDelivered}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {zh ? '标记完成交付' : 'Mark Delivered'}
            </Button>
          )}
          {!isProvider && delivery.delivery_status === 'delivered' && (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                {zh ? '7 天后自动确认' : 'Auto-confirms in 7 days'}
              </div>
              <Button onClick={handleConfirm}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {zh ? '确认收货并放款' : 'Confirm & Release Payment'}
              </Button>
            </>
          )}
          {delivery.delivery_status === 'confirmed' && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-5 w-5" />
              {zh ? '已完成,款项已释放' : 'Completed — payment released'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
