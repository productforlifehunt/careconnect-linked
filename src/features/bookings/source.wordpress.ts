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
  await updateOrderStatus(parseInt(id, 10), mapped as any);
}
