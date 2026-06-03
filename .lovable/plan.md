## What "live snippets" means

Two custom PHP files I deployed via WP Code Snippets earlier:

- `careconnect-cart.php` → `POST/GET/DELETE /wp-json/careconnect/v1/cart[...]`
- `careconnect-checkout.php` → `POST /wp-json/careconnect/v1/checkout`

They exist only because WooCommerce REST v3 (`/wc/v3/orders`) is order-centric and has no session cart, and because WC Bookings line meta is awkward to pass through `/wc/v3/orders` directly. They are real WP-side code — exactly the "custom built shit" you don't want.

## The native replacement

WooCommerce ships **Store API** in core (no plugin, no snippet):

| Action | Native endpoint |
|---|---|
| Read cart | `GET  /wp-json/wc/store/v1/cart` |
| Add item (+ booking meta as `extensions`) | `POST /wp-json/wc/store/v1/cart/add-item` |
| Update qty | `POST /wp-json/wc/store/v1/cart/update-item` |
| Remove | `POST /wp-json/wc/store/v1/cart/remove-item` |
| Clear | `DELETE /wp-json/wc/store/v1/cart/items` |
| Apply coupon | `POST /wp-json/wc/store/v1/cart/apply-coupon` |
| Place order | `POST /wp-json/wc/store/v1/checkout` |

Auth: `Cart-Token` header (Store API issues one on first GET; we persist it client-side). Dokan vendor attribution, WC Bookings auto-creation, taxes, coupons, fees, gateway selection — all run in the native path automatically.

Refunds / order notes / reviews / products / availability already go through `/wc/v3/*` and `/wc-bookings/v1/*` — those stay.

## Refactor scope (frontend only — no WP changes)

1. **`src/services/woocommerce-api.ts`**
   - Replace `ccCartFetch` with `storeApiFetch` that hits `/wc/store/v1/*` and persists the `Cart-Token` response header in `localStorage`.
   - Rewrite `getCart`, `addToCart`, `removeCartItem`, `clearCart`, `checkout` to use Store API shape (`extensions.bookings` for WC Bookings line meta — the standard slot the WC Bookings team uses for Store API).
   - Delete `link-booking-child` and `booking-debug` helpers (only existed to patch around the custom cart bridge).

2. **Cart UI (`src/hooks/use-cart.ts`, `src/pages/Cart.tsx`)** — no API changes, signatures stay the same.

3. **Checkout response** — Store API returns `payment_result.payment_details` + `order_id` + `order_key`; map those to the existing `{order_id, payment_url}` shape so `useCheckout` and `CaregiverProfile.tsx` keep working.

4. **WP snippet cleanup** — once Store API is verified end-to-end, the two `careconnect-*.php` snippets in `wp-plugins/snippets/` can be deactivated on WP (you do this in the Snippets UI; I won't touch WP). The files stay in the repo as `.deprecated` for reference.

## Risk

The one gotcha: WC Bookings' Store API extension passes booking data as `extensions: { bookings: { ... } }`. If a particular WC Bookings version doesn't accept that, the fallback is `/wc-bookings/v1/products/{id}/booking` (validate slot) followed by Store API add-item — also fully native, still zero custom PHP.

## Out of scope

- No DB/CCT/relation changes.
- No WP plugin install or admin clicks. You deactivate the two old snippets when ready.
- No changes to GPS, AI, messaging, dashboards.

Approve and I'll do the refactor in one pass.
