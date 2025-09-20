const tutors = require('../data/tutors');
const User = require('../models/User');
const UploadLog = require('../models/UploadLog');
const mongoose = require('mongoose');
const TutorCase = require('../models/TutorCase');
const { getTeachingModeLabel } = require('../constants/teachingModeOptions');
const CATEGORY_OPTIONS = require('../constants/categoryOptions');
const Category = require('../models/Category');

// 動態獲取分類資料
const getDynamicCategories = async () => {
  try {
    const categories = await Category.find({});
    if (categories.length > 0) {
      return categories.map(category => ({
        value: category.key,
        label: category.label,
        subjects: category.subjects || [],
        subCategories: category.subCategories || []
      }));
    } else {
      // 如果資料庫沒有資料，使用硬編碼備用
      return Object.entries(CATEGORY_OPTIONS).map(([value, category]) => ({
        value,
        label: category.label,
        subjects: category.subjects || [],
        subCategories: category.subCategories || []
      }));
    }
  } catch (error) {
    console.error('❌ 載入動態分類資料失敗:', error);
    // 如果資料庫錯誤，使用硬編碼備用
    return Object.entries(CATEGORY_OPTIONS).map(([value, category]) => ({
      value,
      label: category.label,
      subjects: category.subjects || [],
      subCategories: category.subCategories || []
    }));
  }
};

// 根據分類獲取對應的科目列表
const getCategorySubjects = (category) => {
  const categoryMap = {
    'early-childhood': [
      'early-childhood-chinese',
      'early-childhood-english', 
      'early-childhood-math',
      'early-childhood-phonics',
      'early-childhood-logic',
      'early-childhood-interview',
      'early-childhood-homework'
    ],
    'primary-secondary': [
      'primary-chinese',
      'primary-english',
      'primary-math',
      'primary-general',
      'primary-mandarin',
      'primary-stem',
      'primary-all',
      'secondary-chinese',
      'secondary-english',
      'secondary-math',
      'secondary-ls',
      'secondary-physics',
      'secondary-chemistry',
      'secondary-biology',
      'secondary-economics',
      'secondary-geography',
      'secondary-history',
      'secondary-chinese-history',
      'secondary-bafs',
      'secondary-ict',
      'secondary-integrated-science',
      'secondary-dse',
      'secondary-all'
    ],
    'interest': [
      'art',
      'music',
      'dance',
      'drama',
      'programming',
      'foreign-language',
      'magic-chess',
      'photography'
    ],
    'tertiary': [
      'uni-liberal',
      'uni-math',
      'uni-economics',
      'uni-it',
      'uni-business',
      'uni-engineering',
      'uni-thesis'
    ],
    'adult': [
      'business-english',
      'conversation',
      'chinese-language',
      'second-language',
      'computer-skills',
      'exam-prep'
    ]
  };
  
  return categoryMap[category] || [];
};

// 測試端點 - 檢查 MongoDB 連接和 User 模型
const testTutors = async (req, res) => {
  try {
    console.log('🧪 測試導師 API');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
        mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'N/A'
      },
      mongoose: {
        connectionState: mongoose.connection.readyState,
        connectionStates: {
          0: 'disconnected',
          1: 'connected', 
          2: 'connecting',
          3: 'disconnecting'
        },
        currentState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
      }
    };

    // 嘗試簡單的數據庫操作
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await User.countDocuments({ userType: 'tutor' });
        diagnostics.database = {
          connected: true,
          tutorCount: count
        };
        
        // 嘗試獲取一個導師
        const sampleTutor = await User.findOne({ userType: 'tutor' }).lean();
        if (sampleTutor) {
          diagnostics.sampleTutor = {
            id: sampleTutor._id,
            name: sampleTutor.name,
            userType: sampleTutor.userType,
            hasTutorProfile: !!sampleTutor.tutorProfile
          };
        }
      } catch (dbError) {
        diagnostics.database = {
          connected: false,
          error: dbError.message
        };
      }
    } else {
      diagnostics.database = {
        connected: false,
        reason: 'MongoDB not connected'
      };
    }

    res.json({
      success: true,
      message: 'Tutor API test endpoint working',
      diagnostics
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint failed',
      error: error.message
    });
  }
};

