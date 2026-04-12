<?php
require_once('/var/www/html/wp-load.php');
switch_to_blog(5);
global $wpdb;

$pages = [
  25 => '/tmp/care_groups_v2.html',
  230 => '/tmp/cared_ones_v2.html',
];

foreach ($pages as $id => $file) {
  $html = file_get_contents($file);
  $content = "<!-- wp:html -->\n" . $html . "\n<!-- /wp:html -->";
  $wpdb->update($wpdb->posts, [
    'post_content' => $content,
    'post_modified' => current_time('mysql'),
    'post_modified_gmt' => current_time('mysql', 1),
  ], ['ID' => $id]);
  clean_post_cache($id);
  echo "updated:$id\n";
}

restore_current_blog();
