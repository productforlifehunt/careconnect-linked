#!/usr/bin/env python3
"""
Import ACF field groups into CareConnected WP subsite - v3.
Uses the correct ACF field submission format with numeric IDs.
"""
import requests
import json
import re
import time

BASE = "http://170.106.171.59:8080/careconnected/wp-admin"

session = requests.Session()
session.post('http://170.106.171.59:8080/wp-login.php', data={
    'log': 'challenged', 'pwd': 'challenged5527@@@@@',
    'wp-submit': 'Log In', 'redirect_to': '/wp-admin/', 'testcookie': '1',
}, headers={'Cookie': 'wordpress_test_cookie=WP+Cookie+check'}, allow_redirects=True)
print("Logged in.")


def get_nonces_and_post_id(url):
    """Fetch page and extract nonces + post_ID."""
    r = session.get(url)
    wp_nonce = re.findall(r'name="_wpnonce"\s*value="([^"]+)"', r.text)
    acf_nonce = re.findall(r'name="_acf_nonce"\s*value="([^"]+)"', r.text)
    post_id = re.findall(r'name="post_ID"\s*value="(\d+)"', r.text)
    if not post_id:
        post_id = re.findall(r'"post_id":(\d+)', r.text)
    if not post_id:
        post_id = re.findall(r'post=(\d+)', r.url)
    return {
        '_wpnonce': wp_nonce[0] if wp_nonce else None,
        '_acf_nonce': acf_nonce[0] if acf_nonce else None,
        'post_ID': post_id[0] if post_id else None,
    }


