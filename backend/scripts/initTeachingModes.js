const mongoose = require('mongoose');
const TeachingMode = require('../models/TeachingMode');
require('dotenv').config();

// 統一的教學模式資料
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
    value: 'face-to-face',
    label: '面授',
    subCategories: [
      { value: 'home', label: '上門' },
      { value: 'center', label: '補習中心' },
      { value: 'library', label: '圖書館' },
      { value: 'coffee-shop', label: '咖啡廳' },
      { value: 'student-home', label: '學生家' }
    ],
    sortOrder: 2,
    legacyMappings: [
      { oldValue: 'in-person', newValue: 'face-to-face' },
      { oldValue: '面授', newValue: 'face-to-face' },
      { oldValue: '面對面', newValue: 'face-to-face' },
      { oldValue: '線下', newValue: 'face-to-face' }
    ]
  },
  {
    value: 'online',
    label: '網課',
    subCategories: [
      { value: 'zoom', label: 'Zoom' },
      { value: 'teams', label: 'Microsoft Teams' },
      { value: 'skype', label: 'Skype' },
      { value: 'google-meet', label: 'Google Meet' },
      { value: 'other-platform', label: '其他平台' }
    ],
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
  'in-person': 'face-to-face',
  'face-to-face': 'face-to-face',
  'online': 'online',
  'both': 'both',
  
  // 中文到英文的映射
  '面授': 'face-to-face',
  '面對面': 'face-to-face',
  '線下': 'face-to-face',
  '網課': 'online',
  '網上': 'online',
  '線上': 'online',
  '皆可': 'both'
};

// 子模式映射
const SUB_MODE_MAPPINGS = {
  // 面授子模式
  'one-on-one': 'home',
  'small-group': 'center',
  'large-center': 'center',
  'home': 'home',
  'center': 'center',
  'library': 'library',
  'coffee-shop': 'coffee-shop',
  'student-home': 'student-home',
  
  // 網課子模式
  'zoom': 'zoom',
  'teams': 'teams',
  'skype': 'skype',
  'google-meet': 'google-meet',
  'other-platform': 'other-platform'
};

async function initTeachingModes() {
  try {
    console.log('🚀 開始初始化教學模式資料庫...');
    
    // 連接到資料庫
    const mongoUri = process.env.MONGODB_URI;
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
