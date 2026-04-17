import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCart,
  addToCart,
  removeCartItem,
  clearCart,
  checkout,
  createOrderRefund,
} from '@/services/woocommerce-api';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch the current WooCommerce cart
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
      toast({ title: 'Added to cart' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to add to cart', description: err.message, variant: 'destructive' });
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
 * Hook to perform checkout via WooCommerce Store API
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
    }) => checkout(billingData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wc-cart'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      toast({ title: 'Order placed successfully!' });
    },
    onError: (err: any) => {
      toast({ title: 'Checkout failed', description: err.message, variant: 'destructive' });
    },
  });
}

/**
 * Hook to request a refund for an order
 */
export function useRequestRefund() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, amount, reason }: { orderId: number; amount?: string; reason?: string }) =>
      createOrderRefund(orderId, { amount, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['providerBookings'] });
      toast({ title: 'Refund requested', description: 'Your refund request has been submitted.' });
    },
    onError: (err: any) => {
      toast({ title: 'Refund failed', description: err.message, variant: 'destructive' });
    },
  });
}
