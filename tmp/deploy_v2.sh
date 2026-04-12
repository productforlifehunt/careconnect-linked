#!/bin/bash
# Deploy all V2 pages to WordPress
# Usage: COOKIE="..." NONCE="..." bash deploy_v2.sh

cd "/Users/guoweijiang/Downloads/challenged/tmp"

if [ -z "$COOKIE" ] || [ -z "$NONCE" ]; then
  echo "ERROR: Set COOKIE and NONCE env vars first."
  echo ""
  echo "To get them:"
  echo "1. Log in to WordPress admin at http://170.106.171.59:8080/careconnected/wp-admin/"
  echo "2. Open browser console and run:"
  echo "   document.cookie  → copy the full cookie string"
  echo "   wpApiSettings.nonce  → copy the nonce"
  echo ""
  exit 1
fi

echo "Deploying 11 V2 pages to WordPress..."
echo ""

echo "Deploying dashboard..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages/24" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_dashboard.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying bookings..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages/162" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_bookings.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying inbox..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages/161" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_messages.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying jobs..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_jobs.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying profile..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_profile.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying notifications..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_notifications.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying favorites..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_favorites.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying gps-tracking..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_gps.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying provider-dashboard..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_provider.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying community..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_community.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo "Deploying articles..."
curl -s -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -H "X-WP-Nonce: $NONCE" \
  -d @v2_articles.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  → Page ID: {d.get("id","?")} Status: {d.get("status","?")} Link: {d.get("link","?")}")" 2>/dev/null || echo "  → FAILED"

echo ""
echo "Done! Check pages at http://170.106.171.59:8080/careconnected/"
