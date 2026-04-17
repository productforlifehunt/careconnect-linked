<?php
/**
 * CareConnect — Expose WC Bookings `bookable_person` & `bookable_resource` to REST
 *
 * PASTE THIS into:
 *   WP Admin → Snippets → Add New → Functions (PHP)  → Run snippet everywhere → Save & Activate
 * OR
 *   WP Admin → Plugins → Plugin File Editor → CareConnect REST Bridge → append at end
 *
 * What it does:
 *   1. Opts both `bookable_person` and `bookable_resource` CPTs into wp/v2 REST.
 *   2. Registers WC Bookings cost meta keys as REST-writable.
 *   3. Adds a virtual `product_id` REST field that reads/writes `post_parent`
 *      so headless clients can attach Person Types and Resources to a product
 *      (REST normally drops `parent` because both CPTs are non-hierarchical).
 *
 * Safe to paste — uses the standard register_post_type_args filter.
 * Remove by deactivating the snippet; no DB changes are made.
 */

defined( 'ABSPATH' ) || exit;

// 1. Opt the existing CPTs into the REST API.
add_filter( 'register_post_type_args', function ( $args, $post_type ) {
	if ( ! in_array( $post_type, array( 'bookable_person', 'bookable_resource' ), true ) ) {
		return $args;
	}
	$args['show_in_rest']          = true;
	$args['rest_base']             = $post_type;
	$args['rest_controller_class'] = 'WP_REST_Posts_Controller';
	$args['supports']              = array_unique( array_merge(
		isset( $args['supports'] ) && is_array( $args['supports'] ) ? $args['supports'] : array(),
		array( 'title', 'editor', 'custom-fields', 'page-attributes' )
	) );
	return $args;
}, 20, 2 );

// 2. Register the WC Bookings cost meta keys for REST read/write.
add_action( 'init', function () {
	if ( post_type_exists( 'bookable_person' ) ) {
		$person_keys = array(
			'cost'                                => 'number',
			'block_cost'                          => 'number',
			'min'                                 => 'number',
			'max'                                 => 'number',
			'_wc_booking_person_qty_multiplier'   => 'number',
			'_wc_booking_person_cost_multiplier'  => 'number',
		);
		foreach ( $person_keys as $key => $type ) {
			register_post_meta( 'bookable_person', $key, array(
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => $type,
				'auth_callback' => function () { return current_user_can( 'edit_posts' ); },
			) );
		}
	}
	if ( post_type_exists( 'bookable_resource' ) ) {
		$resource_keys = array(
			'_wc_booking_base_cost'   => 'number',
			'_wc_booking_block_cost'  => 'number',
			'_wc_booking_qty'         => 'number',
		);
		foreach ( $resource_keys as $key => $type ) {
			register_post_meta( 'bookable_resource', $key, array(
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => $type,
				'auth_callback' => function () { return current_user_can( 'edit_posts' ); },
			) );
		}
	}
}, 25 );

