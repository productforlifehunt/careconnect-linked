#!/usr/bin/env python3
import re
import sys
from pathlib import Path

import json
import urllib.parse
import urllib.request
import http.cookiejar

BASE = 'http://170.106.171.59:8080/careconnected'
USER = 'challenged'
PASS = 'challenged5527@@@@@'

PAGES = [
    {
        'id': 295,
        'title': 'Care Providers',
        'source': Path('/Users/guoweijiang/Downloads/challenged/tmp/page295_store_listing_real.txt'),
        'wrap_html_block': False,
    },
    {
        'id': 534,
        'title': 'Care Circle',
        'source': Path('/Users/guoweijiang/Downloads/challenged/tmp/care_groups_v2.html'),
        'wrap_html_block': True,
    },
]


def build_opener() -> urllib.request.OpenerDirector:
    cookie_jar = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))


def open_url(opener: urllib.request.OpenerDirector, url: str, data: bytes | None = None, headers: dict | None = None) -> tuple[int, str]:
    request = urllib.request.Request(url, data=data, headers=headers or {})
    with opener.open(request, timeout=60) as response:
        return response.getcode(), response.read().decode('utf-8', errors='replace')


def login_session() -> tuple[urllib.request.OpenerDirector, str]:
    opener = build_opener()
    login_payload = urllib.parse.urlencode({
        'log': USER,
        'pwd': PASS,
        'wp-submit': 'Log In',
        'redirect_to': f'{BASE}/wp-admin/',
        'testcookie': '1',
    }).encode('utf-8')
    login_status, _ = open_url(
        opener,
        f'{BASE}/wp-login.php',
        data=login_payload,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    print(f'Login status: {login_status}')

    _, admin_text = open_url(opener, f'{BASE}/wp-admin/post.php?post=24&action=edit')
    nonce_match = re.search(r'"nonce":"([^"]+)"', admin_text)
    if not nonce_match:
        nonce_match = re.search(r'wp\.apiFetch\.nonceMiddleware\s*=.*?"([^"]+)"', admin_text)
    if not nonce_match:
        nonce_match = re.search(r'"rest_nonce":"([^"]+)"', admin_text)
    if not nonce_match:
        raise RuntimeError('Could not find WP REST nonce')

    nonce = nonce_match.group(1)
    print(f'Nonce: {nonce[:10]}...')
    return opener, nonce


def deploy_page(opener: urllib.request.OpenerDirector, nonce: str, page_id: int, title: str, source: Path, wrap_html_block: bool) -> None:
    html = source.read_text()
    content = f'<!-- wp:html -->\n{html}\n<!-- /wp:html -->' if wrap_html_block else html
    payload = {'content': content, 'title': title, 'status': 'publish'}
    status_code, response_text = open_url(
        opener,
        f'{BASE}/wp-json/wp/v2/pages/{page_id}',
        data=json.dumps(payload).encode('utf-8'),
        headers={'X-WP-Nonce': nonce, 'Content-Type': 'application/json'},
    )
    print(f'Deploy {title} ({page_id}): {status_code}')
    if status_code not in (200, 201):
        print(response_text[:1000])
        raise RuntimeError(f'Failed deploying page {page_id}')


if __name__ == '__main__':
    session, nonce = login_session()
    for page in PAGES:
        deploy_page(session, nonce, page['id'], page['title'], page['source'], page['wrap_html_block'])
    print('Done.')