// 回傳所有導師
const getAllTutors = async (req, res) => {
  try {
    const { limit, featured, search, subjects, regions, modes, category } = req.query;
    console.log('📝 查詢參數:', { limit, featured, search, subjects, regions, modes, category });
    
    // 定義 tutors 變數
    let tutors = [];
    let source = 'database';
    
    // 簡化連接狀態檢查 - 直接嘗試查詢數據庫
    console.log('🔍 嘗試直接查詢 MongoDB...');
    
    if (featured === 'true') {
      console.log('🎯 查詢精選導師 (featured=true) - 分批輪播 + 置頂保障機制');
      
              // 分別查詢不同類型的導師
        const vipTutors = await User.find({ 
          userType: 'tutor',
          isActive: true,
          status: 'active',
          isVip: true 
        }).select('name avatar tutorProfile rating isVip isTop createdAt tutorId subjects teachingAreas teachingMethods').lean();
        
        const topTutors = await User.find({ 
          userType: 'tutor',
          isActive: true,
          status: 'active',
          isTop: true,
          isVip: false  // 排除 VIP，避免重複
        }).select('name email avatar tutorProfile rating isVip isTop createdAt tutorId subjects teachingAreas teachingMethods').lean();
        
        const normalTutors = await User.find({ 
          userType: 'tutor',
          isActive: true,
          status: 'active',
          isVip: false,
          isTop: false
        }).select('name email avatar tutorProfile rating isVip isTop createdAt tutorId subjects teachingAreas teachingMethods').lean();
      
      console.log(`📊 找到導師數量:`);
      console.log(`- VIP 導師: ${vipTutors.length} 個`);
      console.log(`- 置頂導師: ${topTutors.length} 個`);
      console.log(`- 普通導師: ${normalTutors.length} 個`);
      
      // 調試：檢查第一個導師的數據結構
      if (vipTutors.length > 0) {
        console.log('🔍 第一個VIP導師的原始數據:', JSON.stringify(vipTutors[0], null, 2));
        console.log('�� 第一個VIP導師的性別:', vipTutors[0].tutorProfile?.gender);
      }
      if (topTutors.length > 0) {
        console.log('🔍 第一個置頂導師的原始數據:', JSON.stringify(topTutors[0], null, 2));
        console.log('🔍 第一個置頂導師的性別:', topTutors[0].tutorProfile?.gender);
      }
      if (normalTutors.length > 0) {
        console.log('🔍 第一個普通導師的原始數據:', JSON.stringify(normalTutors[0], null, 2));
        console.log('🔍 第一個普通導師的性別:', normalTutors[0].tutorProfile?.gender);
      }
      
      // 如果沒有VIP或置頂導師，自動提升一些導師
      if (vipTutors.length === 0 && topTutors.length === 0 && normalTutors.length > 0) {
        console.log('🔄 沒有VIP或置頂導師，自動提升一些導師...');
        
        // 按評分排序，選擇評分最高的導師
        const sortedNormalTutors = normalTutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        // 將前3個提升為VIP
        const promotedVipTutors = sortedNormalTutors.slice(0, Math.min(3, sortedNormalTutors.length));
        promotedVipTutors.forEach(tutor => {
          tutor.isVip = true;
          tutor.isTop = false;
        });
        vipTutors.push(...promotedVipTutors);
        
        // 將接下來5個提升為置頂
        const promotedTopTutors = sortedNormalTutors.slice(3, Math.min(8, sortedNormalTutors.length));
        promotedTopTutors.forEach(tutor => {
          tutor.isTop = true;
          tutor.isVip = false;
        });
        topTutors.push(...promotedTopTutors);
        
        // 更新普通導師列表
        const remainingNormalTutors = sortedNormalTutors.slice(8);
        normalTutors.length = 0;
        normalTutors.push(...remainingNormalTutors);
        
        console.log(`✅ 自動提升了 ${promotedVipTutors.length} 個VIP導師和 ${promotedTopTutors.length} 個置頂導師`);
      }
      
      // 🎯 實現分批輪播 + 置頂保障機制
      // 對於 featured=true，我們不限制數量，讓前端處理分頁
      const selectedTutors = [];
      
      // 1. VIP 導師：選擇所有 VIP 導師（按評分排序）
      if (vipTutors.length > 0) {
        // 按評分排序
        const sortedVip = vipTutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        // 選擇所有 VIP 導師
        selectedTutors.push(...sortedVip);
        
        console.log(`👑 VIP 導師選擇:`);
        console.log(`- 選擇數量: ${sortedVip.length} 個`);
        sortedVip.forEach((tutor, index) => {
          console.log(`  ${index + 1}. ${tutor.name} (評分: ${tutor.rating || 0})`);
        });
      }
      
      // 2. 置頂導師：選擇評分最高的導師（不限制數量）
      if (topTutors.length > 0) {
        // 按評分排序
        const sortedTop = topTutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        // 選擇所有置頂導師
        selectedTutors.push(...sortedTop);
        
        console.log(`⭐ 置頂導師選擇:`);
        console.log(`- 選擇數量: ${sortedTop.length} 個`);
        sortedTop.forEach((tutor, index) => {
          console.log(`  ${index + 1}. ${tutor.name} (評分: ${tutor.rating || 0})`);
        });
      }
      
      // 3. 普通導師：選擇所有普通導師
      if (normalTutors.length > 0) {
        // 按評分排序
        const sortedNormal = normalTutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        // 選擇所有普通導師
        selectedTutors.push(...sortedNormal);
        
        console.log(`📚 普通導師選擇:`);
        console.log(`- 選擇數量: ${sortedNormal.length} 個`);
        sortedNormal.forEach((tutor, index) => {
          console.log(`  ${index + 1}. ${tutor.name} (評分: ${tutor.rating || 0})`);
        });
      }
      
      // 移除補充邏輯，因為我們現在選擇所有導師
      console.log(`📊 總計選擇了 ${selectedTutors.length} 個導師`);
      
      // 按優先級排序：VIP > 置頂 > 普通，然後按評分排序
      const finalSorted = selectedTutors.sort((a, b) => {
        // 首先按 VIP 狀態排序
        if (a.isVip && !b.isVip) return -1;
        if (!a.isVip && b.isVip) return 1;
        
        // 然後按置頂狀態排序
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        
        // 最後按評分排序
        return (b.rating || 0) - (a.rating || 0);
      });
      
      console.log(`🎉 最終選擇了 ${finalSorted.length} 個導師，按優先級排序`);
      console.log(`📋 最終導師列表:`);
      finalSorted.forEach((tutor, index) => {
        const type = tutor.isVip ? '👑 VIP' : tutor.isTop ? '⭐ 置頂' : '📚 普通';
        console.log(`  ${index + 1}. ${tutor.name} (${type}, 評分: ${tutor.rating || 0})`);
      });
      
      // 格式化結果
      tutors = finalSorted.map(tutor => ({
        _id: tutor._id,
        userId: tutor._id,
        tutorId: tutor.tutorId,
        name: tutor.name,
        subjects: tutor.tutorProfile?.subjects || [],
        education: tutor.tutorProfile?.educationLevel || '',
        experience: tutor.tutorProfile?.teachingExperienceYears || 0, // 改為數字格式，與詳情頁面一致
        rating: tutor.rating || 0,
        avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || '',
        isVip: tutor.isVip || false,
        isTop: tutor.isTop || false,
        createdAt: tutor.createdAt,
        date: tutor.createdAt,
        teachingModes: tutor.tutorProfile?.teachingMethods || [],
        regions: tutor.tutorProfile?.teachingAreas || [],
        birthDate: tutor.tutorProfile?.birthDate, // 添加出生日期
        tutorProfile: {
          gender: tutor.tutorProfile?.gender || 'male',
          birthDate: tutor.tutorProfile?.birthDate // 添加出生日期到 tutorProfile
        }
      }));
      
    } else {
      // 非精選導師查詢
      console.log('📊 執行普通導師查詢...');
      
      // 構建查詢條件
      let query = { 
        userType: 'tutor',
        isActive: true,
        status: 'active'
      };
      
      // 搜尋過濾
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'tutorProfile.subjects': { $regex: search, $options: 'i' } },
          { 'tutorProfile.educationLevel': { $regex: search, $options: 'i' } }
        ];
      }
      
      // 科目過濾 - 優先處理具體科目
      if (subjects) {
        const subjectArray = Array.isArray(subjects) ? subjects : subjects.split(',');
        console.log(`🎯 科目過濾: ${subjectArray.join(', ')}`);
        
        // 直接使用用戶選擇的科目進行過濾
        query['tutorProfile.subjects'] = { $in: subjectArray };
        console.log(`🔍 使用科目過濾: ${subjectArray.join(', ')}`);
      } else if (category && category !== 'unlimited') {
        // 如果沒有具體科目，才使用分類過濾
        console.log(`🎯 分類過濾: ${category}`);
        const categorySubjects = getCategorySubjects(category);
        if (categorySubjects && categorySubjects.length > 0) {
          query['tutorProfile.subjects'] = { $in: categorySubjects };
          console.log(`🔍 使用分類科目過濾: ${categorySubjects.join(', ')}`);
        } else {
          console.log(`⚠️ 未找到分類 ${category} 對應的科目`);
        }
      } else if (category === 'unlimited') {
        console.log('🎯 分類設為 unlimited，跳過分類過濾');
      } else {
        console.log('🎯 沒有指定分類，查詢所有導師');
      }
      
      console.log('🔍 查詢條件:', JSON.stringify(query, null, 2));
      
             // 執行查詢
       const limitNum = parseInt(limit) || 10000;
       const dbTutors = await User.find(query)
         .select('name email avatar tutorProfile rating isVip isTop createdAt tutorId subjects teachingAreas teachingMethods')
         .lean() // 添加 lean() 以獲取純 JavaScript 對象
         .limit(limitNum);
      
      // 按優先級排序：VIP > 置頂 > 評分 > 註冊時間
      const sortedTutors = dbTutors.sort((a, b) => {
        if (a.isVip && !b.isVip) return -1;
        if (!a.isVip && b.isVip) return 1;
        
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      console.log(`✅ 從資料庫找到 ${sortedTutors.length} 位導師`);
      
      // 調試：檢查第一個導師的完整數據
      if (sortedTutors.length > 0) {
        console.log('🔍 第一個導師的完整數據:', JSON.stringify(sortedTutors[0], null, 2));
        console.log('🔍 第一個導師的 tutorProfile:', sortedTutors[0].tutorProfile);
        console.log('🔍 第一個導師的 birthDate:', sortedTutors[0].tutorProfile?.birthDate);
      }
      
      // 格式化資料庫結果
      tutors = sortedTutors.map(tutor => ({
        _id: tutor._id,
        userId: tutor._id,
        tutorId: tutor.tutorId,
        name: tutor.name,
        subjects: tutor.tutorProfile?.subjects || [],
        education: tutor.tutorProfile?.educationLevel || '',
        experience: tutor.tutorProfile?.teachingExperienceYears || 0, // 改為數字格式，與詳情頁面一致
        rating: tutor.rating || 0,
        avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || '',
        isVip: tutor.isVip || false,
        isTop: tutor.isTop || false,
        createdAt: tutor.createdAt,
        date: tutor.createdAt,
        teachingModes: tutor.tutorProfile?.teachingMethods || [],
        regions: tutor.tutorProfile?.teachingAreas || [],
        birthDate: tutor.tutorProfile?.birthDate, // 添加出生日期
        tutorProfile: {
          gender: tutor.tutorProfile?.gender || 'male',
          birthDate: tutor.tutorProfile?.birthDate // 添加出生日期到 tutorProfile
        }
      }));
    }
    
    // 格式化最終結果
    const formattedTutors = tutors.map(tutor => {
      // 處理 subjects 陣列
      let subjects = [];
      if (tutor.subjects && Array.isArray(tutor.subjects)) {
        subjects = tutor.subjects;
      } else if (tutor.subject) {
        subjects = [tutor.subject];
      } else {
        subjects = ['數學', '英文', '中文'];
      }

      // 處理頭像 URL
      let avatarUrl = '';
      if (tutor.avatar) {
        avatarUrl = tutor.avatar;
      } else {
        avatarUrl = `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`;
      }

      // 確保頭像 URL 是完整的
      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
        avatarUrl = `https://hi-hi-tutor-real-backend2.vercel.app${avatarUrl}`;
      }

      // 處理性別信息
      const gender = tutor.tutorProfile?.gender;
      console.log(`👤 導師 ${tutor.name} 的性別: ${gender}`);

      return {
        id: tutor._id,
        userId: tutor.userId,
        tutorId: tutor.tutorId,
        name: tutor.name,
        subjects: subjects,
        education: tutor.education,
        experience: tutor.experience,
        rating: tutor.rating,
        avatarUrl: avatarUrl,
        isVip: tutor.isVip,
        isTop: tutor.isTop,
        createdAt: tutor.createdAt,
        date: tutor.createdAt,
        teachingModes: tutor.teachingModes,
        regions: tutor.regions,
        tutorProfile: {
          gender: gender || 'male',
          birthDate: tutor.birthDate
        }
      };
    });

    console.log(`📤 返回 ${formattedTutors.length} 個導師數據`);
    console.log('🔍 格式化後的性別信息:', formattedTutors.map(t => ({ name: t.name, gender: t.tutorProfile?.gender })));
    
    res.json({ 
      success: true,
      data: { tutors: formattedTutors },
      source: source,
      mongoState: 1,
      mongoStateDescription: 'connected'
    });
  } catch (error) {
    console.error('❌ 獲取導師數據時出錯:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      message: 'Error fetching tutors',
      error: error.message
    });
  }
};

