const mongoose = require('mongoose');
const TeachingMode = require('../models/TeachingMode');
require('dotenv').config();

// 統一的教學模式資料 - 基於 backend/constants/teachingModeOptions.js
const TEACHING_MODE_DATA = [
  {
    value: 'both',
    label: '皆可',
    subCategories: [],
    sortOrder: 1,
    legacyMappings: [
      { oldValue: 'both', newValue: 'both' }
    ]
  },
  {
    value: 'in-person',
    label: '面授',
    subCategories: [
      { value: 'one-on-one', label: '一對一' },
      { value: 'small-group', label: '小班教學' },
      { value: 'large-center', label: '補習社' }
    ],
    sortOrder: 2,
    legacyMappings: [
      { oldValue: 'in-person', newValue: 'in-person' },
      { oldValue: 'face-to-face', newValue: 'in-person' },
      { oldValue: '面授', newValue: 'in-person' },
      { oldValue: '面對面', newValue: 'in-person' },
      { oldValue: '線下', newValue: 'in-person' }
    ]
  },
  {
    value: 'online',
    label: '網課',
    subCategories: [], // 網課沒有子分類 (as per original teachingModeOptions.js)
    sortOrder: 3,
    legacyMappings: [
      { oldValue: 'online', newValue: 'online' },
      { oldValue: '網課', newValue: 'online' },
      { oldValue: '網上', newValue: 'online' },
      { oldValue: '線上', newValue: 'online' }
    ]
  }
];

// 向後兼容的舊格式映射
const LEGACY_MODE_MAPPINGS = {
  // 舊格式到新格式的映射
  'in-person': 'in-person',
  'face-to-face': 'in-person',
  'online': 'online',
  'both': 'both',
  
  // 中文到英文的映射
  '面授': 'in-person',
  '面對面': 'in-person',
  '線下': 'in-person',
  '網課': 'online',
  '網上': 'online',
  '線上': 'online',
  '皆可': 'both'
};

// 子模式映射
const SUB_MODE_MAPPINGS = {
  // 面授子模式 (基於原始 teachingModeOptions.js)
  'one-on-one': 'one-on-one',
  'small-group': 'small-group',
  'large-center': 'large-center',
  
  // 向後兼容前端使用的子模式
  'home': 'one-on-one',
  'center': 'large-center',
  'library': 'one-on-one',
  'coffee-shop': 'one-on-one',
  'student-home': 'one-on-one',
  'zoom': 'online',
  'teams': 'online',
  'skype': 'online',
  'google-meet': 'online',
  'other-platform': 'online'
};

async function initTeachingModes() {
  try {
    console.log('🚀 開始初始化教學模式資料庫...');
    
    // 連接到資料庫
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor';
    if (!mongoUri) {
      throw new Error('MONGODB_URI 環境變數未設置');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ 成功連接到 MongoDB');
    
    // 清空現有資料
    await TeachingMode.deleteMany({});
    console.log('🗑️ 已清空現有教學模式資料');
    
    // 插入新資料
    const result = await TeachingMode.insertMany(TEACHING_MODE_DATA);
    console.log(`✅ 成功插入 ${result.length} 個教學模式`);
    
    // 顯示插入的資料
    console.log('\n📋 插入的教學模式資料:');
    result.forEach(mode => {
      console.log(`  - ${mode.label} (${mode.value})`);
      if (mode.subCategories.length > 0) {
        console.log(`    子模式: ${mode.subCategories.map(sub => sub.label).join(', ')}`);
      }
    });
    
    console.log('\n🎯 初始化完成！');
    console.log('📝 向後兼容映射已設置');
    console.log('🔄 可以使用 /api/teaching-modes 端點獲取資料');
    
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  initTeachingModes()
    .then(() => {
      console.log('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  initTeachingModes,
  TEACHING_MODE_DATA,
  LEGACY_MODE_MAPPINGS,
  SUB_MODE_MAPPINGS
};
