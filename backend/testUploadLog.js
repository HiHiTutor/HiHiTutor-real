const mongoose = require('mongoose');
const User = require('./models/User');
const UploadLog = require('./models/UploadLog');
require('dotenv').config();

async function testUploadLog() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 找到一個導師用戶
    const tutor = await User.findOne({ userType: 'tutor' });
    if (!tutor) {
      console.log('❌ 找不到導師用戶');
      return;
    }

    console.log('📋 找到導師:', {
      id: tutor._id,
      name: tutor.name,
      email: tutor.email
    });

    // 模擬創建 UploadLog 記錄
    const testUploadLog = new UploadLog({
      userId: tutor._id,
      userNumber: tutor.userId || 'TEST001',
      fileUrl: 'https://example-bucket.s3.amazonaws.com/uploads/user-docs/test/test-file.pdf',
      type: 'document'
    });

    await testUploadLog.save();
    console.log('✅ UploadLog 記錄創建成功:', {
      id: testUploadLog._id,
      userId: testUploadLog.userId,
      userNumber: testUploadLog.userNumber,
      fileUrl: testUploadLog.fileUrl,
      type: testUploadLog.type
    });

    // 驗證記錄是否正確保存
    const savedLog = await UploadLog.findById(testUploadLog._id);
    console.log('📋 保存的記錄:', savedLog);

    // 測試查詢該用戶的所有上傳記錄
    const userUploadLogs = await UploadLog.find({ userId: tutor._id });
    console.log(`📁 該用戶的上傳記錄數量: ${userUploadLogs.length}`);

    // 檢查所有 UploadLog 記錄
    const allUploadLogs = await UploadLog.find();
    console.log(`📊 總 UploadLog 記錄數量: ${allUploadLogs.length}`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testUploadLog(); 