// 根據 tutorId 回傳導師公開 profile
const getTutorByTutorId = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    console.log('🔍 根據 tutorId 查找導師:', tutorId);
    
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未連接，當前狀態:', mongoose.connection.readyState);
      return res.status(503).json({ 
        success: false,
        message: 'Database not ready', 
        error: 'MongoDB connection is not established',
        mongoState: mongoose.connection.readyState,
        mongoStateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
        suggestion: 'Please try again later or contact support'
      });
    }
    
    const user = await User.findOne({ 
      tutorId,
      userType: 'tutor',
      isActive: true
    }).select('-password -refreshToken');
    
    if (!user) {
      console.log('❌ 找不到導師:', tutorId);
      return res.status(404).json({ 
        success: false, 
        message: '找不到導師' 
      });
    }
    
    console.log('✅ 找到導師:', user.name);
    
    // 回傳導師公開資料（已移除個人識別資訊）
    const publicProfile = {
      id: user._id,
      userId: user.userId,
      tutorId: user.tutorId,
      name: 'HiHiTutor 導師', // 移除真實姓名
      avatar: user.avatar || user.tutorProfile?.avatarUrl || 'https://hi-hi-tutor-real-backend2.vercel.app/avatars/default.png', // 使用真實頭像或完整預設 URL
      avatarOffsetX: user.tutorProfile?.avatarOffsetX || 50,
      subjects: user.tutorProfile?.subjects || [],
      teachingAreas: user.tutorProfile?.teachingAreas || [],
      teachingMethods: user.tutorProfile?.teachingMethods || [],
      experience: user.tutorProfile?.teachingExperienceYears || 0,
      introduction: user.tutorProfile?.introduction || '',
      education: user.tutorProfile?.educationLevel || '',
      qualifications: user.tutorProfile?.qualifications || [],
      hourlyRate: user.tutorProfile?.sessionRate || 0,
      availableTime: user.tutorProfile?.availableTime?.map(time => `${time.day} ${time.time}`.trim()) || [],
      examResults: user.tutorProfile?.examResults?.map(exam => `${exam.subject} ${exam.grade}`) || [],
      courseFeatures: user.tutorProfile?.courseFeatures || '',
      publicCertificates: user.tutorProfile?.publicCertificates || [],
      rating: user.rating || 0,
      // 添加性別信息和出生日期
      tutorProfile: {
        gender: user.tutorProfile?.gender || 'male',
        birthDate: user.tutorProfile?.birthDate
      }
    };
    
    res.json({
      success: true,
      data: publicProfile,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ 獲取導師 profile 錯誤:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤',
      error: error.message
    });
  }
};

