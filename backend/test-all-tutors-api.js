const axios = require('axios');

async function testAllTutorsAPI() {
  try {
    console.log('Testing all tutors API...');
    
    // 測試本地API
    console.log('\n=== Testing Local API ===');
    const localResponse = await axios.get('http://localhost:3001/api/tutors');
    console.log('Local API Response Status:', localResponse.status);
    console.log('Local API Response Data:', JSON.stringify(localResponse.data, null, 2));
    
    // 測試Vercel部署的API
    console.log('\n=== Testing Vercel API ===');
    const vercelResponse = await axios.get('https://hihitutor-backend.vercel.app/api/tutors');
    console.log('Vercel API Response Status:', vercelResponse.status);
    console.log('Vercel API Response Data:', JSON.stringify(vercelResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testAllTutorsAPI(); 