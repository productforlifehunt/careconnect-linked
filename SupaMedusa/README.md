# SupaMedusa

> **Medusa v2 commerce engine on Supabase — 100% data model match, zero extra servers.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is this?

SupaMedusa replicates the **entire Medusa v2 data model** on Supabase (Postgres + Edge Functions).  
Drop it into any Supabase project and get a full e-commerce backend — no Node.js server, no extra infra.

- **100% data model match** — every table, column, index, and constraint name is identical to Medusa v2
- **Any Medusa developer can work on it** — zero learning curve, zero "read this README to learn the differences"
- **Reusable** — install into any Supabase project with one command
- **Modular** — use the full schema or pick only the modules you need

---

## Quick Start

### Option 1: CLI (recommended)

```bash
# From your Supabase project root:
npx supamedusa install

# Or generate just the migration SQL:
npx supamedusa generate-migration
```

### Option 2: Copy manually

```bash
# Clone this repo
git clone https://github.com/your-org/supamedusa.git

# Copy the generated migration into your project
cp supamedusa/schema/*.sql your-project/supabase/migrations/

# Copy edge functions
cp -r supamedusa/functions/* your-project/supabase/functions/
```

### Option 3: Programmatic (Node.js)

```js
const { getFullSchema, getModuleSchema, listModules } = require("supamedusa");

// Get all modules
console.log(listModules());
// ['product', 'cart', 'customer', 'order', 'payment', ...]

// Get full SQL
const sql = getFullSchema();

// Get only specific modules
const sql = getModuleSchema(["product", "cart", "customer"]);
```

---

## Project Structure

```
SupaMedusa/
├── package.json           # npm package, CLI entry
├── index.js               # Programmatic API
├── bin/
│   └── cli.js             # CLI: install, generate-migration, deploy-functions
├── schema/                # 26 SQL modules — one file per Medusa module
│   ├── 00_extensions.sql          # Required PG extensions
│   ├── 01_product.sql             # Products, variants, options, images, tags, categories
│   ├── 02_cart.sql                # Carts, line items, shipping methods, credit lines
│   ├── 03_customer.sql            # Customers, addresses, groups
│   ├── 04_order.sql               # Orders, returns, exchanges, claims, credit lines
│   ├── 05_payment.sql             # Payment collections, sessions, captures, refunds
│   ├── 06_pricing.sql             # Price sets, rules, price lists, price preferences
│   ├── 07_promotion.sql           # Promotions, campaigns, application methods
│   ├── 08_fulfillment.sql         # Fulfillment sets, shipping options, profiles
│   ├── 09_inventory.sql           # Inventory items, levels, reservations
│   ├── 10_region.sql              # Regions, countries
│   ├── 11_tax.sql                 # Tax providers, regions, rates, rules
│   ├── 12_store.sql               # Store, currencies, locales
│   ├── 13_sales_channel.sql       # Sales channels
│   ├── 14_user_auth.sql           # Users, invites, auth & provider identities
│   ├── 15_api_key.sql             # API keys
│   ├── 16_currency.sql            # Currency reference
│   ├── 17_stock_location.sql      # Stock locations & addresses
│   ├── 18_notification.sql        # Notifications & providers
│   ├── 19_rbac.sql                # Roles, policies, role hierarchies
│   ├── 20_settings.sql            # User preferences, view configurations
│   ├── 21_link_modules.sql        # 23 cross-module link/pivot tables
│   ├── 22_workflow.sql            # Workflow execution engine
│   ├── 23_index.sql               # Index data, relations, metadata, sync
│   ├── 24_translation.sql         # Locales, translations, settings
│   └── 25_locking.sql             # Distributed locking (postgres provider)
├── functions/             # Supabase Edge Functions (Medusa API parity)
│   ├── products/
│   ├── carts/
│   ├── orders/
│   └── ...
└── docs/
    └── upstream-model-inventory.md
```

