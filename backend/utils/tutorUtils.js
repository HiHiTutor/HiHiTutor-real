const User = require('../models/User');

/**
 * 生成唯一的導師 ID（防止 tutorId 重複）
 * 格式：TU + 4位數字（例如：TU0001, TU0002, ...）
 * 
 * @param {Object} UserModel - User 模型
 * @returns {Promise<string>} 唯一的 tutorId
 */
async function generateUniqueTutorId(UserModel = User) {
  let nextNumber = 1;
  let newTutorId = '';
  let exists = true;
  let maxAttempts = 1000; // 防止無限循環
  let attempts = 0;

  console.log('🔢 開始生成唯一 tutorId...');

  while (exists && attempts < maxAttempts) {
    newTutorId = `TU${String(nextNumber).padStart(4, '0')}`;
    
    try {
      exists = await UserModel.exists({ tutorId: newTutorId });
      if (exists) {
        console.log(`⚠️  tutorId ${newTutorId} 已存在，嘗試下一個...`);
        nextNumber++;
      }
    } catch (error) {
      console.error('❌ 檢查 tutorId 時發生錯誤:', error);
      throw new Error('Failed to check existing tutorId');
    }
    
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('無法生成唯一的 tutorId，請檢查數據庫狀態');
  }

  console.log(`✅ 成功生成唯一 tutorId: ${newTutorId}`);
  return newTutorId;
}

/**
 * 生成傳統格式的導師 ID（2字母+4數字）
 * 格式：AA0001, AA0002, ..., AB0001, AB0002, ...
 * 
 * @param {Object} UserModel - User 模型
 * @returns {Promise<string>} 唯一的 tutorId
 */
async function generateTraditionalTutorId(UserModel = User) {
  try {
    console.log('🔢 開始生成傳統格式 tutorId...');
    
    const lastTutor = await UserModel.findOne({ 
      tutorId: { $exists: true, $ne: null } 
    }).sort({ tutorId: -1 });
    
    let prefix = 'AA';
    let number = 1;
    
    if (lastTutor && lastTutor.tutorId) {
      prefix = lastTutor.tutorId.slice(0, 2);
      number = parseInt(lastTutor.tutorId.slice(2), 10) + 1;
      
      if (number > 9999) {
        const firstChar = prefix.charCodeAt(0);
        const secondChar = prefix.charCodeAt(1);
        
        if (secondChar < 90) { // 'Z'
          prefix = String.fromCharCode(firstChar, secondChar + 1);
        } else if (firstChar < 90) {
          prefix = String.fromCharCode(firstChar + 1, 65); // 65 = 'A'
        } else {
          throw new Error('tutorId 已達上限 (ZZ9999)');
        }
        number = 1;
      }
    }
    
    const newTutorId = `${prefix}${number.toString().padStart(4, '0')}`;
    console.log(`✅ 成功生成傳統格式 tutorId: ${newTutorId}`);
    
    return newTutorId;
  } catch (error) {
    console.error('❌ 生成傳統格式 tutorId 失敗:', error);
    throw error;
  }
}

/**
 * 驗證 tutorId 格式
 * 
 * @param {string} tutorId - 要驗證的 tutorId
 * @param {string} format - 格式類型 ('simple' | 'traditional')
 * @returns {boolean} 是否有效
 */
function validateTutorId(tutorId, format = 'simple') {
  if (!tutorId || typeof tutorId !== 'string') {
    return false;
  }

  if (format === 'simple') {
    // 簡單格式：TU + 4位數字
    return /^TU\d{4}$/.test(tutorId);
  } else if (format === 'traditional') {
    // 傳統格式：2字母 + 4位數字
    return /^[A-Z]{2}\d{4}$/.test(tutorId);
  }

  return false;
}

/**
 * 檢查 tutorId 是否已存在
 * 
 * @param {string} tutorId - 要檢查的 tutorId
 * @param {Object} UserModel - User 模型
 * @returns {Promise<boolean>} 是否存在
 */
async function isTutorIdExists(tutorId, UserModel = User) {
  try {
    const exists = await UserModel.exists({ tutorId: tutorId });
    return exists;
  } catch (error) {
    console.error('❌ 檢查 tutorId 存在性時發生錯誤:', error);
    throw error;
  }
}

/**
 * 批量修復缺失的 tutorId
 * 
 * @param {Object} UserModel - User 模型
 * @param {string} format - 生成格式 ('simple' | 'traditional')
 * @returns {Promise<Object>} 修復結果
 */
async function fixMissingTutorIds(UserModel = User, format = 'simple') {
  try {
    console.log('🔧 開始修復缺失的 tutorId...');
    
    // 查找所有沒有 tutorId 的導師
    const tutorsWithoutTutorId = await UserModel.find({
      userType: 'tutor',
      $or: [
        { tutorId: { $exists: false } },
        { tutorId: null },
        { tutorId: undefined }
      ]
    });
    
    console.log(`📊 找到 ${tutorsWithoutTutorId.length} 個沒有 tutorId 的導師`);
    
    if (tutorsWithoutTutorId.length === 0) {
      return {
        success: true,
        message: '所有導師都已有 tutorId',
        fixed: 0,
        total: 0
      };
    }
    
    let fixedCount = 0;
    const errors = [];
    
    // 為每個導師生成 tutorId
    for (const tutor of tutorsWithoutTutorId) {
      try {
        const tutorId = format === 'simple' 
          ? await generateUniqueTutorId(UserModel)
          : await generateTraditionalTutorId(UserModel);
        
        await UserModel.findByIdAndUpdate(tutor._id, {
          tutorId: tutorId,
          remarks: tutor.remarks 
            ? `${tutor.remarks}; 系統自動補上 tutorId` 
            : '系統自動補上 tutorId'
        });
        
        console.log(`✅ 為導師 ${tutor.name} 分配 tutorId: ${tutorId}`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ 為導師 ${tutor.name} 分配 tutorId 失敗:`, error);
        errors.push({
          tutorId: tutor._id,
          name: tutor.name,
          error: error.message
        });
      }
    }
    
    const result = {
      success: errors.length === 0,
      message: `修復完成，成功修復 ${fixedCount} 個導師的 tutorId`,
      fixed: fixedCount,
      total: tutorsWithoutTutorId.length,
      errors: errors
    };
    
    console.log('📊 修復結果:', result);
    return result;
    
  } catch (error) {
    console.error('❌ 批量修復 tutorId 失敗:', error);
    throw error;
  }
}

module.exports = {
  generateUniqueTutorId,
  generateTraditionalTutorId,
  validateTutorId,
  isTutorIdExists,
  fixMissingTutorIds
}; 