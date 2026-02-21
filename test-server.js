// Quick test script to verify server endpoints
// Run with: node test-server.js

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

async function testEndpoints() {
  console.log('Testing server endpoints...\n');
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  // Test 1: Health check
  try {
    const res = await axios.get(`${API_BASE_URL}/test`);
    console.log('✅ Test endpoint works:', res.data);
  } catch (error) {
    console.log('❌ Test endpoint failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   → Server is not running! Start it with: npm run server');
    }
    return;
  }

  // Test 2: Auth route exists
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {});
    console.log('⚠️  Login endpoint exists (expected error):', res.status);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Auth route exists (got expected validation error)');
    } else if (error.response && error.response.status === 404) {
      console.log('❌ Auth route NOT found (404)');
    } else {
      console.log('✅ Auth route exists (got error but not 404):', error.response?.status || error.message);
    }
  }

  // Test 3: Register lawyer route
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/register-lawyer`, {});
    console.log('⚠️  Register lawyer endpoint exists:', res.status);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Register lawyer route exists (got expected validation error)');
    } else if (error.response && error.response.status === 404) {
      console.log('❌ Register lawyer route NOT found (404)');
      console.log('   → Check if server was restarted after adding the route');
    } else {
      console.log('✅ Register lawyer route exists (got error but not 404):', error.response?.status || error.message);
    }
  }

  console.log('\n✅ All tests complete!');
}

testEndpoints().catch(console.error);
