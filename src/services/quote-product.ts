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
  buyerName?: string;
  /** Sender (the one who issued the quote) for context. */
  sellerName?: string;
}

/**
 * Create a hidden simple product priced at the agreed quote amount,
 * owned by the vendor so Dokan commission applies.
 * Returns the new product ID.
 */
export async function createQuoteProduct(
  input: CreateQuoteProductInput
): Promise<{ id: number; price: number }> {
  const { quote, vendorUserId, buyerName, sellerName } = input;
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

  const meta: Array<{ key: string; value: string }> = [
    { key: "_quote_mode", value: quote.mode },
    { key: "_quote_amount", value: String(quote.amount) },
    { key: "_dokan_vendor_id", value: numericVendorId },
    { key: "_is_quote_product", value: "1" },
  ];
  if (quote.ratePerHour != null) meta.push({ key: "_quote_rate", value: String(quote.ratePerHour) });
  if (quote.hours != null) meta.push({ key: "_quote_hours", value: String(quote.hours) });
  if (quote.serviceType) meta.push({ key: "_quote_service_type", value: quote.serviceType });
  if (quote.delivery) meta.push({ key: "_quote_delivery", value: quote.delivery });
  if (quote.jobId != null) meta.push({ key: "_quote_job_id", value: String(quote.jobId) });
  if (buyerName) meta.push({ key: "_quote_buyer", value: buyerName });

  const payload = {
    name,
    type: "simple",
    description,
    short_description: description,
    regular_price: String(quote.amount),
    catalog_visibility: "hidden",
    status: "publish",
    virtual: true,
    downloadable: false,
    manage_stock: false,
    stock_status: "instock",
    meta_data: meta,
  };

  // Create via wc/v3 with admin/JWT — we set _dokan_vendor_id so Dokan picks
  // up the right vendor for commission split at order time.
  const product = await wcFetch("products", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return { id: Number(product.id), price: Number(product.regular_price || quote.amount) };
}
