<?php
require_once("/var/www/html/wp-load.php");
switch_to_blog(5);

// Set current user to admin (user 1)
wp_set_current_user(1);

$pass = 0;
$fail = 0;
$issues = [];

function check($label, $cond, &$pass, &$fail, &$issues) {
    if ($cond) { echo "  PASS: $label\n"; $pass++; }
    else { echo "  FAIL: $label\n"; $fail++; $issues[] = $label; }
}

echo "=== Testing REST API CPT Endpoints ===\n\n";

// 1. Test care_group CPT
echo "[care_group]\n";
$cpt = get_post_type_object('care_group');
check("care_group CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_group show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// Create a test group
$gid = wp_insert_post(['post_type'=>'care_group','post_title'=>'Test CG','post_status'=>'publish','meta_input'=>['join_code'=>'TESTXX','description'=>'Test group']]);
check("Create care_group", $gid > 0, $pass, $fail, $issues);
$jc = get_post_meta($gid, 'join_code', true);
check("care_group meta join_code saved", $jc === 'TESTXX', $pass, $fail, $issues);
wp_delete_post($gid, true);

// 2. Test care_task CPT
echo "\n[care_task]\n";
$cpt = get_post_type_object('care_task');
check("care_task CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_task show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);
$tid = wp_insert_post(['post_type'=>'care_task','post_title'=>'Test Task','post_status'=>'publish','meta_input'=>['status'=>'pending','priority'=>'high','care_group'=>'999']]);
check("Create care_task", $tid > 0, $pass, $fail, $issues);
$st = get_post_meta($tid, 'status', true);
check("care_task meta status saved", $st === 'pending', $pass, $fail, $issues);
wp_delete_post($tid, true);

// 3. Test care_group_post CPT
echo "\n[care_group_post]\n";
$cpt = get_post_type_object('care_group_post');
check("care_group_post CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_group_post show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 4. Test care_group_member CPT
echo "\n[care_group_member]\n";
$cpt = get_post_type_object('care_group_member');
check("care_group_member CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_group_member show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 5. Test care_group_message CPT
echo "\n[care_group_message]\n";
$cpt = get_post_type_object('care_group_message');
check("care_group_message CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_group_message show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 6. Test care_group_gallery CPT
echo "\n[care_group_gallery]\n";
$cpt = get_post_type_object('care_group_gallery');
check("care_group_gallery CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_group_gallery show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 7. Test care_group_invite CPT
echo "\n[care_group_invite]\n";
$cpt = get_post_type_object('care_group_invite');
check("care_group_invite CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_group_invite show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 8. Test cared_one CPT
echo "\n[cared_one]\n";
$cpt = get_post_type_object('cared_one');
check("cared_one CPT exists", $cpt !== null, $pass, $fail, $issues);
check("cared_one show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);
$coid = wp_insert_post(['post_type'=>'cared_one','post_title'=>'Test Person','post_status'=>'publish','meta_input'=>['relationship'=>'mother']]);
check("Create cared_one", $coid > 0, $pass, $fail, $issues);
$rel = get_post_meta($coid, 'relationship', true);
check("cared_one meta relationship saved", $rel === 'mother', $pass, $fail, $issues);
wp_delete_post($coid, true);

// 9. Test care_medicine CPT
echo "\n[care_medicine]\n";
$cpt = get_post_type_object('care_medicine');
check("care_medicine CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_medicine show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 10. Test care_note CPT
echo "\n[care_note]\n";
$cpt = get_post_type_object('care_note');
check("care_note CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_note show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 11. Test emergency_contact CPT
echo "\n[emergency_contact]\n";
$cpt = get_post_type_object('emergency_contact');
check("emergency_contact CPT exists", $cpt !== null, $pass, $fail, $issues);
check("emergency_contact show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 12. Test care_document CPT
echo "\n[care_document]\n";
$cpt = get_post_type_object('care_document');
check("care_document CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_document show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 13. Test health_vital CPT
echo "\n[health_vital]\n";
$cpt = get_post_type_object('health_vital');
check("health_vital CPT exists", $cpt !== null, $pass, $fail, $issues);
check("health_vital show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 14. Test care_tip CPT
echo "\n[care_tip]\n";
$cpt = get_post_type_object('care_tip');
check("care_tip CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_tip show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 15. Test care_plan CPT
echo "\n[care_plan]\n";
$cpt = get_post_type_object('care_plan');
check("care_plan CPT exists", $cpt !== null, $pass, $fail, $issues);
check("care_plan show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 16. Test checkin_log CPT
echo "\n[checkin_log]\n";
$cpt = get_post_type_object('checkin_log');
check("checkin_log CPT exists", $cpt !== null, $pass, $fail, $issues);
check("checkin_log show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// 17. Test visit_log CPT
echo "\n[visit_log]\n";
$cpt = get_post_type_object('visit_log');
check("visit_log CPT exists", $cpt !== null, $pass, $fail, $issues);
check("visit_log show_in_rest", $cpt && $cpt->show_in_rest, $pass, $fail, $issues);

// Test REST API routes exist
echo "\n=== Testing REST API Routes ===\n";
$rest_server = rest_get_server();
$routes = $rest_server->get_routes();
$needed = ['care_group','care_task','care_group_post','care_group_member','care_group_message','care_group_gallery','care_group_invite','cared_one','care_medicine','care_note','emergency_contact','care_document','health_vital','care_tip','care_plan','checkin_log','visit_log'];
foreach ($needed as $cpt) {
    $route = "/wp/v2/$cpt";
    check("REST route $route", isset($routes[$route]), $pass, $fail, $issues);
}

// Meta registration check
echo "\n=== Testing Meta Registration ===\n";
$meta_keys = ['join_code','description','is_private','group_id','user_id','is_owner','is_admin','is_cared_one','member_name','email','status','priority','category','due_date','assigned_to','care_group','content','post_type','is_pinned','visibility','author_name','message_content','sender_id','sender_name','image_url','caption','invite_email','invite_status','cared_one_id','cared_one','relationship','dosage','frequency','time_of_day','name','active','phone','contact_name','is_primary','document_name','document_type','document_url','file_url','vital_type','value','unit','mood','energy','pain','sleep','notes','visitor_name','visit_type','visit_date'];
foreach ($meta_keys as $key) {
    $reg = registered_meta_key_exists('post', $key);
    if (!$reg) {
        // Check if registered via specific post type
        $reg = registered_meta_key_exists('post', $key, 'care_group') || 
               registered_meta_key_exists('post', $key, 'cared_one') ||
               registered_meta_key_exists('post', $key, 'care_task');
    }
}

echo "\n=== SUMMARY ===\n";
echo "PASS: $pass | FAIL: $fail\n";
if (count($issues)) {
    echo "Issues:\n";
    foreach ($issues as $i) echo "  - $i\n";
}

restore_current_blog();
