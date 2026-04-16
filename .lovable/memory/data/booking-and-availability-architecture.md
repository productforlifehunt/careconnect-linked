---
name: Booking and Availability Architecture
description: WC Bookings bookable products for provider scheduling, with custom CCT availability schema design
type: feature
---

## Current Architecture (Refactored)

Provider products are now **WC Bookings `booking` type** (not `variable`).
- `getOrCreateProviderProduct()` creates type=`booking` via Dokan API
- `configureBookingProduct()` sets WC Bookings fields (duration, cost, pricing rules)
- Availability is managed natively by WC Bookings on the product
- Per-service pricing stored as WC Bookings cost rules + meta `_service_types`
- Slots API: `GET /wc-bookings/v1/products/slots`

## JetAppointments Status

Routes exist at `/jet-engine/v2/appointment-*` but:
- No services or providers configured yet
- Returns empty data; needs Service CPT → Product mapping in WP admin
- Can work as backup but requires GUI configuration of Service-Provider mapping

## Custom CCT Schema for Reusable Availability

If building a self-contained availability system via JetEngine CCTs:

### CCT 1: `provider_schedule` (Weekly recurring rules)
| Column | Type | Description |
|--------|------|-------------|
| _ID | INT AUTO | Primary key |
| provider_id | INT | User ID (linked via JetEngine Relation) |
| day_of_week | INT | 0=Sun, 1=Mon...6=Sat |
| start_time | VARCHAR(5) | "09:00" |
| end_time | VARCHAR(5) | "18:00" |
| is_available | TINYINT | 1=bookable, 0=blocked |
| service_type | VARCHAR(100) | Optional: filter by service |
| slot_duration_min | INT | Default 60 |
| buffer_min | INT | Gap between bookings |
| max_per_slot | INT | Max concurrent bookings, default 1 |
| timezone | VARCHAR(50) | e.g. "America/Los_Angeles" |

### CCT 2: `provider_override` (Date-specific overrides & blocks)
| Column | Type | Description |
|--------|------|-------------|
| _ID | INT AUTO | Primary key |
| provider_id | INT | User ID |
| override_date | DATE | Specific date |
| start_time | VARCHAR(5) | Null = whole day |
| end_time | VARCHAR(5) | Null = whole day |
| is_available | TINYINT | 1=available, 0=blocked |
| reason | VARCHAR(255) | "Holiday", "Personal" |
| recur_yearly | TINYINT | For annual holidays |

### CCT 3: `booking_slot` (Actual bookings / reservations)
| Column | Type | Description |
|--------|------|-------------|
| _ID | INT AUTO | Primary key |
| provider_id | INT | User ID |
| client_id | INT | Booking client user ID |
| woo_order_id | INT | Link to WooCommerce order |
| woo_product_id | INT | Link to WC product |
| service_type | VARCHAR(100) | Service booked |
| booking_date | DATE | Date of appointment |
| start_time | VARCHAR(5) | Start time |
| end_time | VARCHAR(5) | End time |
| status | VARCHAR(20) | pending/confirmed/completed/cancelled |
| notes | TEXT | Special instructions |
| ical_uid | VARCHAR(255) | Unique iCal event ID for sync |

### Relations (JetEngine Relations)
1. **User ↔ provider_schedule** (one-to-many): User's weekly schedule
2. **User ↔ provider_override** (one-to-many): User's date overrides
3. **User ↔ booking_slot** (one-to-many, as provider): Provider's bookings
4. **User ↔ booking_slot** (one-to-many, as client): Client's bookings
5. **booking_slot ↔ WC Product** (many-to-one): Link to WooCommerce product

### Calendar Sync (iCalendar/ICS)
To connect with Google Calendar, Apple Calendar:
- **Export**: Generate `.ics` feed from `provider_schedule` + `booking_slot`
  - Use `VEVENT` with `DTSTART`, `DTEND`, `RRULE` for recurring
  - Each booking_slot gets a unique `UID` (stored in `ical_uid`)
  - Serve as a public ICS URL: `/wp-json/cc/v1/calendar/{provider_id}.ics`
- **Import**: Parse `.ics` file to create `provider_override` entries
- **Sync**: Use CalDAV or webhook for bidirectional (complex)
- **Format**: Standard iCalendar RFC 5545
  - `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR` for weekday schedules
  - `DTSTART:20250416T090000` / `DTEND:20250416T180000`

### WC Bookings vs Custom CCT Comparison
| Feature | WC Bookings | Custom CCTs |
|---------|-------------|-------------|
| Product binding | Native | Manual via relation |
| Slot blocking | Automatic | Must implement |
| Calendar sync | Built-in Google Cal | Must build ICS feed |
| Dokan vendor UI | Supported | Must build UI |
| Pricing rules | Built-in | Must implement |
| Checkout flow | Native WC | Must integrate |
| Complexity | Low | High |

**Recommendation**: Use WC Bookings as primary. Custom CCTs only if WC Bookings limitations are hit.