// 獲取導師列表
const getTutors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      subjects = [],
      areas = [],
      methods = [],
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    console.log('🔍 獲取導師列表，查詢參數:', { page, limit, search, subjects, areas, methods, sortBy, sortOrder });

    // 檢查 MongoDB 連接狀態，如果未連接則嘗試重連
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未連接，當前狀態:', mongoose.connection.readyState);
      
      // 如果正在連接中，等待連接完成
      if (mongoose.connection.readyState === 2) {
        console.log('⏳ MongoDB 正在連接中，等待連接完成...');
        
        // 等待連接完成，最多等待 30 秒
        let waitTime = 0;
        const maxWaitTime = 30000; // 30 秒
        const checkInterval = 1000; // 每秒檢查一次
        
        while (mongoose.connection.readyState !== 1 && waitTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          waitTime += checkInterval;
          console.log(`⏳ 等待連接完成... (${waitTime}/${maxWaitTime}ms)`);
        }
        
        if (mongoose.connection.readyState !== 1) {
          console.log('❌ 等待連接超時');
          return res.status(503).json({ 
            success: false,
            message: 'Database connection timeout', 
            error: 'MongoDB connection timeout',
            mongoState: mongoose.connection.readyState
          });
        }
        
        console.log('✅ MongoDB 連接完成');
      } else {
        // 嘗試重新連接
        try {
          const { connectDB } = require('../config/db');
          console.log('🔄 嘗試重新連接 MongoDB...');
          await connectDB();
          
          // 再次檢查連接狀態
          if (mongoose.connection.readyState !== 1) {
            console.log('❌ 重連失敗，當前狀態:', mongoose.connection.readyState);
            return res.status(503).json({ 
              success: false,
              message: 'Database not ready', 
              error: 'MongoDB connection is not established',
              mongoState: mongoose.connection.readyState
            });
          }
          console.log('✅ MongoDB 重連成功');
        } catch (reconnectError) {
          console.error('❌ MongoDB 重連失敗:', reconnectError);
          return res.status(503).json({ 
            success: false,
            message: 'Database not ready', 
            error: 'MongoDB reconnection failed',
            mongoState: mongoose.connection.readyState
          });
        }
      }
    }

    // 構建查詢條件
    const query = {
      userType: 'tutor',
      isActive: true
    };

    // 搜尋條件
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { introduction: { $regex: search, $options: 'i' } }
      ];
    }

    // 科目篩選
    if (subjects.length > 0) {
      query['subjects'] = { $in: subjects };
    }

    // 地區過濾
    if (areas.length > 0) {
      query['teachingAreas'] = { $in: areas };
    }

    // 授課方式篩選
    if (methods.length > 0) {
      query['teachingMethods'] = { $in: methods };
    }

    // 構建排序條件
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 查詢條件:', query);
    console.log('📊 排序條件:', sort);

    // 執行查詢
    const tutorResults = await User.find(query)
      .select('userId tutorId name avatar subjects teachingAreas teachingMethods experience rating introduction tutorProfile')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // 獲取總數
    const total = await User.countDocuments(query);

    console.log(`✅ 找到 ${tutorResults.length} 個導師，總共 ${total} 個`);

    res.json({
      success: true,
      data: {
        tutors: tutorResults,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('❌ 獲取導師列表錯誤:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      message: '獲取導師列表失敗',
      error: error.message
    });
  }
};

