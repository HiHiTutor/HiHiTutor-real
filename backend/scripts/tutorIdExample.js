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
 * 實際使用範例：導師 ID 管理
 */
async function tutorIdExample() {
  try {
    console.log('🚀 導師 ID 管理範例\n');
    
    // 連接數據庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功\n');
    
    // 範例 1: 新導師註冊流程
    console.log('📝 範例 1: 新導師註冊流程');
    console.log('=' .repeat(50));
    
    try {
      // 模擬新導師註冊
      const newTutorId = await generateUniqueTutorId(User);
      console.log(`✅ 為新導師生成 tutorId: ${newTutorId}`);
      
      // 驗證生成的 ID 格式
      const isValid = validateTutorId(newTutorId, 'simple');
      console.log(`✅ 格式驗證: ${isValid ? '通過' : '失敗'}`);
      
      // 檢查是否已存在
      const exists = await isTutorIdExists(newTutorId, User);
      console.log(`✅ 存在性檢查: ${exists ? '已存在' : '不存在'}`);
      
      // 模擬創建新導師記錄（實際使用時取消註釋）
      /*
      const newTutor = new User({
        name: '張老師',
        email: 'zhang@example.com',
        phone: '+85212345678',
        tutorId: newTutorId,
        userType: 'tutor',
        tutorProfile: {
          subjects: ['數學', '物理'],
          sessionRate: 200,
          applicationStatus: 'approved'
        }
      });
      await newTutor.save();
      console.log('✅ 新導師記錄已創建');
      */
      
    } catch (error) {
      console.error('❌ 新導師註冊失敗:', error.message);
    }
    
    // 範例 2: 導師申請審核流程
    console.log('\n📋 範例 2: 導師申請審核流程');
    console.log('=' .repeat(50));
    
    try {
      // 模擬審核通過時分配傳統格式的 tutorId
      const traditionalTutorId = await generateTraditionalTutorId(User);
      console.log(`✅ 為審核通過的導師生成 tutorId: ${traditionalTutorId}`);
      
      // 驗證傳統格式
      const isValidTraditional = validateTutorId(traditionalTutorId, 'traditional');
      console.log(`✅ 傳統格式驗證: ${isValidTraditional ? '通過' : '失敗'}`);
      
      // 模擬更新導師狀態（實際使用時取消註釋）
      /*
      await User.findByIdAndUpdate(userId, {
        userType: 'tutor',
        tutorId: traditionalTutorId,
        'tutorProfile.applicationStatus': 'approved',
        profileStatus: 'approved'
      });
      console.log('✅ 導師狀態已更新為已審核');
      */
      
    } catch (error) {
      console.error('❌ 導師申請審核失敗:', error.message);
    }
    
    // 範例 3: 批量數據修復
    console.log('\n🔧 範例 3: 批量數據修復');
    console.log('=' .repeat(50));
    
    try {
      // 檢查並修復缺失的 tutorId
      const result = await fixMissingTutorIds(User, 'simple');
      console.log('📊 修復結果:');
      console.log(`   - 成功: ${result.success}`);
      console.log(`   - 訊息: ${result.message}`);
      console.log(`   - 修復數量: ${result.fixed}/${result.total}`);
      
      if (result.errors.length > 0) {
        console.log('   - 錯誤:');
        result.errors.forEach(error => {
          console.log(`     * ${error.name}: ${error.error}`);
        });
      }
      
    } catch (error) {
      console.error('❌ 批量修復失敗:', error.message);
    }
    
    // 範例 4: 數據驗證和清理
    console.log('\n🧹 範例 4: 數據驗證和清理');
    console.log('=' .repeat(50));
    
    try {
      // 查找所有導師
      const allTutors = await User.find({ userType: 'tutor' });
      console.log(`📊 總導師數: ${allTutors.length}`);
      
      // 檢查 tutorId 情況
      const tutorsWithId = allTutors.filter(t => t.tutorId);
      const tutorsWithoutId = allTutors.filter(t => !t.tutorId);
      
      console.log(`📊 tutorId 統計:`);
      console.log(`   - 有 tutorId: ${tutorsWithId.length}`);
      console.log(`   - 無 tutorId: ${tutorsWithoutId.length}`);
      
      // 驗證現有 tutorId 格式
      const invalidIds = [];
      tutorsWithId.forEach(tutor => {
        const isValidSimple = validateTutorId(tutor.tutorId, 'simple');
        const isValidTraditional = validateTutorId(tutor.tutorId, 'traditional');
        
        if (!isValidSimple && !isValidTraditional) {
          invalidIds.push({
            name: tutor.name,
            tutorId: tutor.tutorId
          });
        }
      });
      
      if (invalidIds.length > 0) {
        console.log(`⚠️  發現 ${invalidIds.length} 個無效格式的 tutorId:`);
        invalidIds.forEach(item => {
          console.log(`   - ${item.name}: ${item.tutorId}`);
        });
      } else {
        console.log('✅ 所有現有 tutorId 格式都有效');
      }
      
    } catch (error) {
      console.error('❌ 數據驗證失敗:', error.message);
    }
    
    // 範例 5: API 端點中的使用
    console.log('\n🌐 範例 5: API 端點中的使用');
    console.log('=' .repeat(50));
    
    // 模擬 API 請求處理
    const mockApiRequest = {
      body: {
        tutorId: 'TU0001',
        action: 'validate'
      }
    };
    
    try {
      // 驗證輸入的 tutorId
      if (mockApiRequest.body.tutorId) {
        const isValid = validateTutorId(mockApiRequest.body.tutorId, 'simple');
        if (!isValid) {
          console.log('❌ API 驗證失敗: 無效的 tutorId 格式');
          // return res.status(400).json({ error: '無效的 tutorId 格式' });
        } else {
          console.log('✅ API 驗證通過: tutorId 格式正確');
          
          // 檢查是否存在
          const exists = await isTutorIdExists(mockApiRequest.body.tutorId, User);
          console.log(`✅ tutorId 存在性: ${exists ? '存在' : '不存在'}`);
        }
      }
      
    } catch (error) {
      console.error('❌ API 處理失敗:', error.message);
    }
    
    console.log('\n🎉 所有範例執行完成！');
    
  } catch (error) {
    console.error('❌ 範例執行失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 數據庫連接已關閉');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  tutorIdExample();
}

module.exports = { tutorIdExample }; 