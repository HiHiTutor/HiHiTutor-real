const mongoose = require('mongoose');
const User = require('./models/User');
const UploadLog = require('./models/UploadLog');
require('dotenv').config();

async function checkUploadLogs() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 找到待審核的導師
    const pendingTutors = await User.find({ 
      userType: 'tutor', 
      profileStatus: 'pending' 
    });

    console.log(`📊 找到 ${pendingTutors.length} 個待審核導師`);

    for (const tutor of pendingTutors) {
      console.log(`\n🔍 檢查導師: ${tutor.name} (${tutor._id})`);
      
      // 檢查該導師的上傳記錄
      const uploadLogs = await UploadLog.find({ 
        userId: tutor._id 
      }).sort({ createdAt: -1 });

      console.log(`📁 上傳記錄數量: ${uploadLogs.length}`);
      
      if (uploadLogs.length > 0) {
        console.log('📋 上傳記錄詳情:');
        uploadLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. 類型: ${log.type}, 時間: ${log.createdAt}, URL: ${log.fileUrl}`);
        });
      } else {
        console.log('❌ 沒有上傳記錄');
      }

      // 檢查 documents 欄位
      console.log('📄 Documents 欄位:');
      console.log(`  身份證: ${tutor.documents?.idCard || '未設置'}`);
      console.log(`  學歷證書: ${tutor.documents?.educationCert || '未設置'}`);
    }

    // 檢查所有上傳記錄
    const allUploadLogs = await UploadLog.find().sort({ createdAt: -1 });
    console.log(`\n📊 總上傳記錄數量: ${allUploadLogs.length}`);
    
    if (allUploadLogs.length > 0) {
      console.log('📋 最近的上傳記錄:');
      allUploadLogs.slice(0, 5).forEach((log, index) => {
        console.log(`  ${index + 1}. 用戶ID: ${log.userId}, 類型: ${log.type}, 時間: ${log.createdAt}`);
      });
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

checkUploadLogs(); 