// 獲取導師詳情
const getTutorDetail = async (req, res) => {
  try {
    const { tutorId } = req.params;

    console.log('🔍 獲取導師詳情:', tutorId);

    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未連接，當前狀態:', mongoose.connection.readyState);
      return res.status(503).json({ 
        success: false,
        message: 'Database not ready', 
        error: 'MongoDB connection is not established',
        mongoState: mongoose.connection.readyState
      });
    }

    const tutor = await User.findOne({
      tutorId,
      userType: 'tutor',
      isActive: true
    }).select('-password -refreshToken');

    if (!tutor) {
      console.log('❌ 找不到導師:', tutorId);
      return res.status(404).json({ 
        success: false,
        message: '找不到該導師' 
      });
    }

    console.log('✅ 找到導師:', tutor.name);
    console.log('🔍 導師tutorProfile:', tutor.tutorProfile);
    console.log('🔍 導師tutorProfile.birthDate:', tutor.tutorProfile?.birthDate);
    console.log('🔍 導師tutorProfile.birthDate 類型:', typeof tutor.tutorProfile?.birthDate);
    console.log('🔍 導師tutorProfile.birthDate 是否為 Date:', tutor.tutorProfile?.birthDate instanceof Date);

    // 回傳導師公開資料（已移除個人識別資訊）
    const publicData = {
      id: tutor._id,
      userId: tutor.userId,
      tutorId: tutor.tutorId,
      name: 'HiHiTutor 導師', // 移除真實姓名
      avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || 'https://hi-hi-tutor-real-backend2.vercel.app/avatars/default.png', // 使用真實頭像或完整預設 URL
      subjects: tutor.tutorProfile?.subjects || [],
      teachingAreas: tutor.tutorProfile?.teachingAreas || [],
      teachingMethods: tutor.tutorProfile?.teachingMethods || [],
      experience: tutor.tutorProfile?.teachingExperienceYears || 0,
      introduction: tutor.tutorProfile?.introduction || '',
      education: tutor.tutorProfile?.educationLevel || '',
      qualifications: tutor.tutorProfile?.documents?.map(doc => doc.type) || [],
      hourlyRate: tutor.tutorProfile?.sessionRate || 0,
      availableTime: tutor.tutorProfile?.availableTime?.map(time => `${time.day} ${time.time}`.trim()) || [],
      examResults: tutor.tutorProfile?.examResults?.map(exam => `${exam.subject} ${exam.grade}`).join(', ') || '',
      courseFeatures: tutor.tutorProfile?.courseFeatures || '',
      // 暫時回傳空的公開證書陣列，後續可以根據實際需求修改
      publicCertificates: [],
      rating: tutor.rating || 0,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
      // 新增：用戶升級做導師時填寫的欄位
      tutorProfile: {
        gender: tutor.tutorProfile?.gender || 'male', // 添加性別信息
        birthDate: tutor.tutorProfile?.birthDate, // 添加出生日期
        teachingMode: tutor.tutorProfile?.teachingMethods?.[0] || '', // 使用第一個教學方法作為主要形式
        teachingSubModes: tutor.tutorProfile?.teachingMethods || [], // 使用 teachingMethods 作為教學方式
        sessionRate: tutor.tutorProfile?.sessionRate || 0,
        region: tutor.tutorProfile?.region || '',
        subRegions: tutor.tutorProfile?.subRegions || [],
        category: tutor.tutorProfile?.category || '',
        subCategory: tutor.tutorProfile?.subCategory || '',
        subjects: tutor.tutorProfile?.subjects || [],
        education: tutor.tutorProfile?.educationLevel || '',
        experience: tutor.tutorProfile?.teachingExperienceYears || 0
      },
      // 新增：導師申請資料
      tutorApplication: {
        education: tutor.tutorProfile?.educationLevel || '',
        experience: tutor.tutorProfile?.teachingExperienceYears || 0,
        subjects: tutor.tutorProfile?.subjects || [],
        documents: [] // 公開 API 不顯示證書清單
      }
    };

    res.json({
      success: true,
      data: publicData
    });
  } catch (error) {
    console.error('❌ 獲取導師詳情錯誤:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      message: '獲取導師詳情失敗',
      error: error.message
    });
  }
};

