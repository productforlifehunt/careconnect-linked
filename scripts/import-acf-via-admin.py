#!/usr/bin/env python3
"""
Import ACF field groups into WordPress by automating the admin post.php form.
Uses cookie-based auth from an existing session.

Strategy:
1. First, deactivate (trash) all OLD field groups that will be superseded
2. For each new field group: create auto-draft via post-new.php, then save via post.php
3. For each field in the group: add as acf-field child post
"""

import requests
import json
import re
import sys
import time

BASE = "http://170.106.171.59:8080/careconnected/wp-admin"
COOKIE_FILE = "/tmp/wp_cookies.txt"

# Load cookies from curl cookie jar
session = requests.Session()
with open(COOKIE_FILE) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split('\t')
        if len(parts) >= 7:
            domain, _, path, secure, expires, name, value = parts[:7]
            session.cookies.set(name, value, domain=domain, path=path)

def get_nonces(url):
    """Fetch a page and extract _wpnonce, _acf_nonce, and post_ID."""
    r = session.get(url)
    html = r.text
    wp_nonce = re.findall(r'name="_wpnonce"\s*value="([^"]+)"', html)
    acf_nonce = re.findall(r'name="_acf_nonce"\s*value="([^"]+)"', html)
    post_id = re.findall(r'name="post_ID"\s*value="(\d+)"', html)
    return {
        '_wpnonce': wp_nonce[0] if wp_nonce else None,
        '_acf_nonce': acf_nonce[0] if acf_nonce else None,
        'post_ID': post_id[0] if post_id else None,
        'html': html,
    }

