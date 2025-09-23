// 修復 Vercel 部署中用戶 1001000 的文件數據
// 直接調用 API 來同步文件

const https = require('https');

// 根據你的描述，S3 中只有 2 個文件
const S3_FILES = [
  "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1758213464437-asus.jpg",
  "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1001000/1758362820864-asus.jpg"
];

// 你的 Vercel 部署 URL（請替換為實際的 URL）
const VERCEL_URL = 'https://hi-hi-tutor-real.vercel.app'; // 請替換為你的實際 URL

// 管理員 token（你需要從後台獲取）
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // 請替換為實際的管理員 token

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function fixUserFiles() {
  try {
    console.log('🔧 開始修復用戶 1001000 的文件數據...');
    
    // 1. 首先檢查用戶文件一致性
    console.log('📋 檢查文件一致性...');
    const checkUrl = `${VERCEL_URL}/api/sync-files/users/1001000/consistency`;
    const checkResponse = await makeRequest(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('一致性檢查結果:', checkResponse.data);
    
    // 2. 同步文件字段
    console.log('🔄 同步文件字段...');
    const syncUrl = `${VERCEL_URL}/api/sync-files/users/1001000/sync`;
    const syncResponse = await makeRequest(syncUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourceField: 'educationCert'
      })
    });
    
    console.log('同步結果:', syncResponse.data);
    
    // 3. 如果同步失敗，嘗試直接更新用戶數據
    if (!syncResponse.data.success) {
      console.log('⚠️ 同步失敗，嘗試直接更新...');
      
      // 這裡需要你提供正確的 API 端點來直接更新用戶數據
      // 或者你可以手動在後台刪除多餘的文件記錄
      console.log('請手動在後台刪除多餘的文件記錄，只保留以下 2 個文件：');
      S3_FILES.forEach((url, i) => {
        console.log(`  ${i+1}. ${url.split('/').pop()}`);
      });
    }
    
    console.log('✅ 修復完成！');
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
  }
}

// 如果沒有提供 token，顯示使用說明
if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
  console.log('📋 使用說明：');
  console.log('1. 請將 VERCEL_URL 替換為你的實際 Vercel 部署 URL');
  console.log('2. 請將 ADMIN_TOKEN 替換為你的管理員 token');
  console.log('3. 重新運行此腳本');
  console.log('');
  console.log('或者，你可以直接使用以下方法：');
  console.log('');
  console.log('方法 1: 使用 API 同步');
  console.log(`POST ${VERCEL_URL}/api/sync-files/users/1001000/sync`);
  console.log('Headers: Authorization: Bearer YOUR_ADMIN_TOKEN');
  console.log('Body: {"sourceField": "educationCert"}');
  console.log('');
  console.log('方法 2: 手動在後台刪除多餘文件');
  console.log('在後台管理界面中，刪除以下文件（保留 S3 中實際存在的 2 個）：');
  console.log('- 1757349991036-ChatGPT_Image_2025___7___13__________08_02_09.png');
  console.log('- 1756572113707-_______________.png');
  console.log('- 1756572728552-_______________.png');
  console.log('');
  console.log('保留的文件：');
  console.log('- 1758213464437-asus.jpg');
  console.log('- 1758362820864-asus.jpg');
} else {
  fixUserFiles();
}
