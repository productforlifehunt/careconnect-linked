#!/usr/bin/env python3
import json
from html import escape
from pathlib import Path

BASE = 'http://170.106.171.59:8080/careconnected/'
TMP = Path('/Users/guoweijiang/Downloads/challenged/tmp')

pages = {
    25: ('Care Groups', TMP / 'care_groups_v2.html', TMP / 'page25_payload.json'),
    230: ('Cared Ones', TMP / 'cared_ones_v2.html', TMP / 'page230_payload.json'),
}

for page_id, (title, html_path, out_path) in pages.items():
    html = html_path.read_text(encoding='utf-8')
    doc = (
        '<!doctype html><html><head>'
        '<meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        f'<base href="{BASE}">'
        '</head><body style="margin:0;background:#fafafa;">'
        f'{html}'
        '</body></html>'
    )
    srcdoc = escape(doc, quote=True)
    content = (
        '<div style="width:100%;max-width:100%;margin:0;padding:0">'
        '<iframe '
        f'srcdoc="{srcdoc}" '
        'style="width:100%;min-height:4200px;border:0;display:block;background:#fafafa" '
        'loading="eager" '
        'referrerpolicy="same-origin" '
        'onload="try{this.style.height=Math.max(this.contentWindow.document.documentElement.scrollHeight,this.contentWindow.document.body.scrollHeight)+\'px\';}catch(e){this.style.height=\'4200px\';}"'
        '></iframe>'
        '</div>'
    )
    payload = {"title": title, "content": content, "status": "publish"}
    out_path.write_text(json.dumps(payload), encoding='utf-8')
    print(f'wrote {out_path}')