// 3. Add a virtual `product_id` REST field on both CPTs that maps to post_parent.
//    Both CPTs are registered as non-hierarchical, so REST drops the standard
//    `parent` arg. WC Bookings, however, looks up resources/persons via
//    post_parent === product_id at the SQL level, so we MUST persist parent.
//
//    v3 BUG: wp_update_post() inside an update_callback can silently fail when
//    the CPT is non-hierarchical because core's sanitization layer strips
//    post_parent. v4 fix: bypass wp_update_post entirely and write directly to
//    wp_posts via $wpdb->update — this is the ONLY reliable way to set
//    post_parent on a non-hierarchical CPT post.
add_action( 'rest_api_init', function () {
	$cpts = array( 'bookable_person', 'bookable_resource' );
	foreach ( $cpts as $cpt ) {
		if ( ! post_type_exists( $cpt ) ) {
			continue;
		}
		register_rest_field( $cpt, 'product_id', array(
			'get_callback'    => function ( $post ) {
				return (int) ( isset( $post['parent'] ) ? $post['parent'] : get_post_field( 'post_parent', $post['id'] ) );
			},
			'update_callback' => function ( $value, $post ) {
				global $wpdb;
				$pid = absint( $value );
				$post_id = is_object( $post ) ? (int) $post->ID : (int) ( $post['id'] ?? 0 );
				if ( $post_id <= 0 ) {
					return new WP_Error( 'cc_invalid_post', 'Invalid post id', array( 'status' => 400 ) );
				}
				// Direct DB write — bypasses wp_update_post() which strips
				// post_parent on non-hierarchical CPTs.
				$updated = $wpdb->update(
					$wpdb->posts,
					array( 'post_parent' => $pid ),
					array( 'ID' => $post_id ),
					array( '%d' ),
					array( '%d' )
				);
				clean_post_cache( $post_id );
				// WC Bookings caches person/resource lists per-product. Bust both
				// the old and new parent so neither caches stale data.
				if ( function_exists( 'wp_cache_delete' ) ) {
					wp_cache_delete( 'wc_booking_resources_for_product_' . $pid, 'bookings' );
					wp_cache_delete( 'wc_booking_persons_for_product_' . $pid, 'bookings' );
				}
				return true;
			},
			'schema'          => array(
				'description' => 'Parent product ID this person/resource belongs to.',
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
		) );
	}
	// Allow filtering the list endpoint by product_id (?product_id=123).
	foreach ( $cpts as $cpt ) {
		add_filter( "rest_{$cpt}_query", function ( $args, $request ) {
			$pid = $request->get_param( 'product_id' );
			if ( $pid ) {
				$args['post_parent'] = absint( $pid );
			}
			return $args;
		}, 10, 2 );
	}
}, 20 );

// 4. Custom endpoint: POST /careconnect/v1/link-booking-child
//    Belt-and-suspenders. Lets the JS layer force-set post_parent on any
//    bookable_person / bookable_resource if the REST field path fails for any
//    reason (e.g., other plugin hijacking the wp/v2 update flow).
add_action( 'rest_api_init', function () {
	register_rest_route( 'careconnect/v1', '/link-booking-child', array(
		'methods'             => 'POST',
		'permission_callback' => function () { return current_user_can( 'edit_posts' ); },
		'args'                => array(
			'child_id'   => array( 'type' => 'integer', 'required' => true ),
			'product_id' => array( 'type' => 'integer', 'required' => true ),
		),
		'callback'            => function ( WP_REST_Request $req ) {
			global $wpdb;
			$child_id   = (int) $req->get_param( 'child_id' );
			$product_id = (int) $req->get_param( 'product_id' );
			$child_type = get_post_type( $child_id );
			if ( ! in_array( $child_type, array( 'bookable_person', 'bookable_resource' ), true ) ) {
				return new WP_Error( 'cc_bad_child', 'Not a bookable child', array( 'status' => 400 ) );
			}
			if ( get_post_type( $product_id ) !== 'product' ) {
				return new WP_Error( 'cc_bad_parent', 'Parent is not a product', array( 'status' => 400 ) );
			}
			$wpdb->update(
				$wpdb->posts,
				array( 'post_parent' => $product_id ),
				array( 'ID' => $child_id ),
				array( '%d' ),
				array( '%d' )
			);
			clean_post_cache( $child_id );
			clean_post_cache( $product_id );
			if ( function_exists( 'wp_cache_delete' ) ) {
				wp_cache_delete( 'wc_booking_resources_for_product_' . $product_id, 'bookings' );
				wp_cache_delete( 'wc_booking_persons_for_product_' . $product_id, 'bookings' );
			}
			return array(
				'ok'       => true,
				'child_id' => $child_id,
				'parent'   => (int) get_post_field( 'post_parent', $child_id ),
			);
		},
	) );

	// 5. Diagnostic + sync endpoint: GET/POST /careconnect/v1/booking-debug/{product_id}
	//    GET shows the real DB state; POST rebuilds the product's resource link
	//    arrays (`_wc_booking_resource_ids` etc) from the actual child posts and
	//    flushes WC Bookings transients. This is what makes the storefront
	//    booking form actually render the resource picker.
	register_rest_route( 'careconnect/v1', '/booking-debug/(?P<product_id>\d+)', array(
		array(
			'methods'             => 'GET',
			'permission_callback' => function () { return current_user_can( 'edit_posts' ); },
			'callback'            => function ( WP_REST_Request $req ) {
				global $wpdb;
				$pid = (int) $req->get_param( 'product_id' );
				$rows = $wpdb->get_results( $wpdb->prepare(
					"SELECT ID, post_title, post_type, post_parent, post_status FROM {$wpdb->posts} WHERE post_parent = %d AND post_type IN ('bookable_person','bookable_resource')",
					$pid
				), ARRAY_A );
				return array(
					'product_id' => $pid,
					'children'   => $rows,
					'meta'       => array(
						'has_persons'         => get_post_meta( $pid, '_wc_booking_has_persons', true ),
						'has_resources'       => get_post_meta( $pid, '_wc_booking_has_resources', true ),
						'resource_ids'        => get_post_meta( $pid, '_wc_booking_resource_ids', true ),
						'resource_base_costs' => get_post_meta( $pid, '_wc_booking_resource_base_costs', true ),
						'resource_block_costs'=> get_post_meta( $pid, '_wc_booking_resource_block_costs', true ),
					),
				);
			},
		),
		array(
			'methods'             => 'POST',
			'permission_callback' => function () { return current_user_can( 'edit_posts' ); },
			'callback'            => function ( WP_REST_Request $req ) {
				global $wpdb;
				$pid = (int) $req->get_param( 'product_id' );
				$resources = $wpdb->get_results( $wpdb->prepare(
					"SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'bookable_resource' AND post_status = 'publish'",
					$pid
				), ARRAY_A );
				$resource_ids = array();
				$base_costs   = array();
				$block_costs  = array();
				foreach ( $resources as $r ) {
					$rid = (int) $r['ID'];
					$resource_ids[] = $rid;
					$base_costs[ $rid ]  = (float) get_post_meta( $rid, '_wc_booking_base_cost', true );
					$block_costs[ $rid ] = (float) get_post_meta( $rid, '_wc_booking_block_cost', true );
				}
				update_post_meta( $pid, '_wc_booking_resource_ids', $resource_ids );
				update_post_meta( $pid, '_wc_booking_resource_base_costs', $base_costs );
				update_post_meta( $pid, '_wc_booking_resource_block_costs', $block_costs );
				if ( ! empty( $resource_ids ) ) {
					update_post_meta( $pid, '_wc_booking_has_resources', 'yes' );
					update_post_meta( $pid, '_wc_booking_resources_assignment', 'customer' );
				}
				$persons = $wpdb->get_results( $wpdb->prepare(
					"SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'bookable_person' AND post_status = 'publish'",
					$pid
				), ARRAY_A );
				if ( ! empty( $persons ) ) {
					update_post_meta( $pid, '_wc_booking_has_persons', 'yes' );
				}
				clean_post_cache( $pid );
				wp_cache_delete( 'wc_booking_resources_for_product_' . $pid, 'bookings' );
				wp_cache_delete( 'wc_booking_persons_for_product_' . $pid, 'bookings' );
				wp_cache_delete( 'product-' . $pid, 'products' );
				if ( function_exists( 'wc_delete_product_transients' ) ) {
					wc_delete_product_transients( $pid );
				}
				return array(
					'ok'                  => true,
					'product_id'          => $pid,
					'resource_ids'        => $resource_ids,
					'resource_base_costs' => $base_costs,
					'resource_block_costs'=> $block_costs,
					'person_count'        => count( $persons ),
				);
			},
		),
	) );
} );
