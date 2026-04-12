<?php
/**
 * Plugin Name: CareConnect REST Bridge
 * Description: CORS headers + JWT authentication for all WordPress REST API endpoints.
 *              Works with the CareConnect JWT Auth plugin tokens. Network-activatable for multisite.
 * Version: 1.1.0
 * Network: true
 */

defined('ABSPATH') || exit;

// ─── 1. CORS Headers on all REST API responses ─────────────────
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    add_filter('rest_pre_serve_request', function ($value) {
        $origin = get_http_origin();
        if (!$origin) {
            $origin = '*';
        }
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Link');
        return $value;
    });
}, 15);

// ─── 2. Handle preflight OPTIONS early ──────────────────────────
add_action('init', function () {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        status_header(200);
        exit;
    }
});

// ─── 3. JWT Authentication for ALL REST API requests ────────────
//    Reads the Authorization: Bearer <token> header, validates the
//    JWT using the same secret as the CareConnect JWT Auth plugin,
//    and sets the current WordPress user accordingly.
add_filter('determine_current_user', 'cc_rest_bridge_authenticate', 20);

function cc_rest_bridge_authenticate($user_id) {
    // If already authenticated (cookie, nonce, etc.), skip
    if ($user_id) {
        return $user_id;
    }

    // Only act on REST API requests
    if (!defined('REST_REQUEST') || !REST_REQUEST) {
        // Also check the URL path for /wp-json/
        $request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
        if (strpos($request_uri, '/wp-json/') === false && strpos($request_uri, '/?rest_route=') === false) {
            return $user_id;
        }
    }

    // Get the Authorization header
    $auth_header = cc_rest_bridge_get_auth_header();
    if (!$auth_header || stripos($auth_header, 'Bearer ') !== 0) {
        return $user_id;
    }

    $token = trim(substr($auth_header, 7));
    if (empty($token)) {
        return $user_id;
    }

    // Get the JWT secret — same key as CareConnect JWT Auth plugin
    $secret = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : false;
    if (!$secret) {
        // Fallback: try wp-config constant
        $secret = defined('AUTH_KEY') ? AUTH_KEY : false;
    }
    if (!$secret) {
        return $user_id;
    }

    // Decode the JWT manually (HS256 only, no external library needed)
    $decoded = cc_rest_bridge_decode_jwt($token, $secret);
    if (!$decoded || !isset($decoded['data']['user_id'])) {
        return $user_id;
    }

    // Check expiration
    if (isset($decoded['exp']) && $decoded['exp'] < time()) {
        return $user_id;
    }

    // Validate the user exists
    $wp_user = get_user_by('id', $decoded['data']['user_id']);
    if (!$wp_user) {
        return $user_id;
    }

    return $wp_user->ID;
}

// ─── Helper: Get Authorization header across server configs ─────
function cc_rest_bridge_get_auth_header() {
    // Check standard header
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Apache sometimes puts it in REDIRECT_HTTP_AUTHORIZATION
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    // Try apache_request_headers()
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            return $headers['Authorization'];
        }
        if (isset($headers['authorization'])) {
            return $headers['authorization'];
        }
    }
    // Try getallheaders()
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            return $headers['Authorization'];
        }
        if (isset($headers['authorization'])) {
            return $headers['authorization'];
        }
    }
    return null;
}

// ─── Helper: Decode HS256 JWT without external libraries ────────
function cc_rest_bridge_decode_jwt($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    list($header_b64, $payload_b64, $signature_b64) = $parts;

    // Verify signature (HS256)
    $signature_check = hash_hmac('sha256', "$header_b64.$payload_b64", $secret, true);
    $signature_input = cc_rest_bridge_base64url_decode($signature_b64);

    if (!hash_equals($signature_check, $signature_input)) {
        return false;
    }

    // Decode header to confirm algorithm
    $header = json_decode(cc_rest_bridge_base64url_decode($header_b64), true);
    if (!$header || !isset($header['alg']) || strtoupper($header['alg']) !== 'HS256') {
        return false;
    }

    // Decode payload
    $payload = json_decode(cc_rest_bridge_base64url_decode($payload_b64), true);
    if (!$payload) {
        return false;
    }

    return $payload;
}

function cc_rest_bridge_base64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}
