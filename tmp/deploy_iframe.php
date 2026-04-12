<?php
require_once('/var/www/html/wp-load.php');
switch_to_blog(5);
global $wpdb;

function iframe_content($file) {
  $html = file_get_contents($file);
  $doc = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    . '<base href="http://170.106.171.59:8080/careconnected/">'
    . '</head><body style="margin:0;background:#fafafa;">'
    . $html
    . '</body></html>';
  $srcdoc = htmlspecialchars($doc, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  return '<div style="width:100%;max-width:100%;margin:0;padding:0">'
    . '<iframe '
    . 'srcdoc="' . $srcdoc . '" '
    . 'style="width:100%;min-height:4200px;border:0;display:block;background:#fafafa" '
    . 'loading="eager" '
    . 'referrerpolicy="same-origin" '
    . 'onload="try{this.style.height=Math.max(this.contentWindow.document.documentElement.scrollHeight,this.contentWindow.document.body.scrollHeight)+\'px\';}catch(e){this.style.height=\'4200px\';}"'
    . '></iframe>'
    . '</div>';
}

$pages = [
  25 => '/tmp/care_groups_v2.html',
  230 => '/tmp/cared_ones_v2.html',
];

foreach ($pages as $id => $file) {
  $content = iframe_content($file);
  $wpdb->update($wpdb->posts, [
    'post_content' => $content,
    'post_modified' => current_time('mysql'),
    'post_modified_gmt' => current_time('mysql', 1),
  ], ['ID' => $id]);
  clean_post_cache($id);
  echo "updated:$id\n";
}

restore_current_blog();
