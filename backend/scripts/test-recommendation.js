const mongoose = require('mongoose');
const StudentCase = require('../models/StudentCase');
require('dotenv').config();

// 連接到 MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 已連接到 MongoDB');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

// 創建測試數據
const createTestData = async () => {
  try {
    console.log('🧹 清除現有測試數據...');
    await StudentCase.deleteMany({ title: { $regex: /測試案例/ } });

    console.log('📝 創建測試案例...');
    const testCases = [
      // VIP + 高評分案例
      {
        id: 'test-vip-high-1',
        title: '測試案例 - VIP高評分數學',
        category: '中學',
        subjects: ['數學'],
        regions: ['香港島'],
        modes: ['線上'],
        budget: '500-600',
        requirements: 'VIP 高評分數學補習',
        featured: true,
        isVip: true,
        vipLevel: 2,
        ratingScore: 4.8,
        ratingCount: 25,
        isPaid: true,
        paymentType: 'vip',
        createdAt: new Date('2024-03-20')
      },
      {
        id: 'test-vip-high-2',
        title: '測試案例 - VIP高評分英文',
        category: '中學',
        subjects: ['英文'],
        regions: ['九龍'],
        modes: ['面對面'],
        budget: '600-700',
        requirements: 'VIP 高評分英文補習',
        featured: true,
        isVip: true,
        vipLevel: 1,
        ratingScore: 4.5,
        ratingCount: 18,
        isPaid: true,
        paymentType: 'vip',
        createdAt: new Date('2024-03-19')
      },
      // VIP 普通案例
      {
        id: 'test-vip-normal-1',
        title: '測試案例 - VIP普通物理',
        category: '中學',
        subjects: ['物理'],
        regions: ['新界'],
        modes: ['線上'],
        budget: '400-500',
        requirements: 'VIP 普通物理補習',
        featured: true,
        isVip: true,
        vipLevel: 1,
        ratingScore: 3.5,
        ratingCount: 8,
        isPaid: true,
        paymentType: 'vip',
        createdAt: new Date('2024-03-18')
      },
      {
        id: 'test-vip-normal-2',
        title: '測試案例 - VIP普通化學',
        category: '中學',
        subjects: ['化學'],
        regions: ['香港島'],
        modes: ['面對面'],
        budget: '450-550',
        requirements: 'VIP 普通化學補習',
        featured: true,
        isVip: true,
        vipLevel: 2,
        ratingScore: 2.8,
        ratingCount: 5,
        isPaid: true,
        paymentType: 'vip',
        createdAt: new Date('2024-03-17')
      },
      // 置頂 + 高評分案例
      {
        id: 'test-top-high-1',
        title: '測試案例 - 置頂高評分生物',
        category: '中學',
        subjects: ['生物'],
        regions: ['九龍'],
        modes: ['線上'],
        budget: '350-450',
        requirements: '置頂高評分生物補習',
        featured: true,
        isTop: true,
        topLevel: 1,
        ratingScore: 4.2,
        ratingCount: 12,
        isPaid: true,
        paymentType: 'premium',
        createdAt: new Date('2024-03-16')
      },
      // 置頂普通案例
      {
        id: 'test-top-normal-1',
        title: '測試案例 - 置頂普通歷史',
        category: '中學',
        subjects: ['歷史'],
        regions: ['新界'],
        modes: ['面對面'],
        budget: '300-400',
        requirements: '置頂普通歷史補習',
        featured: true,
        isTop: true,
        topLevel: 1,
        ratingScore: 3.2,
        ratingCount: 6,
        isPaid: true,
        paymentType: 'basic',
        createdAt: new Date('2024-03-15')
      },
      // 普通高評分案例
      {
        id: 'test-normal-high-1',
        title: '測試案例 - 普通高評分地理',
        category: '中學',
        subjects: ['地理'],
        regions: ['香港島'],
        modes: ['線上'],
        budget: '250-350',
        requirements: '普通高評分地理補習',
        featured: true,
        ratingScore: 4.3,
        ratingCount: 15,
        isPaid: false,
        paymentType: 'free',
        createdAt: new Date('2024-03-14')
      },
      // 普通 fallback 案例
      {
        id: 'test-fallback-1',
        title: '測試案例 - 普通中文',
        category: '中學',
        subjects: ['中文'],
        regions: ['九龍'],
        modes: ['面對面'],
        budget: '200-300',
        requirements: '普通中文補習',
        featured: true,
        ratingScore: 3.0,
        ratingCount: 3,
        isPaid: false,
        paymentType: 'free',
        createdAt: new Date('2024-03-13')
      },
      {
        id: 'test-fallback-2',
        title: '測試案例 - 普通音樂',
        category: '興趣',
        subjects: ['音樂'],
        regions: ['新界'],
        modes: ['線上'],
        budget: '150-250',
        requirements: '普通音樂補習',
        featured: true,
        ratingScore: 2.5,
        ratingCount: 2,
        isPaid: false,
        paymentType: 'free',
        createdAt: new Date('2024-03-12')
      }
    ];

    await StudentCase.insertMany(testCases);
    console.log(`✅ 成功創建 ${testCases.length} 個測試案例`);

  } catch (error) {
    console.error('❌ 創建測試數據失敗:', error);
  }
};

