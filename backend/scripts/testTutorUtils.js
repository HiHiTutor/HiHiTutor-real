const mongoose = require('mongoose');
require('dotenv').config();

const { 
  generateUniqueTutorId, 
  generateTraditionalTutorId, 
  validateTutorId, 
  isTutorIdExists, 
  fixMissingTutorIds 
} = require('../utils/tutorUtils');

const User = require('../models/User');

/**
 * 測試導師 ID 工具函數
 */
async function testTutorUtils() {
  try {
    console.log('🧪 開始測試導師 ID 工具函數...\n');
    
    // 連接數據庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功\n');
    
    // 測試 1: 生成簡單格式的 tutorId
    console.log('1️⃣ 測試生成簡單格式 tutorId...');
    try {
      const simpleTutorId = await generateUniqueTutorId(User);
      console.log(`✅ 生成的簡單格式 tutorId: ${simpleTutorId}`);
      console.log(`✅ 格式驗證: ${validateTutorId(simpleTutorId, 'simple')}`);
    } catch (error) {
      console.error('❌ 生成簡單格式 tutorId 失敗:', error.message);
    }
    
    // 測試 2: 生成傳統格式的 tutorId
    console.log('\n2️⃣ 測試生成傳統格式 tutorId...');
    try {
      const traditionalTutorId = await generateTraditionalTutorId(User);
      console.log(`✅ 生成的傳統格式 tutorId: ${traditionalTutorId}`);
      console.log(`✅ 格式驗證: ${validateTutorId(traditionalTutorId, 'traditional')}`);
    } catch (error) {
      console.error('❌ 生成傳統格式 tutorId 失敗:', error.message);
    }
    
    // 測試 3: 驗證 tutorId 格式
    console.log('\n3️⃣ 測試 tutorId 格式驗證...');
    const testIds = [
      'TU0001',    // 有效簡單格式
      'TU1234',    // 有效簡單格式
      'AA0001',    // 有效傳統格式
      'ZZ9999',    // 有效傳統格式
      'TU001',     // 無效（少一位數字）
      'TU00001',   // 無效（多一位數字）
      'T0001',     // 無效（少一個字母）
      'TUU0001',   // 無效（多一個字母）
      'AA001',     // 無效傳統格式
      'A0001',     // 無效傳統格式
      '',          // 空字符串
      null,        // null
      undefined    // undefined
    ];
    
    testIds.forEach(id => {
      const simpleValid = validateTutorId(id, 'simple');
      const traditionalValid = validateTutorId(id, 'traditional');
      console.log(`   ${id || 'null'}: 簡單格式=${simpleValid}, 傳統格式=${traditionalValid}`);
    });
    
    // 測試 4: 檢查 tutorId 存在性
    console.log('\n4️⃣ 測試檢查 tutorId 存在性...');
    try {
      const existingTutor = await User.findOne({ tutorId: { $exists: true } });
      if (existingTutor) {
        const exists = await isTutorIdExists(existingTutor.tutorId, User);
        console.log(`✅ 檢查 tutorId ${existingTutor.tutorId} 存在性: ${exists}`);
      } else {
        console.log('⚠️  沒有找到現有的 tutorId 進行測試');
      }
    } catch (error) {
      console.error('❌ 檢查 tutorId 存在性失敗:', error.message);
    }
    
    // 測試 5: 批量修復缺失的 tutorId
    console.log('\n5️⃣ 測試批量修復缺失的 tutorId...');
    try {
      const result = await fixMissingTutorIds(User, 'simple');
      console.log('📊 修復結果:', result);
    } catch (error) {
      console.error('❌ 批量修復失敗:', error.message);
    }
    
    // 測試 6: 統計當前導師 tutorId 情況
    console.log('\n6️⃣ 統計當前導師 tutorId 情況...');
    try {
      const allTutors = await User.find({ userType: 'tutor' });
      const tutorsWithTutorId = allTutors.filter(t => t.tutorId);
      const tutorsWithoutTutorId = allTutors.filter(t => !t.tutorId);
      
      console.log(`📊 導師統計:`);
      console.log(`   - 總導師數: ${allTutors.length}`);
      console.log(`   - 有 tutorId: ${tutorsWithTutorId.length}`);
      console.log(`   - 無 tutorId: ${tutorsWithoutTutorId.length}`);
      
      if (tutorsWithTutorId.length > 0) {
        console.log('\n📋 現有 tutorId 範例:');
        tutorsWithTutorId.slice(0, 5).forEach(tutor => {
          console.log(`   - ${tutor.name}: ${tutor.tutorId}`);
        });
      }
    } catch (error) {
      console.error('❌ 統計失敗:', error.message);
    }
    
    console.log('\n🎉 所有測試完成！');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 數據庫連接已關閉');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  testTutorUtils();
}

module.exports = { testTutorUtils }; 