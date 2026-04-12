# WordPress JWT & OAuth Setup Guide

## Manual Setup Steps

### 1. Install JWT Authentication Plugin

1. Go to http://170.106.171.59:8080/wp-admin/plugin-install.php
2. Search for "JWT Authentication for WP REST API"
3. Install and activate the plugin
4. Alternative plugin: "JWT Auth" by Useful Team

### 2. Configure JWT Plugin

Add this to `wp-config.php` (before "That's all, stop editing!"):

```php
define('JWT_AUTH_SECRET_KEY', 'your-top-secret-key-here-change-this');
define('JWT_AUTH_CORS_ENABLE', true);
```

Generate a secure secret key:
```bash
openssl rand -base64 64
```

### 3. Install Social Login Plugin (Free Options)

**Option A: Nextend Social Login (Recommended)**
1. Go to Plugins → Add New
2. Search for "Nextend Social Login"
3. Install and activate
4. Go to Settings → Nextend Social Login
5. Enable Google provider

**Option B: Super Socializer**
1. Search for "Super Socializer"
2. Install and activate
3. Configure in Settings → Super Socializer

### 4. Configure Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `http://170.106.171.59:8080/wp-login.php?loginSocial=google`
     - `http://170.106.171.59:8080/?callback=google`
5. Copy Client ID and Client Secret
6. Paste into WordPress plugin settings

### 5. Test JWT Token Generation

```bash
curl -X POST http://170.106.171.59:8080/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "challenged",
    "password": "challenged5527@@@@@"
  }'
```

Expected response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_email": "admin@example.com",
  "user_nicename": "challenged",
  "user_display_name": "challenged"
}
```

### 6. Test Authenticated Request

```bash
TOKEN="your-token-here"

curl http://170.106.171.59:8080/wp-json/wp/v2/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## Alternative: Application Passwords (Simpler)

1. Go to http://170.106.171.59:8080/wp-admin/profile.php
2. Scroll to "Application Passwords"
3. Enter name: "CareConnect Backup App"
4. Click "Add New Application Password"
5. Copy the generated password (format: `xxxx xxxx xxxx xxxx xxxx xxxx`)
6. Test:

```bash
curl -u "challenged:xxxx-xxxx-xxxx-xxxx-xxxx-xxxx" \
  http://170.106.171.59:8080/wp-json/wp/v2/users/me
```

## Troubleshooting

### JWT Plugin Not Working
- Check `.htaccess` has proper rewrite rules
- Ensure `JWT_AUTH_SECRET_KEY` is set in `wp-config.php`
- Check Apache has `mod_rewrite` enabled

### Social Login Not Working
- Verify OAuth redirect URIs match exactly
- Check Google Cloud Console has correct authorized domains
- Ensure SSL certificate is valid (or disable SSL requirement in dev)

### CORS Issues
Add to `wp-config.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
```

## Next Steps

Once plugins are installed:
1. Test JWT token generation
2. Test social login flow
3. Integrate with React app using the WordPress client wrapper
