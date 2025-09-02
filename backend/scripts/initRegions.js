const mongoose = require('mongoose');
const Region = require('../models/Region');
const regionOptions = require('../constants/regionOptions');

// 連接數據庫
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 初始化地區數據
const initRegions = async () => {
  try {
    console.log('🚀 開始初始化地區數據...');
    
    // 清空現有數據
    await Region.deleteMany({});
    console.log('🗑️ 清空現有地區數據');
    
    // 插入新數據
    const regionDocuments = regionOptions.map((region, index) => ({
      value: region.value,
      label: region.label,
      regions: region.regions || [],
      sortOrder: index,
      isActive: true
    }));
    
    const savedRegions = await Region.insertMany(regionDocuments);
    console.log(`✅ 成功初始化 ${savedRegions.length} 個地區到數據庫`);
    
    // 顯示詳細信息
    savedRegions.forEach(region => {
      console.log(`  - ${region.label} (${region.value}): ${region.regions.length} 個子地區`);
    });
    
  } catch (error) {
    console.error('❌ 初始化地區數據時發生錯誤:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 數據庫連接已關閉');
  }
};

// 執行初始化
const run = async () => {
  await connectDB();
  await initRegions();
};

// 如果直接運行此腳本
if (require.main === module) {
  run();
}

module.exports = { initRegions };