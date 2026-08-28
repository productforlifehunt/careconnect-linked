import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCart,
  addToCart,
  removeCartItem,
  clearCart,
  checkout,
  requestOrderRefund,
  resolveOrderRefund,
  getOrderNotes,
  addOrderCustomerNote,
} from '@/services/woocommerce-api';
import { useToast } from '@/hooks/use-toast';
import i18next from 'i18next';


const Z = (cn: string, en: string) => (i18next.language?.startsWith('zh') ? cn : en);

/**
 * Hook to fetch the current native WooCommerce cart through the headless bridge
 */
export function useCart() {
  return useQuery({
    queryKey: ['wc-cart'],
    queryFn: getCart,
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * Hook to add an item to the cart
 */
export function useAddToCart() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, quantity, booking }: {
      productId: number;
      quantity?: number;
      booking?: {
        resourceId?: number;
        persons?: Record<string | number, number>;
        startDate?: string;
        startTime?: string;
        durationHours?: number;
        serviceType?: string;
        notes?: string;
      };
    }) => addToCart({ productId, quantity, booking }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wc-cart'] });
      toast({ title: Z('已加入购物车', 'Added to cart') });
    },
    onError: (err: any) => {
      toast({ title: Z('加入购物车失败', 'Failed to add to cart'), description: err.message, variant: 'destructive' });
    },
  });
}

/**
 * Hook to remove an item from the cart
 */
export function useRemoveCartItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemKey: string) => removeCartItem(itemKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wc-cart'] });
    },
  });
}

/**
 * Hook to clear the entire cart
 */
export function useClearCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wc-cart'] });
    },
  });
}

/**
 * Hook to perform checkout via native WooCommerce checkout through the headless bridge
 */
export function useCheckout() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (billingData?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      address_1?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
    }) => checkout(billingData),

    onSuccess: async () => {
      // WooCommerce keeps a persistent cart for logged-in customers, and it can
      // resurrect lines from an abandoned session right after the order is
      // placed. Wipe it so the client never sees paid-for or stale bookings
      // sitting in the cart again.
      try {
        await clearCart();
      } catch {
        /* non-fatal: the order is already created */
      }
      qc.invalidateQueries({ queryKey: ['wc-cart'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      toast({ title: Z('订单已提交！', 'Order placed successfully!') });
    },
    onError: (err: any) => {
      toast({ title: Z('结算失败', 'Checkout failed'), description: err.message, variant: 'destructive' });
    },
  });
}

/**
 * Client asks the caregiver for a refund. The money only moves once the
 * caregiver approves, so this is a request — never a self-service payout.
 */
export function useRequestRefund() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, amount, reason }: { orderId: number; amount?: string; reason: string }) =>
      requestOrderRefund(orderId, { amount, reason }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      qc.invalidateQueries({ queryKey: ['order-notes', vars.orderId] });
      toast({
        title: Z('已提交退款申请', 'Refund requested'),
        description: Z('护理者会在预约详情里回复您。', 'The caregiver will respond in the booking thread.'),
      });
    },
    onError: (err: any) => {
      toast({ title: Z('退款申请失败', 'Refund request failed'), description: err.message, variant: 'destructive' });
    },
  });
}

/** Caregiver approves or declines an open refund request. */
export function useResolveRefund() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, decision, note }: { orderId: number; decision: 'approve' | 'decline'; note?: string }) =>
      resolveOrderRefund(orderId, decision, note),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      qc.invalidateQueries({ queryKey: ['order-notes', vars.orderId] });
      toast({
        title: vars.decision === 'approve'
          ? Z('退款已完成', 'Refund issued')
          : Z('已回复客户', 'Client notified'),
      });
    },
    onError: (err: any) => {
      toast({ title: Z('操作失败', 'Action failed'), description: err.message, variant: 'destructive' });
    },
  });
}

/** Shared message thread on a booking (issues and disputes). */
export function useOrderNotes(orderId?: number) {
  return useQuery({
    queryKey: ['order-notes', orderId],
    queryFn: () => getOrderNotes(Number(orderId)),
    enabled: !!orderId,
    staleTime: 15_000,
  });
}

export function useAddOrderNote() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, note }: { orderId: number; note: string }) =>
      addOrderCustomerNote(orderId, note),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['order-notes', vars.orderId] });
      toast({ title: Z('已发送', 'Message sent') });
    },
    onError: (err: any) => {
      toast({ title: Z('发送失败', 'Could not send'), description: err.message, variant: 'destructive' });
    },
  });
}