// 獲取當前登入導師的 profile
const getTutorProfile = async (req, res) => {
  try {
    const tokenUserId = req.user.userId; // 從 JWT token 中取得 userId
    const tokenId = req.user.id; // MongoDB 的 _id
    
    console.log('🔍 獲取導師 profile:', {
      tokenUserId,
      tokenId,
      userType: req.user.userType,
      role: req.user.role
    });

    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未連接，當前狀態:', mongoose.connection.readyState);
      
      // 如果正在連接中，等待連接完成
      if (mongoose.connection.readyState === 2) {
        console.log('⏳ MongoDB 正在連接中，等待連接完成...');
        
        // 等待連接完成，最多等待 30 秒
        let waitTime = 0;
        const maxWaitTime = 30000; // 30 秒
        const checkInterval = 1000; // 每秒檢查一次
        
        while (mongoose.connection.readyState !== 1 && waitTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          waitTime += checkInterval;
          console.log(`⏳ 等待連接完成... (${waitTime}/${maxWaitTime}ms)`);
        }
        
        if (mongoose.connection.readyState !== 1) {
          console.log('❌ 等待連接超時');
          return res.status(503).json({ 
            success: false,
            message: 'Database connection timeout', 
            error: 'MongoDB connection timeout',
            mongoState: mongoose.connection.readyState
          });
        }
        
        console.log('✅ MongoDB 連接完成');
      } else {
        return res.status(503).json({ 
          success: false,
          message: 'Database not ready', 
          error: 'MongoDB connection is not established',
          mongoState: mongoose.connection.readyState
        });
      }
    }

    // 使用 userId 查找用戶
    const user = await User.findOne({ userId: tokenUserId }).select('-password');
    
    if (!user) {
      console.log('❌ 找不到用戶:', tokenUserId);
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    console.log('✅ 用戶存在:', { userId: tokenUserId, userName: user.name, userType: user.userType });

    // 檢查是否為導師或機構用戶
    if (user.userType !== 'tutor' && user.userType !== 'organization') {
      return res.status(403).json({
        success: false,
        message: '只有導師和機構用戶才能使用此 API'
      });
    }

    // 獲取該用戶的證書上傳記錄
    const certificateLogs = await UploadLog.find({ 
      userId: user._id,
      type: { $in: ['document', 'image'] } // 只獲取證書類型的文件
    }).sort({ createdAt: -1 });

    console.log('✅ 導師 profile 獲取成功:', user.name);
    console.log('📁 證書記錄數量:', certificateLogs.length);
    console.log('🔍 documents.educationCert:', user.documents?.educationCert);
    console.log('🔍 tutorProfile.publicCertificates:', user.tutorProfile?.publicCertificates);
    console.log('🔍 certificateLogs:', certificateLogs.map(log => ({ fileUrl: log.fileUrl, type: log.type })));

    // 回傳符合前端期望的格式
    res.json({
      tutorId: user.tutorId || user._id,
      name: user.name,
      gender: user.tutorProfile?.gender || 'male',
      birthDate: user.tutorProfile?.birthDate,
      subjects: user.tutorProfile?.subjects || [],
      teachingAreas: user.tutorProfile?.teachingAreas || [],
      teachingMethods: user.tutorProfile?.teachingMethods || [],
      experience: user.tutorProfile?.teachingExperienceYears || 0,
      introduction: user.tutorProfile?.introduction || '',
      education: user.tutorProfile?.educationLevel || '',
      qualifications: user.tutorProfile?.qualifications || [],
      hourlyRate: user.tutorProfile?.sessionRate || 0,
      availableTime: user.tutorProfile?.availableTime?.map(time => `${time.day} ${time.time}`.trim()) || [],
      avatar: user.avatar || user.tutorProfile?.avatarUrl || '',
      avatarOffsetX: user.tutorProfile?.avatarOffsetX || 50,
      examResults: user.tutorProfile?.examResults?.map(exam => `${exam.subject} ${exam.grade}`).join(', ') || '',
      courseFeatures: user.tutorProfile?.courseFeatures || '',
      documents: {
        idCard: user.documents?.idCard || '',
        educationCert: Array.isArray(user.documents?.educationCert) 
          ? user.documents.educationCert 
          : (user.documents?.educationCert ? [user.documents.educationCert] : [])
      },
      profileStatus: user.profileStatus || 'approved',
      remarks: user.remarks || '',
      certificateLogs: certificateLogs.map(log => ({
        _id: log._id,
        fileUrl: log.fileUrl,
        type: log.type,
        createdAt: log.createdAt
      })),
      publicCertificates: user.tutorProfile?.publicCertificates || [],
      // 新增：用戶升級做導師時填寫的欄位
      tutorProfile: {
        teachingMode: user.tutorProfile?.teachingMode || '',
        teachingSubModes: user.tutorProfile?.teachingSubModes || [],
        sessionRate: user.tutorProfile?.sessionRate || 0,
        region: user.tutorProfile?.region || '',
        subRegions: user.tutorProfile?.subRegions || [],
        category: user.tutorProfile?.category || '',
        subCategory: user.tutorProfile?.subCategory || '',
        subjects: user.tutorProfile?.subjects || [],
        education: user.tutorProfile?.educationLevel || '',
        experience: user.tutorProfile?.teachingExperienceYears || 0
      },
      // 新增：導師申請資料
      tutorApplication: {
        education: user.tutorProfile?.educationLevel || '',
        experience: user.tutorProfile?.teachingExperienceYears || 0,
        subjects: user.tutorProfile?.subjects || [],
        documents: certificateLogs.map(log => log.fileUrl)
      }
    });
  } catch (error) {
    console.error('❌ 獲取導師 profile 錯誤:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: '獲取導師 profile 失敗',
      error: error.message
    });
  }
};

