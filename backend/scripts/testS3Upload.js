const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, BUCKET_NAME } = require('../config/s3');

async function testS3Upload() {
  try {
    console.log('🧪 開始測試 S3 上傳和權限...');
    console.log('📦 Bucket:', BUCKET_NAME);
    
    // 創建一個測試文件
    const testContent = 'This is a test file for S3 upload permission test';
    const testKey = `test-uploads/${Date.now()}-test-file.txt`;
    
    console.log('📁 測試文件 key:', testKey);
    
    // 上傳測試文件
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read'
    });
    
    console.log('📤 正在上傳文件...');
    await s3Client.send(uploadCommand);
    console.log('✅ 文件上傳成功！');
    
    // 生成公開 URL
    const publicUrl = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${testKey}`;
    console.log('🔗 公開 URL:', publicUrl);
    
    // 嘗試讀取文件（模擬公開訪問）
    console.log('📖 測試公開讀取...');
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey
    });
    
    await s3Client.send(getCommand);
    console.log('✅ 文件可以正常讀取！');
    
    console.log('\n🎉 S3 測試完成！');
    console.log('📋 請在瀏覽器中打開以下 URL 測試：');
    console.log(publicUrl);
    
  } catch (error) {
    console.error('❌ S3 測試失敗:', error);
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 可能的解決方案：');
      console.log('1. 檢查 AWS IAM 用戶權限');
      console.log('2. 檢查 S3 Bucket 的 Block Public Access 設置');
      console.log('3. 設置 Bucket Policy 允許公開讀取');
    }
  }
}

// 執行測試
testS3Upload(); 