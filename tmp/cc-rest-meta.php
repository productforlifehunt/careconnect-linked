<?php
/**
 * Plugin Name: CC Care REST Meta
 * Description: Registers all care-related CPTs, meta fields for WP REST API, and handles ACF field read/write
 * Version: 3.0
 */

/* ── Register Missing CPTs ── */
add_action('init', function(){
  $cpts = [
    'care_group_post'    => 'Care Group Post',
    'care_group_member'  => 'Care Group Member',
    'care_group_message' => 'Care Group Message',
    'care_group_gallery' => 'Care Group Gallery',
    'care_group_invite'  => 'Care Group Invite',
    'care_medicine'      => 'Care Medicine',
    'care_tip'           => 'Care Tip',
    'checkin_log'        => 'Check-in Log',
    'visit_log'          => 'Visit Log',
  ];
  foreach($cpts as $slug => $label){
    if(!post_type_exists($slug)){
      register_post_type($slug, [
        'label'               => $label,
        'public'              => false,
        'show_in_rest'        => true,
        'rest_base'           => $slug,
        'supports'            => ['title','editor','author','custom-fields'],
        'publicly_queryable'  => false,
        'show_ui'             => true,
        'show_in_menu'        => false,
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
      ]);
    }
  }
}, 2);

/* ── Register Meta Fields ── */
add_action('init', function(){
  // All meta fields keyed by CPT
  $meta_map = [
    'care_group'         => ['join_code','description','is_private'],
    'care_group_member'  => ['group_id','user_id','is_owner','is_admin','is_cared_one','member_name','email','invitation_status','relationship','role_label','joined_at','care_group_id','user_wp_id'],
    'care_group_post'    => ['group_id','content','post_type','is_pinned','visibility','author_name','care_group_id','author_wp_id','post_type_filter','reactions_json'],
    'care_group_message' => ['group_id','message_content','sender_id','sender_name','message_type','read_by_json','care_group_id','sender_wp_user_id'],
    'care_group_gallery' => ['group_id','image_url','caption','wp_media_id','uploaded_by_wp_id','care_group_id'],
    'care_group_invite'  => ['group_id','invite_email','invite_status','care_group_id','group_name','invitee_email','invitee_wp_user_id','invited_by_wp_id','status','invite_token','expires_at'],
    'care_task'          => ['care_group','description','status','priority','category','due_date','assigned_to','visibility'],
    'cared_one'          => ['relationship','notes','created_by'],
    'care_medicine'      => ['cared_one_id','cared_one','name','dosage','frequency','time_of_day','notes','active'],
    'care_note'          => ['cared_one_id','cared_one','content','category','notes'],
    'emergency_contact'  => ['cared_one_id','cared_one','contact_name','phone','relationship','is_primary','notes'],
    'care_document'      => ['cared_one_id','cared_one','document_name','document_type','document_url','file_url','notes'],
    'health_vital'       => ['cared_one_id','cared_one','vital_type','value','unit','notes'],
    'care_tip'           => ['cared_one_id','cared_one','content','category'],
    'care_plan'          => ['cared_one_id','cared_one','description','status','goals'],
    'checkin_log'        => ['cared_one_id','cared_one','mood','energy','pain','sleep','notes'],
    'visit_log'          => ['cared_one_id','cared_one','visitor_name','visit_type','visit_date','notes'],
  ];

  foreach($meta_map as $post_type => $fields){
    foreach($fields as $field){
      register_meta('post', $field, [
        'object_subtype'    => $post_type,
        'show_in_rest'      => true,
        'single'            => true,
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => function(){ return current_user_can('edit_posts'); },
      ]);
    }
  }
}, 5);

/* ── Save meta from REST create/update ── */
$cc_all_cpts = ['care_group','care_task','cared_one','care_group_post','care_group_member','care_group_message','care_group_gallery','care_group_invite','care_medicine','care_note','emergency_contact','care_document','health_vital','care_tip','care_plan','checkin_log','visit_log'];
foreach($cc_all_cpts as $cpt) {
  add_action('rest_after_insert_' . $cpt, 'cc_save_meta_from_rest', 10, 3);
}

function cc_save_meta_from_rest($post, $request, $creating) {
  $params = $request->get_json_params();
  $meta = isset($params['meta']) ? $params['meta'] : [];
  if(empty($meta)) return;
  foreach($meta as $key => $value) {
    if(substr($key, 0, 1) === '_') continue;
    update_post_meta($post->ID, $key, $value);
  }
}

/* ── Include ACF + meta in REST responses ── */
$cc_all_cpts2 = ['care_group','care_task','cared_one','care_group_post','care_group_member','care_group_message','care_group_gallery','care_group_invite','care_medicine','care_note','emergency_contact','care_document','health_vital','care_tip','care_plan','checkin_log','visit_log'];
foreach($cc_all_cpts2 as $cpt) {
  add_filter('rest_prepare_' . $cpt, 'cc_add_acf_to_rest_response', 10, 3);
}

function cc_add_acf_to_rest_response($response, $post, $request) {
  if(function_exists('get_fields')) {
    $acf = get_fields($post->ID);
    if($acf && is_array($acf)) {
      $response->data['acf'] = $acf;
    }
  }
  // Always include all post meta in response for non-ACF fields
  $all_meta = get_post_meta($post->ID);
  if(!isset($response->data['meta'])) $response->data['meta'] = [];
  foreach($all_meta as $k => $v) {
    if(substr($k, 0, 1) === '_') continue;
    $response->data['meta'][$k] = is_array($v) && count($v) === 1 ? $v[0] : $v;
  }
  return $response;
}