// 更新當前登入導師的 profile
const updateTutorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    console.log('🔍 更新導師 profile:', userId, updateData);

    // 確保 MongoDB 連接
    const { ensureConnection } = require('../config/db');
    try {
      await ensureConnection();
      console.log('✅ Database connection ensured');
    } catch (dbError) {
      console.error('❌ Failed to ensure database connection:', dbError);
      return res.status(503).json({ 
        success: false,
        message: 'Database not ready', 
        error: 'MongoDB connection failed',
        details: dbError.message
      });
    }

    // 檢查導師是否存在
    const tutor = await User.findById(userId);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '找不到導師'
      });
    }

    if (tutor.userType !== 'tutor' && tutor.userType !== 'organization') {
      return res.status(400).json({
        success: false,
        message: '該用戶不是導師或機構用戶'
      });
    }

    // 構建更新對象
    const updateObject = {};
    
    // 直接更新的字段
    if (updateData.name !== undefined) updateObject.name = updateData.name;
    if (updateData.avatar !== undefined) updateObject.avatar = updateData.avatar;
    
    // tutorProfile 子對象的字段
    if (updateData.gender !== undefined) updateObject['tutorProfile.gender'] = updateData.gender;
    if (updateData.birthDate !== undefined) updateObject['tutorProfile.birthDate'] = updateData.birthDate;
    if (updateData.experience !== undefined) updateObject['tutorProfile.teachingExperienceYears'] = updateData.experience;
    if (updateData.education !== undefined) updateObject['tutorProfile.educationLevel'] = updateData.education;
    
    // 同時更新根級別的education字段，確保一致性
    if (updateData.education !== undefined) updateObject.education = updateData.education;
    
    // 確保 subjects 有值，避免驗證錯誤
    if (updateData.subjects !== undefined) {
      updateObject['tutorProfile.subjects'] = Array.isArray(updateData.subjects) && updateData.subjects.length > 0 
        ? updateData.subjects 
        : ['primary-chinese']; // 默認值
    }
    
    if (updateData.teachingAreas !== undefined) updateObject['tutorProfile.teachingAreas'] = updateData.teachingAreas;
    if (updateData.teachingMethods !== undefined) updateObject['tutorProfile.teachingMethods'] = updateData.teachingMethods;
    
    // 處理教學模式相關字段
    if (updateData.teachingMode !== undefined) updateObject['tutorProfile.teachingMode'] = updateData.teachingMode;
    if (updateData.teachingSubModes !== undefined) updateObject['tutorProfile.teachingSubModes'] = updateData.teachingSubModes;
    
    // 處理地區相關字段
    if (updateData.region !== undefined) updateObject['tutorProfile.region'] = updateData.region;
    if (updateData.subRegions !== undefined) updateObject['tutorProfile.subRegions'] = updateData.subRegions;
    
    // 處理嵌套的 tutorProfile 數據
    if (updateData.tutorProfile) {
      if (updateData.tutorProfile.subRegions !== undefined) {
        updateObject['tutorProfile.subRegions'] = updateData.tutorProfile.subRegions;
      }
      if (updateData.tutorProfile.subjects !== undefined) {
        updateObject['tutorProfile.subjects'] = Array.isArray(updateData.tutorProfile.subjects) && updateData.tutorProfile.subjects.length > 0 
          ? updateData.tutorProfile.subjects 
          : ['primary-chinese']; // 默認值
      }
      if (updateData.tutorProfile.teachingAreas !== undefined) {
        updateObject['tutorProfile.teachingAreas'] = updateData.tutorProfile.teachingAreas;
      }
      if (updateData.tutorProfile.teachingMethods !== undefined) {
        updateObject['tutorProfile.teachingMethods'] = updateData.tutorProfile.teachingMethods;
      }
      if (updateData.tutorProfile.availableTime !== undefined) {
        updateObject['tutorProfile.availableTime'] = updateData.tutorProfile.availableTime;
      }
      if (updateData.tutorProfile.hourlyRate !== undefined) {
        updateObject['tutorProfile.sessionRate'] = updateData.tutorProfile.hourlyRate >= 100 ? updateData.tutorProfile.hourlyRate : 100;
      }
    }
    
    // 確保 sessionRate 有值，避免驗證錯誤
    if (updateData.hourlyRate !== undefined) {
      updateObject['tutorProfile.sessionRate'] = updateData.hourlyRate >= 100 ? updateData.hourlyRate : 100; // 默認值
    }
    
    if (updateData.introduction !== undefined) updateObject['tutorProfile.introduction'] = updateData.introduction;
    if (updateData.courseFeatures !== undefined) updateObject['tutorProfile.courseFeatures'] = updateData.courseFeatures;
    if (updateData.avatarOffsetX !== undefined) updateObject['tutorProfile.avatarOffsetX'] = updateData.avatarOffsetX;
    
    // 處理 examResults - 將字符串轉換為對象數組
    if (updateData.examResults !== undefined) {
      if (typeof updateData.examResults === 'string') {
        // 如果是字符串，轉換為對象格式
        updateObject['tutorProfile.examResults'] = [{ subject: '考試', grade: updateData.examResults }];
      } else if (Array.isArray(updateData.examResults)) {
        // 如果是數組，檢查是否已經是對象格式
        const examResults = updateData.examResults.map(item => {
          if (typeof item === 'string') {
            return { subject: '考試', grade: item };
          }
          return item;
        });
        updateObject['tutorProfile.examResults'] = examResults;
      }
    }
    
    // 處理 availableTime - 將字符串數組轉換為對象數組
    if (updateData.availableTime !== undefined) {
      if (Array.isArray(updateData.availableTime)) {
        const availableTime = updateData.availableTime.map(timeStr => {
          if (typeof timeStr === 'string') {
            // 解析 "星期一 上午" 格式
            const parts = timeStr.split(' ');
            if (parts.length >= 2) {
              return { day: parts[0], time: parts[1] };
            } else {
              return { day: timeStr, time: '' };
            }
          }
          return timeStr;
        });
        updateObject['tutorProfile.availableTime'] = availableTime;
      }
    }
    
    // 處理 qualifications - 直接保存為字符串數組
    if (updateData.qualifications !== undefined) {
      updateObject['tutorProfile.qualifications'] = Array.isArray(updateData.qualifications) 
        ? updateData.qualifications 
        : [];
    }

    // 處理 documents - 身份證和學歷證書
    if (updateData.documents !== undefined) {
      if (updateData.documents.idCard !== undefined) {
        updateObject['documents.idCard'] = updateData.documents.idCard;
      }
      if (updateData.documents.educationCert !== undefined) {
        // 確保 educationCert 是陣列格式
        const educationCert = Array.isArray(updateData.documents.educationCert) 
          ? updateData.documents.educationCert 
          : [updateData.documents.educationCert];
        updateObject['documents.educationCert'] = educationCert;
      }
    }

    // 處理公開證書
    if (updateData.publicCertificates !== undefined) {
      updateObject['tutorProfile.publicCertificates'] = Array.isArray(updateData.publicCertificates) 
        ? updateData.publicCertificates 
        : [];
    }

    console.log('📝 更新對象:', updateObject);

    // 記錄修改歷史
    const changeLog = {
      timestamp: new Date(),
      fields: Object.keys(updateObject),
      oldValues: {},
      newValues: updateObject,
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    // 獲取舊值用於比較
    for (const field of Object.keys(updateObject)) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        changeLog.oldValues[field] = tutor[parent]?.[child];
      } else {
        changeLog.oldValues[field] = tutor[field];
      }
    }

    // 更新導師資料，即時生效（不再需要審批）
    const updatedTutor = await User.findByIdAndUpdate(
      userId,
      { 
        $set: updateObject,
        profileStatus: 'approved', // 直接設為已批准
        $push: { 
          profileChangeLog: changeLog // 添加修改記錄
        }
      },
      { new: true }
    ).select('-password');

    console.log('✅ 導師 profile 更新成功，即時生效');

    // 發送管理員通知（可選）
    try {
      // 這裡可以添加發送通知到管理員的邏輯
      console.log('📢 導師資料已更新，發送管理員通知');
      // await sendAdminNotification({
      //   type: 'tutor_profile_updated',
      //   tutorId: tutor.tutorId || tutor.userId,
      //   tutorName: tutor.name,
      //   changes: changeLog,
      //   timestamp: new Date()
      // });
    } catch (notificationError) {
      console.error('⚠️ 發送管理員通知失敗:', notificationError);
      // 通知失敗不影響主要功能
    }

    res.json({
      success: true,
      data: updatedTutor,
      message: '導師資料更新成功，已即時生效'
    });
  } catch (error) {
    console.error('❌ 更新導師 profile 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新導師 profile 失敗',
      error: error.message
    });
  }
};



module.exports = {
  getAllTutors,
  getTutorByTutorId,
  getTutors,
  getTutorDetail,
  getTutorProfile,
  updateTutorProfile,
  testTutors
}; 