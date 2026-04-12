#!/usr/bin/env python3
"""Deploy Care Groups v2 app to WP page 25 and Cared Ones app to page 230."""
import requests, json, sys

BASE = 'http://170.106.171.59:8080/careconnected'
USER = 'challenged'
PASS = 'challenged5527@@@@@'

# Login and get cookies + nonce
session = requests.Session()
login = session.post(f'{BASE}/wp-login.php', data={
    'log': USER, 'pwd': PASS, 'wp-submit': 'Log In',
    'redirect_to': f'{BASE}/wp-admin/', 'testcookie': '1'
}, allow_redirects=True)
print(f'Login status: {login.status_code}')

# Get nonce from REST API
r = session.get(f'{BASE}/wp-json/', timeout=10)
# Try to get nonce from a page load
admin_page = session.get(f'{BASE}/wp-admin/post.php?post=25&action=edit', timeout=15)
import re
nonce_match = re.search(r'"nonce":"([^"]+)"', admin_page.text)
if not nonce_match:
    nonce_match = re.search(r'wp\.apiFetch\.nonceMiddleware\s*=.*?"([^"]+)"', admin_page.text)
if not nonce_match:
    nonce_match = re.search(r'"rest_nonce":"([^"]+)"', admin_page.text)
if not nonce_match:
    # Try wp-json nonce endpoint
    nonce_match = re.search(r'"nonce":"([^"]+)"', r.text)

nonce = nonce_match.group(1) if nonce_match else ''
print(f'Nonce: {nonce[:10]}...' if nonce else 'WARNING: No nonce found')

headers = {'X-WP-Nonce': nonce, 'Content-Type': 'application/json'}

def deploy_page(page_id, html_file, page_title):
    """Deploy HTML content to a WP page as Gutenberg HTML block."""
    with open(html_file, 'r') as f:
        html = f.read()
    
    # Wrap in Gutenberg HTML block
    content = f'<!-- wp:html -->\n{html}\n<!-- /wp:html -->'
    
    payload = {'content': content, 'title': page_title, 'status': 'publish'}
    r = session.post(f'{BASE}/wp-json/wp/v2/pages/{page_id}', 
                     headers=headers, json=payload, timeout=30)
    print(f'Deploy {page_title} (page {page_id}): {r.status_code}')
    if r.status_code not in (200, 201):
        print(f'Error: {r.text[:500]}')
        return False
    return True

# Deploy Care Groups
if deploy_page(25, '/Users/guoweijiang/Downloads/challenged/tmp/care_groups_v2.html', 'Care Groups'):
    print('✓ Care Groups deployed successfully')
else:
    print('✗ Care Groups deployment failed')
    sys.exit(1)

print('\nDone! Visit: http://170.106.171.59:8080/careconnected/care-groups/')
