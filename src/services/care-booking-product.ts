/**
 * Just-in-time care service product.
 *
 * Per the data dictionary, a caregiver's services and rates live only in the
 * JetEngine CCT ("护理者的护理服务只使用我们的CCT来储存"). WooCommerce is
 * touched for the first time at the exact moment the client adds a service to
 * the cart — this helper creates that one product, owned by the caregiver so
 * Dokan commission and payout apply, and returns its product id.
 *
 * It reuses the elevated `careconnect/v1/quote-product` endpoint because buyers
 * do not have wc/v3 product-create capabilities.
 */

import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";
import { getWPToken } from "@/services/wp-auth";

export interface CreateCareBookingProductInput {
  /** Caregiver (vendor / payee) WP user id — "wp-12" or 12 both accepted. */
  vendorUserId: string | number;
  /** Caregiver display name, used in the product title. */
  vendorName?: string;
  /** Care service label from the dictionary catalogue (a68 option label). */
  serviceLabel: string;
  /** Delivery mode slug from a65: "in-person" | "remote". */
  delivery?: string;
  /** Published rate the client is booking at. */
  rate: number;
  /** Hours booked (1 for per-visit services like check-ins). */
  hours: number;
  /** Whether the rate is per hour or per occurrence. */
  unit: "hour" | "visit";
  startDate?: string;
  startTime?: string;
  notes?: string;
}

export async function createCareBookingProduct(
  input: CreateCareBookingProductInput,
): Promise<{ id: number; price: number }> {
  const { vendorUserId, vendorName, serviceLabel, delivery, rate, hours, unit } = input;
  const quantity = unit === "hour" ? hours : Math.max(1, Math.round(hours));
  const amount = Math.round(rate * quantity * 100) / 100;
  if (!(amount > 0)) throw new Error("Service price must be greater than 0");

  const numericVendorId = String(vendorUserId).replace(/^wp-/, "");

  const name = vendorName
    ? `${serviceLabel} — ${vendorName}`
    : serviceLabel;
  const description = unit === "hour"
    ? `${serviceLabel}: $${rate}/hr × ${quantity}h = $${amount}`
    : `${serviceLabel}: $${rate} × ${quantity} = $${amount}`;

  const meta: Array<{ key: string; value: string }> = [
    { key: "_dokan_vendor_id", value: numericVendorId },
    { key: "_is_care_service_product", value: "1" },
    { key: "_care_service_label", value: serviceLabel },
    { key: "_care_service_rate", value: String(rate) },
    { key: "_care_service_unit", value: unit },
    { key: "_care_service_quantity", value: String(quantity) },
  ];
  if (delivery) meta.push({ key: "_care_service_delivery", value: delivery });
  if (input.startDate) meta.push({ key: "_care_service_start_date", value: input.startDate });
  if (input.startTime) meta.push({ key: "_care_service_start_time", value: input.startTime });
  if (input.notes) meta.push({ key: "_care_service_notes", value: input.notes });

  const res = await fetch(buildWPUrl("careconnect/v1/quote-product"), {
    method: "POST",
    headers: buildWPHeaders(getWPToken(), "application/json"),
    body: JSON.stringify({
      amount,
      vendor_user_id: Number(numericVendorId),
      name,
      description,
      meta,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Care service product API ${res.status}: ${text}`);
  }
  const product = await res.json();
  return { id: Number(product.id), price: Number(product.price || amount) };
}
