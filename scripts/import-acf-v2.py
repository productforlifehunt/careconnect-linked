#!/usr/bin/env python3
"""
Import ACF field groups into CareConnected WP subsite.
Uses requests session with direct login.
"""
import requests
import json
import re
import time

BASE = "http://170.106.171.59:8080/careconnected/wp-admin"

# Login
session = requests.Session()
r = session.post('http://170.106.171.59:8080/wp-login.php', data={
    'log': 'challenged',
    'pwd': 'challenged5527@@@@@',
    'wp-submit': 'Log In',
    'redirect_to': '/wp-admin/',
    'testcookie': '1',
}, headers={'Cookie': 'wordpress_test_cookie=WP+Cookie+check'}, allow_redirects=True)
print(f"Login: {r.status_code} -> {r.url}")

# Also login to subsite
r2 = session.post('http://170.106.171.59:8080/careconnected/wp-login.php', data={
    'log': 'challenged',
    'pwd': 'challenged5527@@@@@',
    'wp-submit': 'Log In',
    'redirect_to': '/careconnected/wp-admin/',
    'testcookie': '1',
}, headers={'Cookie': 'wordpress_test_cookie=WP+Cookie+check'}, allow_redirects=True)
print(f"Subsite login: {r2.status_code} -> {r2.url}")


def get_nonces(url):
    r = session.get(url)
    wp_nonce = re.findall(r'name="_wpnonce"\s*value="([^"]+)"', r.text)
    acf_nonce = re.findall(r'name="_acf_nonce"\s*value="([^"]+)"', r.text)
    # ACF field groups use JS-based auto-draft, not hidden post_ID input
    post_id = re.findall(r'name="post_ID"\s*value="(\d+)"', r.text)
    if not post_id:
        # Try JS-embedded post_id (ACF auto-draft)
        post_id = re.findall(r'"post_id":(\d+)', r.text)
    if not post_id:
        # Try URL parameter after redirect
        post_id = re.findall(r'post=(\d+)', r.url)
    return {
        '_wpnonce': wp_nonce[0] if wp_nonce else None,
        '_acf_nonce': acf_nonce[0] if acf_nonce else None,
        'post_ID': post_id[0] if post_id else None,
    }


def trash_field_group(pid):
    """Trash a field group by ID."""
    # Need the trash nonce - it's different from the edit nonce
    r = session.get(f"{BASE}/edit.php?post_type=acf-field-group")
    # Find the trash link for this specific post
    pattern = rf'post={pid}&amp;action=trash&amp;_wpnonce=([a-f0-9]+)'
    nonces = re.findall(pattern, r.text)
    if nonces:
        r2 = session.get(f"{BASE}/post.php?post={pid}&action=trash&_wpnonce={nonces[0]}", allow_redirects=False)
        return r2.status_code in (301, 302, 200)
    return False


def create_field_group(title, group_key, location_rules, fields):
    """Create an ACF field group with fields."""
    
    # Get auto-draft nonces
    nonces = get_nonces(f"{BASE}/post-new.php?post_type=acf-field-group")
    if not nonces['_wpnonce'] or not nonces['_acf_nonce']:
        print(f"    FAIL: no nonces")
        return None
    
    post_id = nonces['post_ID']
    if not post_id:
        print(f"    FAIL: no post_ID")
        return None
    
    # Build location rule data
    location_data = {}
    for i, rule_group in enumerate(location_rules):
        for j, rule in enumerate(rule_group):
            location_data[f'acf_field_group[location][{i}][{j}][param]'] = rule['param']
            location_data[f'acf_field_group[location][{i}][{j}][operator]'] = rule['operator']
            location_data[f'acf_field_group[location][{i}][{j}][value]'] = rule['value']
    
    # Build field data
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
        
        if field['type'] == 'select' and 'choices' in field:
            for ck, cv in field['choices'].items():
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
    
    # Submit form
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
        loc = r.headers.get('Location', '')
        if 'message=' in loc:
            return post_id
        return post_id
    else:
        # Check for errors in response
        errors = re.findall(r'notice-error[^>]*>(.*?)</div>', r.text[:2000], re.DOTALL)
        for e in errors:
            clean = re.sub(r'<[^>]+>', '', e).strip()
            print(f"    Error: {clean[:200]}")
        return None


# Load ACF import JSON
with open('/tmp/acf_import.json') as f:
    groups = json.load(f)

print(f"\n=== Processing {len(groups)} ACF field groups ===\n")

# Step 1: Trash old field groups
OLD_IDS = [45, 74, 86, 91, 97, 104, 111, 120, 185, 194, 204, 212, 352, 360, 365, 529, 530, 531, 532, 533]
print("Step 1: Trashing old field groups...")
trashed = 0
for pid in OLD_IDS:
    ok = trash_field_group(pid)
    status = "OK" if ok else "SKIP"
    print(f"  [{status}] ID {pid}")
    if ok:
        trashed += 1
    time.sleep(0.1)
print(f"  Trashed: {trashed}/{len(OLD_IDS)}\n")

# Step 2: Create new field groups
print("Step 2: Creating new field groups...")
created = 0
failed = 0
for g in groups:
    print(f"  [{created+failed+1}/{len(groups)}] {g['title']}...", end=" ", flush=True)
    result = create_field_group(
        title=g['title'],
        group_key=g['key'],
        location_rules=g['location'],
        fields=g['fields'],
    )
    if result:
        print(f"OK (ID={result})")
        created += 1
    else:
        print("FAILED")
        failed += 1
    time.sleep(0.3)

print(f"\n=== Done: {created} created, {failed} failed ===")