---

## Schema Modules

| # | Module | Key Tables | Description |
|---|--------|------------|-------------|
| 00 | Extensions | — | Required PG extensions (uuid-ossp, pg_trgm) |
| 01 | Product | product, product_variant, product_option, product_option_value, product_tag, product_type, product_collection, product_category, image, product_variant_product_image | Core catalog (11 tables) |
| 02 | Cart | cart, cart_address, cart_line_item, cart_shipping_method, credit_line + tax/adjustment lines | Shopping cart (9 tables) |
| 03 | Customer | customer, customer_address, customer_group, customer_group_customer | Customers (4 tables) |
| 04 | Order | order, order_item, order_line_item, order_shipping, order_change, order_change_action, return, return_item, order_exchange, order_exchange_item, order_claim, order_claim_item, order_credit_line + tax/adjustment lines | Orders & post-purchase (20 tables) |
| 05 | Payment | payment_collection, payment_session, payment, capture, refund, account_holder, payment_provider | Payments (8 tables) |
| 06 | Pricing | price_set, price, price_list, price_rule, price_list_rule, rule_type | Dynamic pricing (8 tables) |
| 07 | Promotion | promotion, promotion_campaign, promotion_campaign_budget, promotion_application_method, promotion_rule + pivot tables | Discounts (9 tables) |
| 08 | Fulfillment | fulfillment_set, fulfillment_provider, service_zone, geo_zone, shipping_option, shipping_profile, fulfillment, fulfillment_item, fulfillment_label | Shipping & fulfillment (12 tables) |
| 09 | Inventory | inventory_item, inventory_level, reservation_item | Stock management (3 tables) |
| 10 | Region | region, region_country | Regions & countries (2 tables) |
| 11 | Tax | tax_provider, tax_region, tax_rate, tax_rate_rule | Tax engine (4 tables) |
| 12 | Store | store | Store config (1 table) |
| 13 | Sales Channel | sales_channel | Multi-channel (1 table) |
| 14 | User & Auth | user, invite, auth_identity, provider_identity | Users & auth (4 tables) |
| 15 | API Key | api_key | API key management (1 table) |
| 16 | Currency | currency | Currency reference (1 table) |
| 17 | Stock Location | stock_location, stock_location_address | Warehouse locations (2 tables) |
| 18 | Notification | notification, notification_provider | Notifications (2 tables) |
| 19 | RBAC | rbac_role, rbac_policy, rbac_role_parent, rbac_role_policy | Role-based access (4 tables) |
| 20 | Settings | user_preference, view_configuration | User settings (2 tables) |
| 21 | Link Modules | 23 cross-module join tables (cart↔payment, order↔fulfillment, product↔sales_channel, variant↔price_set, variant↔inventory, etc.) | Module wiring |
| 22 | Workflow | workflow_execution | Workflow engine (1 table) |
| 23 | Index | index_data (partitioned), index_relation (partitioned), index_metadata, index_sync | Search index (4 tables) |
| 24 | Translation | locale, translation, translation_settings | i18n (3 tables) |
| 25 | Locking | locking | Distributed locks (1 table) |

**Total: 150 tables across 26 schema files — 100% Medusa v2 data model.**

---

## Compatibility

### Data Model: 100% Match
Every table name, column name, column type, index, and constraint is identical to Medusa v2.  
A developer who knows Medusa will never misspell a column name.

### Feature Parity: Target 99%
Edge Functions replicate Medusa's API surface for CRUD and business logic.

### Plugin Compatibility
Medusa plugins that only use existing tables/columns work via the Edge Functions API.  
Plugins that add new tables are out of scope (they need Medusa's MikroORM runtime).

---

## Upstream Source

Schema is extracted from Medusa v2 (`develop` branch) MikroORM migration files.  
See `docs/upstream-model-inventory.md` for the full extraction inventory.

---

## License

MIT
