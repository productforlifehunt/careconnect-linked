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
				$pid = absint( $value );
				if ( $pid <= 0 ) {
					return true;
				}
				$result = wp_update_post( array(
					'ID'          => $post->ID,
					'post_parent' => $pid,
				), true );
				if ( is_wp_error( $result ) ) {
					return $result;
				}
				// WC Bookings caches person/resource lists per-product. Bust it.
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
