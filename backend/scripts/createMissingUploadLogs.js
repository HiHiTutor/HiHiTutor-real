const mongoose = require('mongoose');
const User = require('../models/User');
const UploadLog = require('../models/UploadLog');
require('dotenv').config();

// 連接資料庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');

async function createMissingUploadLogs() {
  try {
    console.log('🔍 開始查找有文件但沒有UploadLog記錄的用戶...');
    
    // 查找所有有documents字段的用戶
    const users = await User.find({
      $or: [
        { 'documents.avatar': { $exists: true, $ne: null, $ne: '' } },
        { 'documents.idCard': { $exists: true, $ne: null, $ne: '' } },
        { 'documents.educationCertificates': { $exists: true, $ne: null } },
        { 'documents.educationCert': { $exists: true, $ne: null, $ne: '' } },
        { 'documents.otherFiles': { $exists: true, $ne: null } }
      ]
    });

    console.log(`📊 找到 ${users.length} 個有文件的用戶`);

    for (const user of users) {
      console.log(`\n👤 處理用戶: ${user.userId} (${user.name})`);
      
      // 檢查是否已有UploadLog記錄
      const existingLogs = await UploadLog.find({ userId: user._id });
      console.log(`   📋 現有UploadLog記錄: ${existingLogs.length} 個`);
      
      if (existingLogs.length > 0) {
        console.log(`   ✅ 用戶 ${user.userId} 已有UploadLog記錄，跳過`);
        continue;
      }

      // 收集所有文件URL
      const fileUrls = [];
      
      if (user.documents?.avatar && user.documents.avatar !== '') {
        fileUrls.push({ url: user.documents.avatar, type: 'image' });
      }
      
      if (user.documents?.idCard && user.documents.idCard !== '') {
        fileUrls.push({ url: user.documents.idCard, type: 'document' });
      }
      
      // 處理 educationCertificates 數組
      if (user.documents?.educationCertificates && Array.isArray(user.documents.educationCertificates)) {
        user.documents.educationCertificates.forEach(cert => {
          if (cert && cert !== '') {
            fileUrls.push({ url: cert, type: 'document' });
          }
        });
      }
      
      // 處理 educationCert 單個文件
      if (user.documents?.educationCert && user.documents.educationCert !== '') {
        fileUrls.push({ url: user.documents.educationCert, type: 'document' });
      }
      
      if (user.documents?.otherFiles && Array.isArray(user.documents.otherFiles)) {
        user.documents.otherFiles.forEach(file => {
          if (file && file !== '') {
            fileUrls.push({ url: file, type: 'general' });
          }
        });
      }

      console.log(`   📁 找到 ${fileUrls.length} 個文件需要創建記錄`);

      // 為每個文件創建UploadLog記錄
      for (const fileInfo of fileUrls) {
        try {
          const uploadLog = new UploadLog({
            userId: user._id,
            userNumber: user.userId,
            fileUrl: fileInfo.url,
            type: fileInfo.type
          });

          await uploadLog.save();
          console.log(`   ✅ 創建UploadLog記錄: ${fileInfo.type} - ${fileInfo.url.substring(0, 50)}...`);
        } catch (error) {
          console.error(`   ❌ 創建UploadLog記錄失敗:`, error.message);
        }
      }
    }

    console.log('\n🎉 完成創建缺失的UploadLog記錄！');
    
    // 顯示統計
    const totalLogs = await UploadLog.countDocuments();
    console.log(`📊 總UploadLog記錄數: ${totalLogs}`);
    
  } catch (error) {
    console.error('❌ 腳本執行失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 資料庫連接已關閉');
  }
}

// 執行腳本
createMissingUploadLogs(); 