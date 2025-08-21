const mongoose = require('mongoose');
const Region = require('../models/Region');
require('dotenv').config();

// 地區數據
const regionsData = [
  {
    value: 'unlimited',
    label: '不限',
    regions: [],
    sortOrder: 0
  },
  {
    value: 'all-hong-kong',
    label: '全香港',
    regions: [],
    sortOrder: 1
  },
  {
    value: 'hong-kong-island',
    label: '香港島',
    sortOrder: 2,
    regions: [
      { value: 'central', label: '中環' },
      { value: 'sheung-wan', label: '上環' },
      { value: 'sai-wan', label: '西環' },
      { value: 'sai-ying-pun', label: '西營盤' },
      { value: 'shek-tong-tsui', label: '石塘咀' },
      { value: 'wan-chai', label: '灣仔' },
      { value: 'causeway-bay', label: '銅鑼灣' },
      { value: 'admiralty', label: '金鐘' },
      { value: 'happy-valley', label: '跑馬地' },
      { value: 'tin-hau', label: '天后' },
      { value: 'tai-hang', label: '大坑' },
      { value: 'north-point', label: '北角' },
      { value: 'quarry-bay', label: '鰂魚涌' },
      { value: 'taikoo', label: '太古' },
      { value: 'sai-wan-ho', label: '西灣河' },
      { value: 'shau-kei-wan', label: '筲箕灣' },
      { value: 'chai-wan', label: '柴灣' },
      { value: 'heng-fa-chuen', label: '杏花邨' }
    ]
  },
  {
    value: 'kowloon',
    label: '九龍',
    sortOrder: 3,
    regions: [
      { value: 'tsim-sha-tsui', label: '尖沙咀' },
      { value: 'jordan', label: '佐敦' },
      { value: 'yau-ma-tei', label: '油麻地' },
      { value: 'mong-kok', label: '旺角' },
      { value: 'prince-edward', label: '太子' },
      { value: 'sham-shui-po', label: '深水埗' },
      { value: 'cheung-sha-wan', label: '長沙灣' },
      { value: 'hung-hom', label: '紅磡' },
      { value: 'to-kwa-wan', label: '土瓜灣' },
      { value: 'ho-man-tin', label: '何文田' },
      { value: 'kowloon-tong', label: '九龍塘' },
      { value: 'san-po-kong', label: '新蒲崗' },
      { value: 'diamond-hill', label: '鑽石山' },
      { value: 'lok-fu', label: '樂富' },
      { value: 'tsz-wan-shan', label: '慈雲山' },
      { value: 'ngau-tau-kok', label: '牛頭角' },
      { value: 'lam-tin', label: '藍田' },
      { value: 'kwun-tong', label: '觀塘' },
      { value: 'yau-tong', label: '油塘' }
    ]
  },
  {
    value: 'new-territories',
    label: '新界',
    sortOrder: 4,
    regions: [
      { value: 'sha-tin', label: '沙田' },
      { value: 'ma-on-shan', label: '馬鞍山' },
      { value: 'tai-wai', label: '大圍' },
      { value: 'fo-tan', label: '火炭' },
      { value: 'tai-po', label: '大埔' },
      { value: 'tai-wo', label: '太和' },
      { value: 'fan-ling', label: '粉嶺' },
      { value: 'sheung-shui', label: '上水' },
      { value: 'tseung-kwan-o', label: '將軍澳' },
      { value: 'hang-hau', label: '坑口' },
      { value: 'po-lam', label: '寶琳' },
      { value: 'lohas-park', label: '康城' },
      { value: 'tuen-mun', label: '屯門' },
      { value: 'siu-hong', label: '兆康' },
      { value: 'yuen-long', label: '元朗' },
      { value: 'long-ping', label: '朗屏' },
      { value: 'tin-shui-wai', label: '天水圍' },
      { value: 'tsuen-wan', label: '荃灣' },
      { value: 'kwai-fong', label: '葵芳' },
      { value: 'kwai-chung', label: '葵涌' },
      { value: 'tsing-yi', label: '青衣' }
    ]
  },
  {
    value: 'islands',
    label: '離島',
    sortOrder: 5,
    regions: [
      { value: 'tung-chung', label: '東涌' },
      { value: 'mui-wo', label: '梅窩' },
      { value: 'tai-o', label: '大澳' },
      { value: 'ping-chau', label: '坪洲' },
      { value: 'cheung-chau', label: '長洲' },
      { value: 'lamma-island', label: '南丫島' },
      { value: 'discovery-bay', label: '愉景灣' },
      { value: 'pui-o', label: '貝澳' }
    ]
  }
];

async function initRegions() {
  try {
    // 連接到數據庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ 連接到數據庫成功');

    // 清空現有地區數據
    await Region.deleteMany({});
    console.log('🗑️ 清空現有地區數據');

    // 插入新地區數據
    const regions = await Region.insertMany(regionsData);
    console.log(`✅ 成功插入 ${regions.length} 個地區`);

    // 顯示插入的數據
    console.log('\n📋 插入的地區數據:');
    regions.forEach(region => {
      console.log(`\n${region.label} (${region.value})`);
      if (region.regions.length > 0) {
        region.regions.forEach(subRegion => {
          console.log(`  - ${subRegion.label} (${subRegion.value})`);
        });
      }
    });

    console.log('\n🎉 地區數據庫初始化完成！');
  } catch (error) {
    console.error('❌ 初始化地區數據庫失敗:', error);
  } finally {
    // 關閉數據庫連接
    await mongoose.connection.close();
    console.log('🔌 數據庫連接已關閉');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  initRegions();
}

module.exports = { initRegions, regionsData };
