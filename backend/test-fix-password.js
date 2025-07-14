const fetch = require('node-fetch');

async function testFixPassword() {
  try {
    console.log('🔧 Testing password fix API...');
    
    const response = await fetch('https://hi-hi-tutor-real-backend2.vercel.app/api/admin/fix-user-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '90767559',
        newPassword: '88888888'
      })
    });

    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', data);
    
    if (response.ok) {
      console.log('✅ Password fixed successfully!');
      console.log('🔍 User info:', data.user);
    } else {
      console.log('❌ Failed to fix password:', data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFixPassword(); 