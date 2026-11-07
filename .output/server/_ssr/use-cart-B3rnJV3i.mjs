import "../_runtime.mjs";
import { t as instance } from "../_libs/i18next.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as checkout, c as getCart, f as removeCartCoupon, g as resolveOrderRefund, m as requestOrderRefund, n as addToCart, o as clearCart, p as removeCartItem, r as applyCartCoupon, t as addOrderCustomerNote, u as getOrderNotes, v as updateCartItemQuantity } from "./woocommerce-api-BoF1FQHg.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-cart-B3rnJV3i.js
var Z = (cn, en) => instance.language?.startsWith("zh") ? cn : en;
/**
* Hook to fetch the current native WooCommerce cart through the headless bridge
*/
function useCart() {
	return useQuery({
		queryKey: ["wc-cart"],
		queryFn: getCart,
		staleTime: 3e4,
		retry: 1
	});
}
/**
* Hook to add an item to the cart
*/
function useAddToCart() {
	const qc = useQueryClient();
	const { toast } = useToast();
	return useMutation({
		mutationFn: ({ productId, quantity, booking }) => addToCart({
			productId,
			quantity,
			booking
		}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["wc-cart"] });
			toast({ title: Z("已加入购物车", "Added to cart") });
		},
		onError: (err) => {
			toast({
				title: Z("加入购物车失败", "Failed to add to cart"),
				description: err.message,
				variant: "destructive"
			});
		}
	});
}
/**
* Hook to remove an item from the cart
*/
function useRemoveCartItem() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (itemKey) => removeCartItem(itemKey),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["wc-cart"] });
		}
	});
}
/** Change the quantity of a single cart line (0 removes it). */
function useUpdateCartQuantity() {
	const qc = useQueryClient();
	const { toast } = useToast();
	return useMutation({
		mutationFn: ({ itemKey, quantity }) => updateCartItemQuantity(itemKey, quantity),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["wc-cart"] });
		},
		onError: (err) => {
			toast({
				title: Z("数量更新失败", "Could not update quantity"),
				description: err.message,
				variant: "destructive"
			});
		}
	});
}
/** Apply a WooCommerce coupon to the cart. */
function useApplyCoupon() {
	const qc = useQueryClient();
	const { toast } = useToast();
	return useMutation({
		mutationFn: (code) => applyCartCoupon(code),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["wc-cart"] });
			toast({ title: Z("优惠码已使用", "Coupon applied") });
		},
		onError: (err) => {
			toast({
				title: Z("优惠码无效", "Coupon not accepted"),
				description: err.message,
				variant: "destructive"
			});
		}
	});
}
/** Remove a coupon from the cart. */
function useRemoveCoupon() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (code) => removeCartCoupon(code),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["wc-cart"] });
		}
	});
}
/**
* Hook to clear the entire cart
*/
function useClearCart() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => clearCart(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["wc-cart"] });
		}
	});
}
/**
* Hook to perform checkout via native WooCommerce checkout through the headless bridge
*/
function useCheckout() {
	const qc = useQueryClient();
	const { toast } = useToast();
	return useMutation({
		mutationFn: (billingData) => checkout(billingData),
		onSuccess: async () => {
			try {
				await clearCart();
			} catch {}
			qc.invalidateQueries({ queryKey: ["wc-cart"] });
			qc.invalidateQueries({ queryKey: ["bookings"] });
			qc.invalidateQueries({ queryKey: ["providerBookings"] });
			toast({ title: Z("订单已提交！", "Order placed successfully!") });
		},
		onError: (err) => {
			toast({
				title: Z("结算失败", "Checkout failed"),
				description: err.message,
				variant: "destructive"
			});
		}
	});
}
/**
* Client asks the caregiver for a refund. The money only moves once the
* caregiver approves, so this is a request — never a self-service payout.
*/
function useRequestRefund() {
	const qc = useQueryClient();
	const { toast } = useToast();
	return useMutation({
		mutationFn: ({ orderId, amount, reason }) => requestOrderRefund(orderId, {
			amount,
			reason
		}),
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: ["bookings"] });
			qc.invalidateQueries({ queryKey: ["providerBookings"] });
			qc.invalidateQueries({ queryKey: ["order-notes", vars.orderId] });
			toast({
				title: Z("已提交退款申请", "Refund requested"),
				description: Z("护理者会在预约详情里回复您。", "The caregiver will respond in the booking thread.")
			});
		},
		onError: (err) => {
			toast({
				title: Z("退款申请失败", "Refund request failed"),
				description: err.message,
				variant: "destructive"
			});
		}
	});
}
/** Caregiver approves or declines an open refund request. */
function useResolveRefund() {
	const qc = useQueryClient();
	const { toast } = useToast();
	return useMutation({
		mutationFn: ({ orderId, decision, note }) => resolveOrderRefund(orderId, decision, note),
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: ["bookings"] });
			qc.invalidateQueries({ queryKey: ["providerBookings"] });
			qc.invalidateQueries({ queryKey: ["order-notes", vars.orderId] });
			toast({ title: vars.decision === "approve" ? Z("退款已完成", "Refund issued") : Z("已回复客户", "Client notified") });
		},
		onError: (err) => {
			toast({
				title: Z("操作失败", "Action failed"),
				description: err.message,
				variant: "destructive"
			});
		}
	});
}
/** Shared message thread on a booking (issues and disputes). */
function useOrderNotes(orderId) {
	return useQuery({
		queryKey: ["order-notes", orderId],
		queryFn: () => getOrderNotes(Number(orderId)),
		enabled: !!orderId,
		staleTime: 15e3
	});
}
function useAddOrderNote() {
	const qc = useQueryClient();
	const { toast } = useToast();
	return useMutation({
		mutationFn: ({ orderId, note }) => addOrderCustomerNote(orderId, note),
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: ["order-notes", vars.orderId] });
			toast({ title: Z("已发送", "Message sent") });
		},
		onError: (err) => {
			toast({
				title: Z("发送失败", "Could not send"),
				description: err.message,
				variant: "destructive"
			});
		}
	});
}
//#endregion
export { useCheckout as a, useRemoveCartItem as c, useResolveRefund as d, useUpdateCartQuantity as f, useCart as i, useRemoveCoupon as l, useAddToCart as n, useClearCart as o, useApplyCoupon as r, useOrderNotes as s, useAddOrderNote as t, useRequestRefund as u };
