/**
 * Quote → WooCommerce hidden product helper.
 *
 * When a chat participant accepts a quote, we create a one-off hidden
 * WC product priced at the agreed amount. The product is owned by the
 * vendor (seller) so Dokan automatically applies the configured commission
 * when the order is placed.
 *
 * We use type=simple (not booking) because:
 *  - Date/time is already negotiated in chat — no slot picker needed
 *  - Simple products are 100% Dokan-compatible for commission
 *  - Cart/checkout flow is the standard Woo path
 */

import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";
import { getWPToken } from "@/services/wp-auth";
import type { QuoteData } from "@/lib/quote-protocol";
import { createServiceProduct } from "@/services/woocommerce-api";

function authHeaders(): Record<string, string> {
  return buildWPHeaders(getWPToken(), "application/json");
}

async function wcFetch(endpoint: string, init: RequestInit = {}) {
  const url = buildWPUrl(`wc/v3/${endpoint}`);
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...init.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WC API ${res.status}: ${text}`);
  }
  return res.json();
}

export interface CreateQuoteProductInput {
  quote: QuoteData;
  /** Vendor (seller / payee) WP user ID — required for Dokan commission to apply. */
  vendorUserId: string | number;
  /** Buyer name for product title context (optional). */
  buyerName?: string | undefined;
  /** Sender (the one who issued the quote) for context. */
  sellerName?: string | undefined;
}

/**
 * Create a hidden simple product priced at the agreed quote amount,
 * owned by the vendor so Dokan commission applies.
 * Returns the new product ID.
 */
export async function createQuoteProduct(
  input: CreateQuoteProductInput
): Promise<{ id: number; price: number }> {
  const { quote, vendorUserId, sellerName } = input;
  if (!quote.amount || quote.amount <= 0) {
    throw new Error("Quote amount must be greater than 0");
  }

  const label =
    quote.serviceType ||
    (quote.mode === "hourly" ? "Care Service (hourly)" : "Care Service (flat)");
  const name = sellerName
    ? `Custom Quote: ${label} — ${sellerName}`
    : `Custom Quote: ${label}`;

  const description =
    quote.mode === "hourly"
      ? `Negotiated rate: $${quote.ratePerHour}/hr × ${quote.hours}h = $${quote.amount}${quote.note ? `. Note: ${quote.note}` : ""}`
      : `Flat-rate quote: $${quote.amount}${quote.note ? `. Note: ${quote.note}` : ""}`;

  // Dokan needs the RAW numeric WP user id (not "wp-1"). Strip any prefix.
  const numericVendorId = String(vendorUserId).replace(/^wp-/, "");

  // Same minimal care keys as a normal booking: WooCommerce/Dokan only carry
  // the cart line, price and seller; everything else stays in the CCT records.
  const hourly = quote.mode === "hourly";
  const meta: Array<{ key: string; value: string }> = [
    { key: "_dokan_vendor_id", value: numericVendorId },
    { key: "_is_care_service_product", value: "1" },
    { key: "_care_service_label", value: label },
    { key: "_care_service_rate", value: String(hourly ? quote.ratePerHour ?? quote.amount : quote.amount) },
    { key: "_care_service_unit", value: hourly ? "hour" : "visit" },
    { key: "_care_service_quantity", value: String(hourly ? quote.hours ?? 1 : 1) },
  ];
  if (quote.delivery) meta.push({ key: "_care_service_delivery", value: quote.delivery });
  if (quote.note) meta.push({ key: "_care_service_notes", value: quote.note });
  if (quote.jobId != null) meta.push({ key: "_care_job_id", value: String(quote.jobId) });

  // Buyers have no wc/v3 product-create capability — the wp-admin-ops edge
  // function creates the hidden product with the store keys.
  return createServiceProduct({
    name,
    description,
    amount: quote.amount,
    vendorUserId: numericVendorId,
    meta,
  });
}
