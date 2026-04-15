<?php
/**
 * Plugin Name: CC Trackserver REST
 * Description: Headless REST endpoints for Trackserver data (live location + history). JWT/Application Password compatible.
 * Version: 1.0
 * Author: CareConnected
 *
 * Exposes two endpoints under /wp-json/cc/v1/:
 *   GET /location/live/{user_id}        — latest GPS point for a user
 *   GET /location/history/{user_id}     — breadcrumb trail (last N points)
 *
 * Reads directly from Trackserver's optimized wp_ts_tracks + wp_ts_locations tables.
 * Authentication: WordPress Application Passwords, JWT, or cookie-based.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', 'cc_trackserver_rest_register_routes' );

function cc_trackserver_rest_register_routes() {
    // Live location: latest point for a user
    register_rest_route( 'cc/v1', '/location/live/(?P<user_id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'cc_trackserver_live_location',
        'permission_callback' => 'cc_trackserver_permission_check',
        'args'                => [
            'user_id' => [
                'required'          => true,
                'validate_callback' => function( $param ) {
                    return is_numeric( $param ) && intval( $param ) > 0;
                },
            ],
        ],
    ] );

    // Location history: breadcrumb trail
    register_rest_route( 'cc/v1', '/location/history/(?P<user_id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'cc_trackserver_location_history',
        'permission_callback' => 'cc_trackserver_permission_check',
        'args'                => [
            'user_id' => [
                'required'          => true,
                'validate_callback' => function( $param ) {
                    return is_numeric( $param ) && intval( $param ) > 0;
                },
            ],
            'limit' => [
                'default'           => 100,
                'validate_callback' => function( $param ) {
                    return is_numeric( $param ) && intval( $param ) > 0 && intval( $param ) <= 1000;
                },
            ],
            'since' => [
                'default'           => null,
                'description'       => 'ISO 8601 datetime. Only return points after this time.',
                'validate_callback' => function( $param ) {
                    if ( empty( $param ) ) return true;
                    return (bool) strtotime( $param );
                },
            ],
            'track_id' => [
                'default'           => null,
                'validate_callback' => function( $param ) {
                    if ( empty( $param ) ) return true;
                    return is_numeric( $param );
                },
            ],
        ],
    ] );
}

/**
 * Permission check: must be authenticated (any WP auth method).
 */
function cc_trackserver_permission_check( $request ) {
    return is_user_logged_in();
}

/**
 * Get latest GPS point for a user from Trackserver tables.
 */
function cc_trackserver_live_location( $request ) {
    global $wpdb;

    $user_id   = intval( $request['user_id'] );
    $prefix    = $wpdb->prefix;
    $tracks_t  = $prefix . 'ts_tracks';
    $locs_t    = $prefix . 'ts_locations';

    // Check tables exist
    if ( $wpdb->get_var( "SHOW TABLES LIKE '{$tracks_t}'" ) !== $tracks_t ) {
        return new WP_Error( 'trackserver_missing', 'Trackserver tables not found', [ 'status' => 404 ] );
    }

    // Get the latest location across all tracks for this user
    $row = $wpdb->get_row( $wpdb->prepare(
        "SELECT l.latitude, l.longitude, l.altitude, l.speed, l.heading, l.occurred, l.comment,
                t.id AS track_id, t.name AS track_name
         FROM {$locs_t} l
         JOIN {$tracks_t} t ON l.trip_id = t.id
         WHERE t.user_id = %d
         ORDER BY l.occurred DESC
         LIMIT 1",
        $user_id
    ), ARRAY_A );

    if ( ! $row ) {
        return rest_ensure_response( [
            'found'   => false,
            'user_id' => $user_id,
            'data'    => null,
        ] );
    }

    return rest_ensure_response( [
        'found'   => true,
        'user_id' => $user_id,
        'data'    => [
            'latitude'   => floatval( $row['latitude'] ),
            'longitude'  => floatval( $row['longitude'] ),
            'altitude'   => $row['altitude'] !== null ? floatval( $row['altitude'] ) : null,
            'speed'      => $row['speed'] !== null ? floatval( $row['speed'] ) : null,
            'heading'    => $row['heading'] !== null ? floatval( $row['heading'] ) : null,
            'timestamp'  => $row['occurred'],
            'track_id'   => intval( $row['track_id'] ),
            'track_name' => $row['track_name'],
        ],
    ] );
}

/**
 * Get location history (breadcrumb trail) for a user from Trackserver tables.
 */
function cc_trackserver_location_history( $request ) {
    global $wpdb;

    $user_id   = intval( $request['user_id'] );
    $limit     = intval( $request['limit'] );
    $since     = $request->get_param( 'since' );
    $track_id  = $request->get_param( 'track_id' );
    $prefix    = $wpdb->prefix;
    $tracks_t  = $prefix . 'ts_tracks';
    $locs_t    = $prefix . 'ts_locations';

    if ( $wpdb->get_var( "SHOW TABLES LIKE '{$tracks_t}'" ) !== $tracks_t ) {
        return new WP_Error( 'trackserver_missing', 'Trackserver tables not found', [ 'status' => 404 ] );
    }

    // Build query
    $where = [ 't.user_id = %d' ];
    $args  = [ $user_id ];

    if ( ! empty( $since ) ) {
        $where[] = 'l.occurred >= %s';
        $args[]  = $since;
    }

    if ( ! empty( $track_id ) ) {
        $where[] = 't.id = %d';
        $args[]  = intval( $track_id );
    }

    $where_sql = implode( ' AND ', $where );
    $args[]    = $limit;

    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT l.latitude, l.longitude, l.altitude, l.speed, l.heading, l.occurred, l.comment,
                t.id AS track_id, t.name AS track_name
         FROM {$locs_t} l
         JOIN {$tracks_t} t ON l.trip_id = t.id
         WHERE {$where_sql}
         ORDER BY l.occurred DESC
         LIMIT %d",
        ...$args
    ), ARRAY_A );

    $points = array_map( function( $row ) {
        return [
            'latitude'   => floatval( $row['latitude'] ),
            'longitude'  => floatval( $row['longitude'] ),
            'altitude'   => $row['altitude'] !== null ? floatval( $row['altitude'] ) : null,
            'speed'      => $row['speed'] !== null ? floatval( $row['speed'] ) : null,
            'heading'    => $row['heading'] !== null ? floatval( $row['heading'] ) : null,
            'timestamp'  => $row['occurred'],
            'track_id'   => intval( $row['track_id'] ),
            'track_name' => $row['track_name'],
        ];
    }, $rows ?: [] );

    return rest_ensure_response( [
        'user_id' => $user_id,
        'count'   => count( $points ),
        'points'  => $points,
    ] );
}