def build_field_form_data(fields, group_key):
    """Build form data for ACF fields using the correct format.
    
    ACF expects new fields with numeric placeholder IDs.
    For new fields not yet saved, we use 'new_N' style IDs.
    The format is: acf_fields[ID][property] = value
    """
    data = {}
    for idx, field in enumerate(fields):
        # Use a numeric-style placeholder for new fields
        fid = f"new_{idx}"
        prefix = f"acf_fields[{fid}]"
        
        data[f"{prefix}[ID]"] = ""  # empty = new field
        data[f"{prefix}[key]"] = field["key"]
        data[f"{prefix}[label]"] = field["label"]
        data[f"{prefix}[name]"] = field["name"]
        data[f"{prefix}[type]"] = field["type"]
        data[f"{prefix}[required]"] = str(field.get("required", 0))
        data[f"{prefix}[menu_order]"] = str(idx)
        data[f"{prefix}[parent]"] = group_key
        data[f"{prefix}[save]"] = "field"
        data[f"{prefix}[instructions]"] = ""
        data[f"{prefix}[conditional_logic]"] = "0"
        data[f"{prefix}[wrapper][width]"] = ""
        data[f"{prefix}[wrapper][class]"] = ""
        data[f"{prefix}[wrapper][id]"] = ""
        
        # Type-specific settings
        if field["type"] == "text":
            data[f"{prefix}[default_value]"] = ""
            data[f"{prefix}[maxlength]"] = ""
            data[f"{prefix}[placeholder]"] = ""
            data[f"{prefix}[prepend]"] = ""
            data[f"{prefix}[append]"] = ""
        elif field["type"] == "textarea":
            data[f"{prefix}[default_value]"] = ""
            data[f"{prefix}[maxlength]"] = ""
            data[f"{prefix}[rows]"] = ""
            data[f"{prefix}[placeholder]"] = ""
            data[f"{prefix}[new_lines]"] = ""
        elif field["type"] == "number":
            data[f"{prefix}[default_value]"] = ""
            data[f"{prefix}[min]"] = ""
            data[f"{prefix}[max]"] = ""
            data[f"{prefix}[step]"] = ""
            data[f"{prefix}[placeholder]"] = ""
            data[f"{prefix}[prepend]"] = ""
            data[f"{prefix}[append]"] = ""
        elif field["type"] == "email":
            data[f"{prefix}[default_value]"] = ""
            data[f"{prefix}[placeholder]"] = ""
        elif field["type"] == "url":
            data[f"{prefix}[default_value]"] = ""
            data[f"{prefix}[placeholder]"] = ""
        elif field["type"] == "select":
            choices = field.get("choices", {})
            choices_text = "\n".join(f"{k} : {v}" for k, v in choices.items())
            data[f"{prefix}[choices]"] = choices_text
            data[f"{prefix}[default_value]"] = ""
            data[f"{prefix}[return_format]"] = "value"
            data[f"{prefix}[multiple]"] = "0"
            data[f"{prefix}[allow_null]"] = "0"
            data[f"{prefix}[ui]"] = "0"
            data[f"{prefix}[ajax]"] = "0"
            data[f"{prefix}[placeholder]"] = ""
        elif field["type"] == "true_false":
            data[f"{prefix}[default_value]"] = str(field.get("default_value", 0))
            data[f"{prefix}[message]"] = ""
            data[f"{prefix}[ui]"] = "1"
        elif field["type"] == "date_picker":
            data[f"{prefix}[display_format]"] = field.get("display_format", "d/m/Y")
            data[f"{prefix}[return_format]"] = field.get("return_format", "Y-m-d")
            data[f"{prefix}[first_day]"] = "1"
        elif field["type"] == "date_time_picker":
            data[f"{prefix}[display_format]"] = field.get("display_format", "d/m/Y g:i a")
            data[f"{prefix}[return_format]"] = field.get("return_format", "Y-m-d H:i:s")
            data[f"{prefix}[first_day]"] = "1"
        elif field["type"] == "post_object":
            for pi, pt in enumerate(field.get("post_type", [])):
                data[f"{prefix}[post_type][{pi}]"] = pt
            data[f"{prefix}[return_format]"] = field.get("return_format", "id")
            data[f"{prefix}[multiple]"] = "0"
            data[f"{prefix}[allow_null]"] = "0"
            data[f"{prefix}[ui]"] = "1"
        elif field["type"] == "relationship":
            for pi, pt in enumerate(field.get("post_type", [])):
                data[f"{prefix}[post_type][{pi}]"] = pt
            data[f"{prefix}[return_format]"] = field.get("return_format", "id")
            data[f"{prefix}[min]"] = ""
            data[f"{prefix}[max]"] = ""
        elif field["type"] == "user":
            data[f"{prefix}[return_format]"] = field.get("return_format", "id")
            data[f"{prefix}[multiple]"] = "0"
            data[f"{prefix}[allow_null]"] = "0"
        elif field["type"] == "image":
            data[f"{prefix}[return_format]"] = field.get("return_format", "url")
            data[f"{prefix}[preview_size]"] = "medium"
            data[f"{prefix}[library]"] = "all"
        elif field["type"] == "file":
            data[f"{prefix}[return_format]"] = field.get("return_format", "url")
            data[f"{prefix}[library]"] = "all"
        elif field["type"] == "color_picker":
            data[f"{prefix}[default_value]"] = ""
            data[f"{prefix}[enable_opacity]"] = "0"
    
    return data


def create_field_group(title, group_key, location_rules, fields):
    """Create an ACF field group with its fields."""
    nonces = get_nonces_and_post_id(f"{BASE}/post-new.php?post_type=acf-field-group")
    if not nonces["_wpnonce"] or not nonces["post_ID"]:
        return None
    
    post_id = nonces["post_ID"]
    
    # Location rules
    loc_data = {}
    for i, rule_group in enumerate(location_rules):
        for j, rule in enumerate(rule_group):
            loc_data[f"acf_field_group[location][{i}][{j}][param]"] = rule["param"]
            loc_data[f"acf_field_group[location][{i}][{j}][operator]"] = rule["operator"]
            loc_data[f"acf_field_group[location][{i}][{j}][value]"] = rule["value"]
    
    # Field data
    field_data = build_field_form_data(fields, group_key)
    
    # Build full form
    form = {
        "_wpnonce": nonces["_wpnonce"],
        "_wp_http_referer": f"/careconnected/wp-admin/post.php?post={post_id}&action=edit",
        "post_ID": post_id,
        "post_title": title,
        "post_status": "publish",
        "post_type": "acf-field-group",
        "acf_field_group[key]": group_key,
        "acf_field_group[style]": "default",
        "acf_field_group[position]": "normal",
        "acf_field_group[label_placement]": "top",
        "acf_field_group[instruction_placement]": "label",
        "acf_field_group[menu_order]": "0",
        "acf_field_group[active]": "1",
        "acf_field_group[show_in_rest]": "1",
        "_acf_nonce": nonces["_acf_nonce"],
        "_acf_changed": "1",
        "save": "Update",
        "action": "editpost",
        "originalaction": "editpost",
        "original_post_status": "auto-draft",
        "original_publish": "Publish",
    }
    form.update(loc_data)
    form.update(field_data)
    
    r = session.post(f"{BASE}/post.php", data=form, allow_redirects=False)
    return post_id if r.status_code in (301, 302) else None