def create_field_group(title, group_key, location_rules, fields):
    """Create an ACF field group with fields via admin forms."""
    
    # Step 1: Get auto-draft
    print(f"  Creating field group: {title}...")
    nonces = get_nonces(f"{BASE}/post-new.php?post_type=acf-field-group")
    
    if not nonces['_wpnonce'] or not nonces['_acf_nonce']:
        print(f"    ERROR: Could not get nonces for {title}")
        return None
    
    post_id = nonces['post_ID']
    if not post_id:
        # Try to extract from auto-draft
        m = re.findall(r'"post_id":(\d+)', nonces['html'])
        if m:
            post_id = m[0]
    
    if not post_id:
        # Create auto-draft via AJAX
        print(f"    No post_ID found, trying AJAX auto-draft...")
        r = session.post(f"{BASE}/admin-ajax.php", data={
            'action': 'acf/create_field_group',
        })
        print(f"    AJAX response: {r.status_code}")
        return None
    
    # Step 2: Build the location rule data
    location_data = {}
    for i, rule_group in enumerate(location_rules):
        for j, rule in enumerate(rule_group):
            location_data[f'acf_field_group[location][{i}][{j}][param]'] = rule['param']
            location_data[f'acf_field_group[location][{i}][{j}][operator]'] = rule['operator']
            location_data[f'acf_field_group[location][{i}][{j}][value]'] = rule['value']
    
    # Step 3: Build field data
    field_data = {}
    for idx, field in enumerate(fields):
        prefix = f'acf_fields[{field["key"]}]'
        field_data[f'{prefix}[key]'] = field['key']
        field_data[f'{prefix}[label]'] = field['label']
        field_data[f'{prefix}[name]'] = field['name']
        field_data[f'{prefix}[type]'] = field['type']
        field_data[f'{prefix}[required]'] = str(field.get('required', 0))
        field_data[f'{prefix}[menu_order]'] = str(idx)
        field_data[f'{prefix}[parent]'] = group_key
        
        # Type-specific settings
        if field['type'] == 'select' and 'choices' in field:
            for ci, (ck, cv) in enumerate(field['choices'].items()):
                field_data[f'{prefix}[choices][{ck}]'] = cv
        if field['type'] == 'true_false':
            field_data[f'{prefix}[default_value]'] = str(field.get('default_value', 0))
        if field['type'] in ('date_picker', 'date_time_picker'):
            field_data[f'{prefix}[display_format]'] = field.get('display_format', 'Y-m-d')
            field_data[f'{prefix}[return_format]'] = field.get('return_format', 'Y-m-d')
        if field['type'] == 'post_object':
            for pi, pt in enumerate(field.get('post_type', [])):
                field_data[f'{prefix}[post_type][{pi}]'] = pt
            field_data[f'{prefix}[return_format]'] = field.get('return_format', 'id')
        if field['type'] == 'relationship':
            for pi, pt in enumerate(field.get('post_type', [])):
                field_data[f'{prefix}[post_type][{pi}]'] = pt
            field_data[f'{prefix}[return_format]'] = field.get('return_format', 'id')
        if field['type'] == 'user':
            field_data[f'{prefix}[return_format]'] = field.get('return_format', 'id')
        if field['type'] in ('image', 'file'):
            field_data[f'{prefix}[return_format]'] = field.get('return_format', 'url')
    
    # Step 4: Submit the form
    form_data = {
        '_wpnonce': nonces['_wpnonce'],
        '_wp_http_referer': f'/careconnected/wp-admin/post.php?post={post_id}&action=edit',
        'post_ID': post_id,
        'post_title': title,
        'post_status': 'publish',
        'post_type': 'acf-field-group',
        'acf_field_group[key]': group_key,
        'acf_field_group[style]': 'default',
        'acf_field_group[position]': 'normal',
        'acf_field_group[label_placement]': 'top',
        'acf_field_group[instruction_placement]': 'label',
        'acf_field_group[menu_order]': '0',
        'acf_field_group[active]': '1',
        'acf_field_group[show_in_rest]': '1',
        '_acf_nonce': nonces['_acf_nonce'],
        'save': 'Update',
        'action': 'editpost',
        'originalaction': 'editpost',
        'original_post_status': 'auto-draft',
        'original_publish': 'Publish',
    }
    form_data.update(location_data)
    form_data.update(field_data)
    
    r = session.post(f"{BASE}/post.php", data=form_data, allow_redirects=False)
    
    if r.status_code in (301, 302):
        redirect_url = r.headers.get('Location', '')
        if 'message=' in redirect_url:
            print(f"    OK (post_id={post_id}, redirect={redirect_url[-60:]})")
            return post_id
        else:
            print(f"    Redirect to: {redirect_url[-80:]}")
            return post_id
    else:
        print(f"    HTTP {r.status_code}")
        # Check for errors
        errors = re.findall(r'class="notice-error[^"]*"[^>]*>(.*?)</div>', r.text, re.DOTALL)
        for e in errors:
            clean = re.sub(r'<[^>]+>', '', e).strip()
            print(f"    Error: {clean[:200]}")
        return None

def trash_old_field_groups(old_ids):
    """Move old field groups to trash."""
    for pid in old_ids:
        print(f"  Trashing old field group ID {pid}...")
        # Get nonce for this post
        nonces = get_nonces(f"{BASE}/post.php?post={pid}&action=edit")
        if nonces['_wpnonce']:
            r = session.get(f"{BASE}/post.php?post={pid}&action=trash&_wpnonce={nonces['_wpnonce']}", allow_redirects=False)
            print(f"    Status: {r.status_code}")
        else:
            print(f"    Could not get nonce")


# Load the ACF import JSON
with open('/tmp/acf_import.json') as f:
    groups = json.load(f)

print(f"=== Importing {len(groups)} ACF field groups ===\n")

# Old field group IDs to trash (from our earlier scan)
OLD_IDS = [45, 74, 86, 91, 97, 104, 111, 120, 185, 194, 204, 212, 352, 360, 365, 529, 530, 531, 532, 533]

print("Step 1: Trashing old field groups...")
trash_old_field_groups(OLD_IDS)

print(f"\nStep 2: Creating {len(groups)} new field groups...")
created = 0
failed = 0
for g in groups:
    result = create_field_group(
        title=g['title'],
        group_key=g['key'],
        location_rules=g['location'],
        fields=g['fields'],
    )
    if result:
        created += 1
    else:
        failed += 1
    time.sleep(0.3)  # Be gentle

print(f"\n=== Done: {created} created, {failed} failed ===")