// 測試推薦演算法
const testRecommendationAlgorithm = async () => {
  try {
    console.log('\n🎯 測試推薦演算法...');
    
    // 模擬推薦演算法邏輯
    const usedIds = new Set();
    const results = [];
    const maxResults = 8;
    
    const limits = {
      vipHighRating: 2,
      vipNormal: 2,
      topHighRating: 1,
      topNormal: 1,
      normalHighRating: 1,
      fallback: 1
    };
    
    // 1. VIP + 高評分
    const vipHighRating = await StudentCase.find({
      featured: true,
      isVip: true,
      ratingScore: { $gte: 4 },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ vipLevel: -1, ratingScore: -1, createdAt: -1 }).limit(limits.vipHighRating);
    
    vipHighRating.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'vip_high_rating';
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 2. VIP 普通
    const vipNormal = await StudentCase.find({
      featured: true,
      isVip: true,
      _id: { $nin: Array.from(usedIds) }
    }).sort({ vipLevel: -1, ratingScore: -1, createdAt: -1 }).limit(limits.vipNormal);
    
    vipNormal.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'vip_normal';
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 3. 置頂 + 高評分
    const topHighRating = await StudentCase.find({
      featured: true,
      isTop: true,
      isVip: { $ne: true },
      ratingScore: { $gte: 4 },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ topLevel: -1, ratingScore: -1, createdAt: -1 }).limit(limits.topHighRating);
    
    topHighRating.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'top_high_rating';
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 4. 置頂普通
    const topNormal = await StudentCase.find({
      featured: true,
      isTop: true,
      isVip: { $ne: true },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ topLevel: -1, ratingScore: -1, createdAt: -1 }).limit(limits.topNormal);
    
    topNormal.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'top_normal';
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 5. 普通高評分
    const normalHighRating = await StudentCase.find({
      featured: true,
      isVip: { $ne: true },
      isTop: { $ne: true },
      ratingScore: { $gte: 4 },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ ratingScore: -1, createdAt: -1 }).limit(limits.normalHighRating);
    
    normalHighRating.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'normal_high_rating';
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    // 6. Fallback
    const fallback = await StudentCase.find({
      featured: true,
      isVip: { $ne: true },
      isTop: { $ne: true },
      _id: { $nin: Array.from(usedIds) }
    }).sort({ ratingScore: -1, createdAt: -1 }).limit(Math.max(limits.fallback, maxResults - results.length));
    
    fallback.forEach(case_ => {
      if (results.length < maxResults) {
        case_._recommendationType = 'fallback';
        results.push(case_);
        usedIds.add(case_._id.toString());
      }
    });
    
    console.log('\n📊 推薦結果分析:');
    console.log(`總共推薦: ${results.length} 個案例`);
    
    const breakdown = {
      vipHighRating: results.filter(c => c._recommendationType === 'vip_high_rating').length,
      vipNormal: results.filter(c => c._recommendationType === 'vip_normal').length,
      topHighRating: results.filter(c => c._recommendationType === 'top_high_rating').length,
      topNormal: results.filter(c => c._recommendationType === 'top_normal').length,
      normalHighRating: results.filter(c => c._recommendationType === 'normal_high_rating').length,
      fallback: results.filter(c => c._recommendationType === 'fallback').length
    };
    
    console.log('分類統計:', breakdown);
    
    console.log('\n📋 推薦案例詳情:');
    results.forEach((case_, index) => {
      console.log(`${index + 1}. ${case_.title}`);
      console.log(`   類型: ${case_._recommendationType}`);
      console.log(`   VIP: ${case_.isVip ? `是 (Level ${case_.vipLevel})` : '否'}`);
      console.log(`   置頂: ${case_.isTop ? `是 (Level ${case_.topLevel})` : '否'}`);
      console.log(`   評分: ${case_.ratingScore}/5 (${case_.ratingCount} 評價)`);
      console.log(`   付費: ${case_.isPaid ? case_.paymentType : '免費'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 測試推薦演算法失敗:', error);
  }
};

// 執行測試
const runTest = async () => {
  await connectDB();
  await createTestData();
  await testRecommendationAlgorithm();
  await mongoose.connection.close();
  console.log('🔌 MongoDB 連接已關閉');
};

runTest(); 