def trash_group(pid):
    """Trash a field group."""
    r = session.get(f"{BASE}/edit.php?post_type=acf-field-group")
    pattern = rf"post={pid}&amp;action=trash&amp;_wpnonce=([a-f0-9]+)"
    nonces = re.findall(pattern, r.text)
    if nonces:
        session.get(f"{BASE}/post.php?post={pid}&action=trash&_wpnonce={nonces[0]}", allow_redirects=False)
        return True
    return False


# Load ACF config
with open("/tmp/acf_import.json") as f:
    groups = json.load(f)

print(f"\n=== Step 1: Trash the empty field groups we created in v2 ===")
# Get all current field group IDs from the list page
r = session.get(f"{BASE}/edit.php?post_type=acf-field-group&posts_per_page=100")
current_ids = re.findall(r'id="post-(\d+)"', r.text)
current_titles = re.findall(r'class="row-title"[^>]*>([^<]+)<', r.text)
v2_groups = []
for pid, title in zip(current_ids, current_titles):
    if "v2" in title or title in [g["title"] for g in groups]:
        v2_groups.append((pid, title))

print(f"Found {len(v2_groups)} groups to trash from v2 run")
for pid, title in v2_groups:
    ok = trash_group(pid)
    print(f"  {'OK' if ok else 'SKIP'}: {title} (ID {pid})")
    time.sleep(0.1)

# Also trash the remaining old groups
OLD_IDS = [91, 194, 204, 212]  # ones that weren't trashed before
for pid in OLD_IDS:
    ok = trash_group(pid)
    print(f"  {'OK' if ok else 'SKIP'}: old group ID {pid}")
    time.sleep(0.1)

print(f"\n=== Step 2: Create {len(groups)} field groups with fields ===")
created = 0
failed = 0
for g in groups:
    n = created + failed + 1
    print(f"  [{n}/{len(groups)}] {g['title']} ({len(g['fields'])} fields)...", end=" ", flush=True)
    result = create_field_group(g["title"], g["key"], g["location"], g["fields"])
    if result:
        print(f"OK (ID={result})")
        created += 1
    else:
        print("FAILED")
        failed += 1
    time.sleep(0.3)

print(f"\n=== Done: {created} created, {failed} failed ===")

# Step 3: Verify a sample group has fields
if created > 0:
    print("\n=== Step 3: Verification ===")
    r = session.get(f"{BASE}/edit.php?post_type=acf-field-group&posts_per_page=5&orderby=date&order=desc")
    ids = re.findall(r'id="post-(\d+)"', r.text)
    titles = re.findall(r'class="row-title"[^>]*>([^<]+)<', r.text)
    if ids:
        # Check the first group
        test_id = ids[0]
        test_title = titles[0] if titles else "?"
        r2 = session.get(f"{BASE}/post.php?post={test_id}&action=edit")
        # Count actual field child posts
        field_ids = re.findall(r'acf_fields\[(\d+)\]\[key\]', r2.text)
        print(f"  Checking '{test_title}' (ID {test_id}): {len(field_ids)} fields saved")
        if field_ids:
            for fid in field_ids[:5]:
                name = re.findall(rf'acf_fields\[{fid}\]\[name\]"[^>]*value="([^"]*)"', r2.text)
                ftype = re.findall(rf'acf_fields\[{fid}\]\[type\]"[^>]*value="([^"]*)"', r2.text)
                print(f"    Field {fid}: {name[0] if name else '?'} ({ftype[0] if ftype else '?'})")
