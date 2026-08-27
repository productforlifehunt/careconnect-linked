import type { Booking } from "@/types/care-connector";
import { wpFetchBookings, wpFetchProviderBookings } from "@/services/wp-data";
import { updateOrderStatus } from "@/services/woocommerce-api";

export async function fetchBookingsWordPress(): Promise<Booking[]> {
  try {
    return await wpFetchBookings() as unknown as Booking[];
  } catch {
    return [];
  }
}

export async function fetchProviderBookingsWordPress(): Promise<Booking[]> {
  try {
    return await wpFetchProviderBookings() as unknown as Booking[];
  } catch {
    return [];
  }
}

export async function createBookingWordPress(_booking: Partial<Booking>): Promise<Booking> {
  throw new Error("Use WooCommerce booking flow instead");
}

export async function updateBookingStatusWordPress(id: string, status: string): Promise<void> {
  const mapped = status === "confirmed"
    ? "processing"
    : status === "completed"
    ? "completed"
    : status === "pending"
    ? "on-hold"
    : status.startsWith("cancelled")
    ? "cancelled"
    : "pending";
  const order: any = await updateOrderStatus(parseInt(id, 10), mapped as any);

  // Notify both sides of the booking — non-blocking, never fails the update.
  try {
    const recipients: Array<string | number> = [];
    if (order?.customer_id) recipients.push(order.customer_id);
    const vendorMeta = Array.isArray(order?.meta_data)
      ? order.meta_data.find((m: any) => m?.key === "_dokan_vendor_id")
      : null;
    if (vendorMeta?.value) recipients.push(vendorMeta.value);
    if (recipients.length > 0) {
      const { notifyBookingStatus } = await import("@/features/notifications/notify-events");
      await notifyBookingStatus(recipients, id, status);
    }
  } catch { /* non-blocking */ }
}
