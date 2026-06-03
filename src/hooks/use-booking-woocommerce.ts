import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart, checkout, updateOrderStatus } from '@/services/woocommerce-api';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { getStoredWPUser } from '@/services/wp-auth';
import i18next from 'i18next';

const Z = (cn: string, en: string) => (i18next.language?.startsWith('zh') ? cn : en);

/**
 * Hook to create a booking via WooCommerce order.
 * Bookings ARE WooCommerce orders — the schema maps WC orders to Booking objects.
 */
export function useCreateBookingWithWooCommerce() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (bookingData: {
      product_id?: number;
      provider_id: string;
      appointment_date: string;
      appointment_time: string;
      duration_hour: number;
      service_type: string;
      hourly_rate: number;
      total_cost: number;
      special_instruction?: string | null;
      status?: string;
      payment_status?: string;
      resource_id?: number;
    }) => {
      const wpUser = getStoredWPUser();
      if (!wpUser?.user_id) throw new Error('Not authenticated');
      const userId = `wp-${wpUser.user_id}`;

      if (!bookingData.product_id) throw new Error('Booking product is required');

      await addToCart({
        productId: bookingData.product_id,
        booking: {
          resourceId: bookingData.resource_id,
          startDate: bookingData.appointment_date,
          startTime: bookingData.appointment_time,
          durationHours: bookingData.duration_hour,
          serviceType: bookingData.service_type,
          notes: bookingData.special_instruction || undefined,
        },
      });
      const wcOrder = await checkout({ email: wpUser.user_email || '' });

      if (!wcOrder || !wcOrder.id) {
        throw new Error('Failed to create WooCommerce order');
      }

      return { booking: { id: String(wcOrder.id), status: 'pending' }, wcOrder };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      toast({
        title: t('bookings.bookingCreated'),
        description: Z('订单已创建并下单', 'Booking created and order placed'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('bookings.bookingFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to confirm a booking (provider accepts) — updates WC order to "processing"
 */
export function useConfirmBookingWithWooCommerce() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      bookingId,
      wcOrderId,
    }: {
      bookingId: string;
      wcOrderId?: string;
    }) => {
      const orderId = wcOrderId || bookingId;
      await updateOrderStatus(parseInt(orderId), 'processing');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      toast({ title: Z('预约已确认', 'Booking confirmed') });
    },
  });
}

/**
 * Hook to complete a booking — updates WC order to "completed"
 */
export function useCompleteBookingWithWooCommerce() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      bookingId,
      wcOrderId,
    }: {
      bookingId: string;
      wcOrderId?: string;
    }) => {
      const orderId = wcOrderId || bookingId;
      await updateOrderStatus(parseInt(orderId), 'completed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      toast({ title: Z('预约已完成', 'Booking completed') });
    },
  });
}

/**
 * Hook to cancel a booking — updates WC order to "cancelled"
 */
export function useCancelBookingWithWooCommerce() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      bookingId,
      wcOrderId,
    }: {
      bookingId: string;
      wcOrderId?: string;
      cancelledBy: 'user' | 'provider';
    }) => {
      const orderId = wcOrderId || bookingId;
      await updateOrderStatus(parseInt(orderId), 'cancelled');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      toast({ title: Z('预约已取消', 'Booking cancelled') });
    },
  });
}
