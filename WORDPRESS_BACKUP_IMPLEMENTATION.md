# WordPress Backup Database Implementation Summary

## What I've Created

### 1. WordPress Client Library (`src/lib/wordpress-client.ts`)
A Supabase-like client for WordPress REST API with methods for:
- User management (`getCurrentUser`, `getUser`, `updateUser`)
- Custom Post Types (`getCPT`, `createCPT`, `updateCPT`, `deleteCPT`)
- WooCommerce orders (`getOrders`, `getOrder`, `createOrder`)
- WooCommerce products (`getProducts`, `getProduct`)
- WooCommerce Bookings (`getBookings`, `getBooking`, `createBooking`)

### 2. Database Adapter (`src/lib/database-adapter.ts`)
Unified interface that automatically switches between Supabase and WordPress:
- Health check every 30 seconds
- Automatic failover when Supabase is down
- Automatic recovery when Supabase comes back online
- Unified API for both providers
- Manual provider switching for testing

### 3. Setup Documentation (`WORDPRESS_AUTH_SETUP.md`)
Complete guide for:
- Installing JWT Authentication plugin
- Installing OAuth/Social Login plugins (Nextend or Super Socializer)
- Configuring Google OAuth
- Testing authentication
- Troubleshooting common issues

### 4. Test Script (`test-wp-auth.js`)
Node.js script to verify:
- WordPress REST API accessibility
- Application Password authentication
- JWT token generation and usage
- WooCommerce API access

## What You Need to Do

### Step 1: Generate Application Password (Easiest - 2 minutes)
1. Go to http://170.106.171.59:8080/wp-admin/profile.php
2. Scroll to "Application Passwords"
3. Enter name: "CareConnect Backup App"
4. Click "Add New Application Password"
5. Copy the password (format: `xxxx xxxx xxxx xxxx xxxx xxxx`)
6. Add to `.env`:
   ```
   VITE_WP_USERNAME=challenged
   VITE_WP_APP_PASSWORD=your-generated-password-here
   ```

### Step 2: Test WordPress Connection
```bash
cd /Users/guoweijiang/Downloads/challenged
node test-wp-auth.js
```

Update the `APP_PASSWORD` in the script with your generated password.

### Step 3: Initialize Database Adapter in Your App
In your `src/main.tsx` or app entry point:

```typescript
import { setupDatabase } from './lib/database-setup.example';

// Initialize on app startup
setupDatabase();
```

### Step 4: Use in Your Components
```typescript
import { getDatabase } from './lib/database-adapter';

// In your component or hook
const db = getDatabase();
const profile = await db.getProfile(userId);
const careGroups = await db.getCareGroups(userId);
const bookings = await db.getBookings(userId);
```

## Optional: JWT + Social Login (If You Want It)

Follow the detailed steps in `WORDPRESS_AUTH_SETUP.md` to:
1. Install JWT Authentication plugin
2. Install Nextend Social Login plugin
3. Configure Google OAuth
4. Test JWT token generation

**Note:** For a backup system with low usage, Application Passwords are simpler and sufficient.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    React App (Frontend)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Database Adapter (Auto-Failover)           │    │
│  │                                                     │    │
│  │  ┌──────────────┐         ┌──────────────┐        │    │
│  │  │   Supabase   │ ◄─────► │  WordPress   │        │    │
│  │  │   (Primary)  │  Health │   (Backup)   │        │    │
│  │  │              │  Check  │              │        │    │
│  │  └──────────────┘         └──────────────┘        │    │
│  │                                                     │    │
│  │  • Checks Supabase health every 30s                │    │
│  │  • Auto-switches to WordPress if Supabase down     │    │
│  │  • Auto-recovers when Supabase back online         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │  Supabase (Primary)  │    │ WordPress (Backup)   │
    │                      │    │                      │
    │  • care_connector    │    │  • Custom Post Types │
    │    schema            │    │  • WooCommerce       │
    │  • Fast, modern      │    │  • Dokan             │
    │  • Can be blocked    │    │  • Always available  │
    └──────────────────────┘    └──────────────────────┘
```

## Data Mapping

| Supabase Table | WordPress Equivalent |
|----------------|---------------------|
| `profile` | Users + User Meta |
| `care_groups` | Custom Post Type: `care_groups` |
| `bookings` | WooCommerce Bookings |
| `orders` | WooCommerce Orders (always uses WP) |
| `products` | WooCommerce Products |

## Testing Failover

```typescript
import { getDatabase } from './lib/database-adapter';

const db = getDatabase();

// Check current provider
console.log('Current provider:', db.getCurrentProvider());

// Force switch to WordPress (for testing)
await db.forceProvider('wordpress');

// Test fetching data
const profile = await db.getProfile(userId);
console.log('Profile from WordPress:', profile);

// Switch back to Supabase
await db.forceProvider('supabase');
```

## Next Steps

1. ✅ Generate Application Password in WordPress
2. ✅ Test connection with `test-wp-auth.js`
3. ✅ Add WordPress credentials to `.env`
4. ✅ Initialize database adapter in your app
5. ✅ Replace direct Supabase calls with database adapter
6. ⏸️ (Optional) Install JWT + OAuth plugins for social login

## Files Created

- `src/lib/wordpress-client.ts` - WordPress REST API client
- `src/lib/database-adapter.ts` - Unified database interface with auto-failover
- `WORDPRESS_AUTH_SETUP.md` - Setup guide for JWT and OAuth
- `test-wp-auth.js` - Authentication test script
- `WORDPRESS_BACKUP_IMPLEMENTATION.md` - This file

## Current Status

✅ WordPress client library created
✅ Database adapter with auto-failover created
✅ Documentation complete
✅ Test script ready
⏸️ Waiting for you to generate Application Password
⏸️ Browser/SSH issues prevented automated plugin installation

**Recommendation:** Start with Application Passwords (simplest). You can add JWT + OAuth later if needed.
