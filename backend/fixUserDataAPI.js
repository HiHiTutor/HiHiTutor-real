// 通過 API 修復用戶數據的腳本
const fetch = require('node-fetch');

const API_BASE_URL = 'https://hi-hi-tutor-real-backend2.vercel.app/api';

// 修復用戶數據的函數
async function fixUserData() {
  try {
    console.log('🔧 開始修復用戶數據...');
    
    // 1. 獲取用戶數據
    console.log('📥 獲取用戶數據...');
    const userResponse = await fetch(`${API_BASE_URL}/admin/users/1001000`, {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // 需要管理員 token
        'Content-Type': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      console.log('❌ 無法獲取用戶數據，狀態碼:', userResponse.status);
      console.log('請確保有有效的管理員 token');
      return;
    }
    
    const userData = await userResponse.json();
    console.log('✅ 用戶數據獲取成功');
    
    // 2. 檢查當前數據
    const publicCerts = userData.user.tutorProfile?.publicCertificates || [];
    const educationCerts = userData.user.documents?.educationCert || [];
    
    console.log('📊 當前 publicCertificates 數量:', publicCerts.length);
    console.log('📊 當前 educationCert 數量:', educationCerts.length);
    
    // 3. 如果 publicCertificates 有 4 個文件，但 educationCert 只有 3 個
    if (publicCerts.length === 4 && educationCerts.length === 3) {
      console.log('🔧 修復 educationCert 數據...');
      
      // 更新用戶數據
      const updateResponse = await fetch(`${API_BASE_URL}/admin/users/1001000`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documents: {
            educationCert: publicCerts  // 使用 publicCertificates 的數據
          }
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ 數據修復成功!');
        console.log('📊 修復後 educationCert 數量:', publicCerts.length);
      } else {
        console.log('❌ 數據修復失敗，狀態碼:', updateResponse.status);
      }
    } else {
      console.log('ℹ️ 數據已同步，無需修復');
    }
    
  } catch (error) {
    console.error('❌ 修復過程出錯:', error);
  }
}

// 手動修復數據（不需要 API）
function manualFix() {
  console.log('🔧 手動修復數據...');
  console.log('根據你的數據分析：');
  console.log('- S3 實際有 4 個文件');
  console.log('- publicCertificates 有 4 個文件 ✅');
  console.log('- educationCert 只有 3 個文件 ❌');
  console.log('');
  console.log('修復方案：');
  console.log('1. 將 publicCertificates 的 4 個文件同步到 educationCert');
  console.log('2. 確保兩個字段都包含相同的文件列表');
  console.log('');
  console.log('需要修復的文件：');
  console.log('缺少的文件: 1758362820864-asus.jpg');
  console.log('');
  console.log('建議通過後台管理界面手動修復，或聯繫開發人員修復數據庫。');
}

// 運行修復
if (process.argv[2] === '--manual') {
  manualFix();
} else {
  fixUserData();
}
