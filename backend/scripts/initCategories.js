const mongoose = require('mongoose');
const Category = require('../models/Category');
const categoryOptions = require('../constants/categoryOptions');

// 數據庫連接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor';

async function initCategories() {
  try {
    console.log('🔌 連接到數據庫...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 清空現有配置
    console.log('🗑️ 清空現有科目配置...');
    await Category.deleteMany({});
    console.log('✅ 現有配置已清空');

    // 將文件中的配置轉換為數據庫文檔
    const categoryDocuments = Object.entries(categoryOptions).map(([key, category]) => ({
      key,
      label: category.label,
      subjects: category.subjects || [],
      subCategories: category.subCategories || []
    }));

    console.log('📝 準備保存科目配置...');
    console.log('📊 分類數量:', categoryDocuments.length);
    
    // 保存到數據庫
    const savedCategories = await Category.insertMany(categoryDocuments);
    console.log('✅ 成功保存科目配置到數據庫');
    console.log('📊 已保存分類:', savedCategories.map(c => c.key));

    console.log('🎉 科目配置初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  initCategories();
}

module.exports = initCategories;
