// Test script to verify API endpoints are working
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test projects endpoint
    console.log('📋 Testing /api/projects...');
    const response = await fetch('http://localhost:3000/api/projects');
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.items && data.items.length > 0) {
      console.log('🎉 Projects found:', data.items.map(p => p.name).join(', '));
    } else {
      console.log('⚠️ No projects found in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
