<?php
/**
 * CareConnect — Expose WC Bookings `bookable_person` to REST
 *
 * PASTE THIS into:
 *   WP Admin → Snippets → Add New → Functions (PHP)  → Run snippet everywhere → Save & Activate
 * OR
 *   WP Admin → Plugins → Plugin File Editor → CareConnect REST Bridge → append at end
 *
 * What it does:
 *   1. Forces `bookable_person` CPT to opt into the wp/v2 REST API
 *      (WC Bookings registers it WITHOUT REST support by default).
 *   2. Registers the WC Bookings person-cost meta keys (cost, block_cost,
 *      min, max) as REST-writable so headless React can create per-service
 *      Person Types via POST /wp-json/wp/v2/bookable_person.
 *
 * Safe to paste — uses the standard register_post_type_args filter.
 * Remove by deactivating the snippet; no DB changes are made.
 */

defined( 'ABSPATH' ) || exit;

// 1. Opt the existing bookable_person CPT into the REST API.
add_filter( 'register_post_type_args', function ( $args, $post_type ) {
	if ( $post_type !== 'bookable_person' ) {
		return $args;
	}
	$args['show_in_rest']          = true;
	$args['rest_base']             = 'bookable_person';
	$args['rest_controller_class'] = 'WP_REST_Posts_Controller';
	$args['supports']              = array_unique( array_merge(
		isset( $args['supports'] ) && is_array( $args['supports'] ) ? $args['supports'] : array(),
		array( 'title', 'editor', 'custom-fields', 'page-attributes' )
	) );
	return $args;
}, 20, 2 );

// 2. Register the WC Bookings person-cost meta keys for REST read/write.
add_action( 'init', function () {
	if ( ! post_type_exists( 'bookable_person' ) ) {
		return;
	}
	$keys = array(
		'cost'                                => 'number',
		'block_cost'                          => 'number',
		'min'                                 => 'number',
		'max'                                 => 'number',
		'_wc_booking_person_qty_multiplier'   => 'number',
		'_wc_booking_person_cost_multiplier'  => 'number',
	);
	foreach ( $keys as $key => $type ) {
		register_post_meta( 'bookable_person', $key, array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => $type,
			'auth_callback' => function () { return current_user_can( 'edit_posts' ); },
		) );
	}
}, 25 );
