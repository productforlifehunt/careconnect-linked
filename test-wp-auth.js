/**
 * Test script to verify WordPress REST API authentication
 * Run with: node test-wp-auth.js
 */

const WP_URL = 'http://170.106.171.59:8080/wp-json';

// Test 1: Check if WordPress REST API is accessible
async function testAPIAccess() {
  console.log('\n=== Test 1: WordPress REST API Access ===');
  try {
    const response = await fetch(`${WP_URL}/`);
    const data = await response.json();
    console.log('✅ WordPress REST API is accessible');
    console.log('Site name:', data.name);
    console.log('Available routes:', Object.keys(data.routes).length);
  } catch (error) {
    console.error('❌ Failed to access WordPress REST API:', error.message);
  }
}

// Test 2: Test Application Password authentication
async function testAppPassword(username, appPassword) {
  console.log('\n=== Test 2: Application Password Authentication ===');
  try {
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
    const response = await fetch(`${WP_URL}/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Application Password authentication successful');
      console.log('User ID:', user.id);
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

// Test 3: Test JWT token generation (if JWT plugin is installed)
async function testJWTAuth(username, password) {
  console.log('\n=== Test 3: JWT Authentication ===');
  try {
    const response = await fetch(`${WP_URL}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ JWT token generated successfully');
      console.log('Token (first 50 chars):', data.token.substring(0, 50) + '...');
      console.log('User email:', data.user_email);
      
      // Test using the token
      await testJWTToken(data.token);
      return data.token;
    } else {
      const error = await response.json();
      console.log('⚠️  JWT plugin not installed or configured:', error.message);
      return null;
    }
  } catch (error) {
    console.log('⚠️  JWT plugin not available:', error.message);
    return null;
  }
}

// Test 4: Test JWT token usage
async function testJWTToken(token) {
  console.log('\n=== Test 4: Using JWT Token ===');
  try {
    const response = await fetch(`${WP_URL}/wp/v2/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ JWT token works');
      console.log('User ID:', user.id);
      console.log('Username:', user.username);
    } else {
      console.error('❌ JWT token failed');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test 5: Test WooCommerce API access
async function testWooCommerceAPI(username, appPassword) {
  console.log('\n=== Test 5: WooCommerce API Access ===');
  try {
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
    const response = await fetch(`${WP_URL}/wc/v3/products?per_page=1`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ WooCommerce API accessible');
      console.log('Total products:', response.headers.get('x-wp-total'));
    } else {
      console.log('⚠️  WooCommerce API not accessible');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 WordPress Authentication Test Suite');
  console.log('======================================');
  
  // Test basic API access
  await testAPIAccess();
  
  // You need to provide credentials here
  const USERNAME = 'challenged';
  const PASSWORD = 'challenged5527@@@@@';
  const APP_PASSWORD = 'YOUR_APP_PASSWORD_HERE'; // Generate this in WP admin
  
  // Test with regular password (for JWT)
  await testJWTAuth(USERNAME, PASSWORD);
  
  // Test with application password
  if (APP_PASSWORD !== 'YOUR_APP_PASSWORD_HERE') {
    const authSuccess = await testAppPassword(USERNAME, APP_PASSWORD);
    if (authSuccess) {
      await testWooCommerceAPI(USERNAME, APP_PASSWORD);
    }
  } else {
    console.log('\n⚠️  Skipping Application Password tests - please generate an app password first');
    console.log('   Go to: http://170.106.171.59:8080/wp-admin/profile.php');
    console.log('   Scroll to "Application Passwords" section');
    console.log('   Generate a new password and update APP_PASSWORD in this script');
  }
  
  console.log('\n======================================');
  console.log('✅ Tests complete!');
}

// Run tests
runTests().catch(console.error);
