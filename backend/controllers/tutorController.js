const tutors = require('../data/tutors');
const User = require('../models/User');
const UploadLog = require('../models/UploadLog');
const mongoose = require('mongoose');
const TutorCase = require('../models/TutorCase');

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
    
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未連接，當前狀態:', mongoose.connection.readyState);
      console.log('- 連接狀態說明: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
      console.log('- 使用 mock 數據作為 fallback');
      
      // 使用 mock 數據而不是返回錯誤
      try {
        const mockTutors = require('../data/tutors');
        
        // 過濾模擬數據
        let filteredMockTutors = mockTutors;
        
        // 搜尋過濾
        if (search) {
          const searchLower = search.toLowerCase();
          filteredMockTutors = filteredMockTutors.filter(tutor => 
            tutor.name.toLowerCase().includes(searchLower) ||
            (tutor.subject && tutor.subject.toLowerCase().includes(searchLower)) ||
            (tutor.education && tutor.education.toLowerCase().includes(searchLower))
          );
          console.log(`- 搜尋 "${search}" 後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 科目過濾
        if (subjects) {
          const subjectArray = Array.isArray(subjects) ? subjects : subjects.split(',');
          console.log(`- 科目過濾條件: ${subjectArray.join(', ')}`);
          
          filteredMockTutors = filteredMockTutors.filter(tutor => {
            // 檢查 tutor.subjects 數組
            if (tutor.subjects && Array.isArray(tutor.subjects)) {
              const hasMatchingSubject = subjectArray.some(filterSubject => 
                tutor.subjects.some(tutorSubject => 
                  tutorSubject.toLowerCase() === filterSubject.toLowerCase()
                )
              );
              if (hasMatchingSubject) {
                console.log(`- 導師 ${tutor.name} 匹配科目: ${tutor.subjects.join(', ')}`);
                return true;
              }
            }
            
            // 檢查 tutor.subject 單個科目
            if (tutor.subject) {
              const hasMatchingSubject = subjectArray.some(filterSubject => 
                tutor.subject.toLowerCase() === filterSubject.toLowerCase()
              );
              if (hasMatchingSubject) {
                console.log(`- 導師 ${tutor.name} 匹配科目: ${tutor.subject}`);
                return true;
              }
            }
            
            return false;
          });
          
          console.log(`- 科目過濾後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 分類過濾
        if (category) {
          console.log(`- 分類過濾: ${category}`);
          // 根據分類獲取對應的科目列表
          const categorySubjects = getCategorySubjects(category);
          if (categorySubjects && categorySubjects.length > 0) {
            filteredMockTutors = filteredMockTutors.filter(tutor => 
              categorySubjects.some(subject => 
                tutor.subject && tutor.subject.toLowerCase().includes(subject.toLowerCase()) ||
                (tutor.subjects && tutor.subjects.some(tutorSubject => 
                  tutorSubject.toLowerCase().includes(subject.toLowerCase())
                ))
              )
            );
            console.log(`- 分類過濾科目: ${categorySubjects.join(', ')}`);
            console.log(`- 分類過濾後剩餘導師: ${filteredMockTutors.length} 個`);
          } else {
            console.log(`⚠️ 未找到分類 ${category} 對應的科目`);
          }
        }
        
        // 精選導師過濾
        if (featured === 'true') {
          filteredMockTutors = filteredMockTutors.filter(tutor => tutor.isVip || tutor.isTop);
          console.log(`- 精選導師過濾後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 教學模式過濾
        if (modes) {
          const modeArray = Array.isArray(modes) ? modes : modes.split(',');
          console.log(`- 教學模式過濾條件: ${modeArray.join(', ')}`);
          
          filteredMockTutors = filteredMockTutors.filter(tutor => {
            // 檢查 tutor.teachingModes 數組
            if (tutor.teachingModes && Array.isArray(tutor.teachingModes)) {
              const hasMatchingMode = modeArray.some(filterMode => 
                tutor.teachingModes.some(tutorMode => 
                  tutorMode.toLowerCase() === filterMode.toLowerCase()
                )
              );
              if (hasMatchingMode) {
                console.log(`- 導師 ${tutor.name} 匹配教學模式: ${tutor.teachingModes.join(', ')}`);
                return true;
              }
            }
            
            return false;
          });
          
          console.log(`- 教學模式過濾後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 排序和限制
        filteredMockTutors.sort((a, b) => b.rating - a.rating);
        filteredMockTutors = filteredMockTutors.slice(0, parseInt(limit) || 15);
        
        const mappedTutors = filteredMockTutors.map(tutor => ({
          _id: tutor.id,
          userId: tutor.id,
          name: tutor.name,
          subjects: tutor.subject ? [tutor.subject] : ['數學', '英文', '中文'],
          education: tutor.education,
          experience: tutor.experience,
          rating: tutor.rating,
          avatar: tutor.avatarUrl,
          isVip: tutor.isVip,
          isTop: tutor.isTop,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString()
        }));
        
        console.log(`✅ 使用模擬數據，找到 ${mappedTutors.length} 個導師`);
        
        // 將 mappedTutors 賦值給 tutors 變數
        tutors = mappedTutors;

        // 直接格式化並返回 mock 數據
        const formattedTutors = tutors.map(tutor => {
          // 處理 subjects 陣列
          let subjects = [];
          if (tutor.subjects && Array.isArray(tutor.subjects)) {
            subjects = tutor.subjects;
          } else if (tutor.subject) {
            subjects = [tutor.subject];
          } else {
            // 如果沒有科目資料，提供預設科目
            subjects = ['數學', '英文', '中文'];
          }

          // 處理頭像 URL
          let avatarUrl = '';
          if (tutor.avatar) {
            avatarUrl = tutor.avatar;
          } else {
            // 如果沒有頭像，使用預設頭像
            avatarUrl = `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`;
          }

          // 確保頭像 URL 是完整的
          if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
            // 如果是相對路徑，添加基礎 URL
            avatarUrl = `https://hi-hi-tutor-real-backend2.vercel.app${avatarUrl}`;
          }

          return {
            id: tutor._id || tutor.id,
            userId: tutor.userId || tutor.id,
            name: tutor.name || '未命名導師',
            subjects: subjects,
            education: tutor.education || '未指定',
            experience: tutor.experience || '未指定',
            rating: tutor.rating || 4.5,
            avatarUrl: avatarUrl,
            isVip: tutor.isVip || false,
            isTop: tutor.isTop || false,
            createdAt: tutor.createdAt || new Date().toISOString(),
            date: tutor.createdAt || new Date().toISOString(),
            teachingModes: tutor.teachingModes || []
          };
        });

        console.log(`📤 返回 ${formattedTutors.length} 個 mock 導師數據`);
        return res.json({ 
          success: true,
          data: { tutors: formattedTutors },
          source: 'mock',
          mongoState: mongoose.connection.readyState,
          mongoStateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
        });
      } catch (mockError) {
        console.error('❌ 載入 mock 數據失敗:', mockError);
        return res.status(500).json({
          success: false,
          message: 'Failed to load data',
          error: mockError.message
        });
      }
    }
    
    console.log('✅ MongoDB 連接正常，開始查詢導師資料');
    
    // 基本查詢條件
    let query = { 
      userType: 'tutor',
      isActive: true,
      status: 'active'
    };
    
    // 添加搜尋條件
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'tutorProfile.subjects': { $regex: search, $options: 'i' } },
        { 'tutorProfile.educationLevel': { $regex: search, $options: 'i' } }
      ];
      console.log(`🔍 添加搜尋條件: "${search}"`);
    }
    
    // 添加科目過濾
    if (subjects) {
      const subjectArray = Array.isArray(subjects) ? subjects : subjects.split(',');
      query['tutorProfile.subjects'] = { $in: subjectArray.map(s => new RegExp(s, 'i')) };
      console.log(`🔍 添加科目過濾: ${subjectArray.join(', ')}`);
    }
    
    // 添加地區過濾
    if (regions) {
      const regionArray = Array.isArray(regions) ? regions : regions.split(',');
      query['tutorProfile.regions'] = { $in: regionArray.map(r => new RegExp(r, 'i')) };
      console.log(`🔍 添加地區過濾: ${regionArray.join(', ')}`);
    }
    
    // 添加教學模式過濾
    if (modes) {
      const modeArray = Array.isArray(modes) ? modes : modes.split(',');
      query['tutorProfile.teachingModes'] = { $in: modeArray.map(m => new RegExp(m, 'i')) };
      console.log(`🔍 添加教學模式過濾: ${modeArray.join(', ')}`);
    }
    
    // 添加分類過濾
    if (category) {
      console.log(`🔍 添加分類過濾: ${category}`);
      
      // 根據分類獲取對應的科目列表
      const categorySubjects = getCategorySubjects(category);
      if (categorySubjects && categorySubjects.length > 0) {
        // 使用 $or 查詢來匹配任何一個科目
        query.$or = query.$or || [];
        query.$or.push(
          { 'tutorProfile.subjects': { $in: categorySubjects } },
          { subjects: { $in: categorySubjects } }
        );
        console.log(`🔍 分類過濾科目: ${categorySubjects.join(', ')}`);
      } else {
        console.log(`⚠️ 未找到分類 ${category} 對應的科目`);
      }
    }
    
    // 如果是 featured 請求，添加精選條件
    if (featured === 'true') {
      console.log('🔍 查詢精選導師 (featured=true)');
      
      // 添加精選條件
      query.$or = query.$or || [];
      query.$or.push({ isTop: true }, { isVip: true });
      
      console.log('🔍 查詢條件:', query);
      
      tutors = await User.find(query)
        .sort({ rating: -1, createdAt: -1 })
        .limit(parseInt(limit) || 15)
        .lean();
      
      console.log(`✅ 從 MongoDB 找到 ${tutors.length} 個精選導師`);
      
      // 如果沒有精選導師，使用 fallback 查詢
      if (tutors.length === 0) {
        console.log('⚠️ 沒有精選導師，使用 fallback 查詢條件');
        
        // 移除精選條件，使用基本查詢
        const fallbackQuery = { ...query };
        delete fallbackQuery.$or;
        
        console.log('🔍 Fallback 查詢條件:', fallbackQuery);
        
        tutors = await User.find(fallbackQuery)
          .sort({ rating: -1, createdAt: -1 })
          .limit(parseInt(limit) || 15)
          .lean();
        
        console.log(`✅ Fallback 查詢找到 ${tutors.length} 個導師`);
      }
    } else {
      // 非 featured 請求，使用標準查詢
      console.log('🔍 查詢所有導師 (featured=false)');
      console.log('🔍 查詢條件:', query);
      
      tutors = await User.find(query)
        .sort({ rating: -1, createdAt: -1 })
        .limit(parseInt(limit) || 15)
        .lean();
      
      console.log(`✅ 從 MongoDB 找到 ${tutors.length} 個導師`);
    }
    
    // 如果數據庫中沒有導師數據，使用模擬數據
    if (tutors.length === 0) {
      console.log('⚠️ 數據庫中沒有導師數據，使用模擬數據');
      console.log('- 可能原因: 數據庫中沒有 userType=tutor 的用戶');
      console.log('- 或者所有導師都不符合查詢條件');
      
      try {
        const mockTutors = require('../data/tutors');
        
        // 過濾模擬數據
        let filteredMockTutors = mockTutors;
        
        // 搜尋過濾
        if (search) {
          const searchLower = search.toLowerCase();
          filteredMockTutors = filteredMockTutors.filter(tutor => 
            tutor.name.toLowerCase().includes(searchLower) ||
            (tutor.subject && tutor.subject.toLowerCase().includes(searchLower)) ||
            (tutor.education && tutor.education.toLowerCase().includes(searchLower))
          );
          console.log(`- 搜尋 "${search}" 後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 科目過濾
        if (subjects) {
          const subjectArray = Array.isArray(subjects) ? subjects : subjects.split(',');
          console.log(`- 科目過濾條件: ${subjectArray.join(', ')}`);
          
          filteredMockTutors = filteredMockTutors.filter(tutor => {
            // 檢查 tutor.subjects 數組
            if (tutor.subjects && Array.isArray(tutor.subjects)) {
              const hasMatchingSubject = subjectArray.some(filterSubject => 
                tutor.subjects.some(tutorSubject => 
                  tutorSubject.toLowerCase() === filterSubject.toLowerCase()
                )
              );
              if (hasMatchingSubject) {
                console.log(`- 導師 ${tutor.name} 匹配科目: ${tutor.subjects.join(', ')}`);
                return true;
              }
            }
            
            // 檢查 tutor.subject 單個科目
            if (tutor.subject) {
              const hasMatchingSubject = subjectArray.some(filterSubject => 
                tutor.subject.toLowerCase() === filterSubject.toLowerCase()
              );
              if (hasMatchingSubject) {
                console.log(`- 導師 ${tutor.name} 匹配科目: ${tutor.subject}`);
                return true;
              }
            }
            
            return false;
          });
          
          console.log(`- 科目過濾後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 分類過濾
        if (category) {
          console.log(`- 分類過濾: ${category}`);
          // 根據分類獲取對應的科目列表
          const categorySubjects = getCategorySubjects(category);
          if (categorySubjects && categorySubjects.length > 0) {
            filteredMockTutors = filteredMockTutors.filter(tutor => 
              categorySubjects.some(subject => 
                tutor.subject && tutor.subject.toLowerCase().includes(subject.toLowerCase()) ||
                (tutor.subjects && tutor.subjects.some(tutorSubject => 
                  tutorSubject.toLowerCase().includes(subject.toLowerCase())
                ))
              )
            );
            console.log(`- 分類過濾科目: ${categorySubjects.join(', ')}`);
            console.log(`- 分類過濾後剩餘導師: ${filteredMockTutors.length} 個`);
          } else {
            console.log(`⚠️ 未找到分類 ${category} 對應的科目`);
          }
        }
        
        // 精選導師過濾
        if (featured === 'true') {
          filteredMockTutors = filteredMockTutors.filter(tutor => tutor.isVip || tutor.isTop);
          console.log(`- 精選導師過濾後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 教學模式過濾
        if (modes) {
          const modeArray = Array.isArray(modes) ? modes : modes.split(',');
          console.log(`- 教學模式過濾條件: ${modeArray.join(', ')}`);
          
          filteredMockTutors = filteredMockTutors.filter(tutor => {
            // 檢查 tutor.teachingModes 數組
            if (tutor.teachingModes && Array.isArray(tutor.teachingModes)) {
              const hasMatchingMode = modeArray.some(filterMode => 
                tutor.teachingModes.some(tutorMode => 
                  tutorMode.toLowerCase() === filterMode.toLowerCase()
                )
              );
              if (hasMatchingMode) {
                console.log(`- 導師 ${tutor.name} 匹配教學模式: ${tutor.teachingModes.join(', ')}`);
                return true;
              }
            }
            
            return false;
          });
          
          console.log(`- 教學模式過濾後剩餘導師: ${filteredMockTutors.length} 個`);
        }
        
        // 排序和限制
        filteredMockTutors.sort((a, b) => b.rating - a.rating);
        filteredMockTutors = filteredMockTutors.slice(0, parseInt(limit) || 15);
        
        tutors = filteredMockTutors.map(tutor => ({
          _id: tutor.id,
          userId: tutor.id,
          name: tutor.name,
          subjects: tutor.subject ? [tutor.subject] : ['數學', '英文', '中文'],
          education: tutor.education,
          experience: tutor.experience,
          rating: tutor.rating,
          avatar: tutor.avatarUrl,
          isVip: tutor.isVip,
          isTop: tutor.isTop,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString()
        }));
        
        console.log(`✅ 使用模擬數據，找到 ${tutors.length} 個導師`);
      } catch (mockError) {
        console.error('❌ 載入模擬數據失敗:', mockError);
        return res.status(500).json({
          success: false,
          message: 'Failed to load mock data',
          error: mockError.message
        });
      }
    }

    const formattedTutors = tutors.map(tutor => {
      // 處理 subjects 陣列
      let subjects = [];
      if (tutor.subjects && Array.isArray(tutor.subjects)) {
        subjects = tutor.subjects;
      } else if (tutor.tutorProfile?.subjects && Array.isArray(tutor.tutorProfile.subjects)) {
        subjects = tutor.tutorProfile.subjects;
      } else if (tutor.subject) {
        subjects = [tutor.subject];
      } else {
        // 如果沒有科目資料，提供預設科目
        subjects = ['數學', '英文', '中文'];
      }

      // 處理頭像 URL
      let avatarUrl = '';
      if (tutor.avatarUrl) {
        avatarUrl = tutor.avatarUrl;
      } else if (tutor.avatar) {
        avatarUrl = tutor.avatar;
      } else if (tutor.tutorProfile?.avatarUrl) {
        avatarUrl = tutor.tutorProfile.avatarUrl;
      } else {
        // 如果沒有頭像，使用預設頭像
        avatarUrl = `/avatars/teacher${Math.floor(Math.random() * 6) + 1}.png`;
      }

      // 確保頭像 URL 是完整的
      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
        // 如果是相對路徑，添加基礎 URL
        avatarUrl = `https://hi-hi-tutor-real-backend2.vercel.app${avatarUrl}`;
      }

      return {
        id: tutor._id || tutor.id,
        userId: tutor.userId || tutor.id,
        name: tutor.name || '未命名導師',
        subjects: subjects,
        education: tutor.education || tutor.tutorProfile?.educationLevel || '未指定',
        experience: tutor.experience || tutor.tutorProfile?.teachingExperienceYears || '未指定',
        rating: tutor.rating || 4.5,
        avatarUrl: avatarUrl,
        isVip: tutor.isVip || false,
        isTop: tutor.isTop || false,
        createdAt: tutor.createdAt || new Date().toISOString(),
        date: tutor.createdAt || new Date().toISOString(),
        teachingModes: tutor.teachingModes || []
      };
    });

    console.log(`📤 返回 ${formattedTutors.length} 個導師數據`);
    res.json({ 
      success: true,
      data: { tutors: formattedTutors },
      source: tutors.length === 0 ? 'mock' : 'database'
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

// 根據 ID 回傳特定導師
const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 查找導師:', id);
    
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB 未連接，當前狀態:', mongoose.connection.readyState);
      console.log('- 使用 mock 數據作為 fallback');
      
      // 使用 mock 數據
      try {
        const mockTutors = require('../data/tutors');
        const mockTutor = mockTutors.find(tutor => tutor.id == id); // 使用 == 來比較數字和字串
        
        if (!mockTutor) {
          console.log('❌ 在 mock 數據中找不到導師:', id);
          return res.status(404).json({ 
            success: false,
            message: '找不到該導師',
            source: 'mock'
          });
        }
        
        console.log('✅ 在 mock 數據中找到導師:', mockTutor.name);
        
        // 格式化 mock 數據以符合 API 格式
        const formattedTutor = {
          id: mockTutor.id,
          userId: mockTutor.id,
          name: mockTutor.name,
          subjects: mockTutor.subject ? [mockTutor.subject] : ['數學', '英文', '中文'],
          education: mockTutor.education,
          experience: mockTutor.experience,
          rating: mockTutor.rating,
          avatar: mockTutor.avatarUrl,
          isVip: mockTutor.isVip,
          isTop: mockTutor.isTop,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString()
        };
        
        return res.json({
          success: true,
          data: formattedTutor,
          source: 'mock',
          mongoState: mongoose.connection.readyState
        });
      } catch (mockError) {
        console.error('❌ 載入 mock 數據失敗:', mockError);
        return res.status(500).json({
          success: false,
          message: 'Failed to load data',
          error: mockError.message
        });
      }
    }
    
    // MongoDB 連接正常，嘗試多種方式查找導師
    let tutor = null;
    
    // 1. 先嘗試用 userId 查找
    if (id && id !== 'undefined') {
      tutor = await User.findOne({ 
        userId: id,
        userType: 'tutor'
      }).select('-password -refreshToken');
    }
    
    // 2. 如果找不到，嘗試用 MongoDB _id 查找
    if (!tutor && id && id.length === 24) {
      tutor = await User.findOne({ 
        _id: id,
        userType: 'tutor'
      }).select('-password -refreshToken');
    }
    
    // 3. 如果還是找不到，嘗試用 tutorId 查找
    if (!tutor) {
      tutor = await User.findOne({ 
        tutorId: id,
        userType: 'tutor'
      }).select('-password -refreshToken');
    }
    
    // 4. 如果 MongoDB 中找不到，fallback 到 mock 數據
    if (!tutor) {
      console.log('⚠️ MongoDB 中找不到導師，嘗試 mock 數據:', id);
      
      try {
        const mockTutors = require('../data/tutors');
        const mockTutor = mockTutors.find(tutor => tutor.id == id); // 使用 == 來比較數字和字串
        
        if (!mockTutor) {
          console.log('❌ 在 mock 數據中也找不到導師:', id);
          return res.status(404).json({ 
            success: false,
            message: '找不到該導師',
            source: 'both'
          });
        }
        
        console.log('✅ 在 mock 數據中找到導師:', mockTutor.name);
        
        // 格式化 mock 數據以符合 API 格式
        const formattedTutor = {
          id: mockTutor.id,
          userId: mockTutor.id,
          name: mockTutor.name,
          subjects: mockTutor.subject ? [mockTutor.subject] : ['數學', '英文', '中文'],
          education: mockTutor.education,
          experience: mockTutor.experience,
          rating: mockTutor.rating,
          avatar: mockTutor.avatarUrl,
          isVip: mockTutor.isVip,
          isTop: mockTutor.isTop,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString()
        };
        
        return res.json({
          success: true,
          data: formattedTutor,
          source: 'mock-fallback',
          mongoState: mongoose.connection.readyState
        });
      } catch (mockError) {
        console.error('❌ 載入 mock 數據失敗:', mockError);
        return res.status(404).json({ 
          success: false,
          message: '找不到該導師',
          source: 'error'
        });
      }
    }
    
    console.log('✅ 在 MongoDB 中找到導師:', tutor.name);
    
    // 回傳導師公開資料
    const publicProfile = {
      id: tutor._id,
      userId: tutor.userId,
      tutorId: tutor.tutorId,
      name: tutor.name,
      avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || '',
      avatarOffsetX: tutor.tutorProfile?.avatarOffsetX || 50,
      subjects: tutor.tutorProfile?.subjects || [],
      teachingAreas: tutor.tutorProfile?.teachingAreas || [],
      teachingMethods: tutor.tutorProfile?.teachingMethods || [],
      experience: tutor.tutorProfile?.teachingExperienceYears || 0,
      introduction: tutor.tutorProfile?.introduction || '',
      education: tutor.tutorProfile?.educationLevel || '',
      qualifications: tutor.tutorProfile?.documents?.map(doc => doc.type) || [],
      hourlyRate: tutor.tutorProfile?.sessionRate || 0,
      availableTime: tutor.tutorProfile?.availableTime?.map(time => `${time.day} ${time.time}`.trim()) || [],
      examResults: tutor.tutorProfile?.examResults?.map(exam => `${exam.subject} ${exam.grade}`) || [],
      courseFeatures: tutor.tutorProfile?.courseFeatures || '',
      rating: tutor.rating || 0
    };
    
    res.json({
      success: true,
      data: publicProfile,
      source: 'mongodb'
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
    
    const user = await User.findOne({ tutorId });
    if (!user || user.userType !== 'tutor') {
      console.log('❌ 找不到導師:', tutorId);
      return res.status(404).json({ 
        success: false, 
        message: '找不到導師' 
      });
    }
    
    console.log('✅ 找到導師:', user.name);
    
    // 只回傳公開資料
    const publicProfile = {
      tutorId: user.tutorId,
      education: user.tutorProfile?.education,
      experience: user.tutorProfile?.experience,
      specialties: user.tutorProfile?.specialties,
      introduction: user.tutorProfile?.introduction,
      // 其他你想公開的欄位
    };
    res.json({ success: true, data: publicProfile });
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

    // 地區篩選
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
      .select('userId tutorId name avatar subjects teachingAreas teachingMethods experience rating introduction')
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

    res.json({
      success: true,
      data: tutor
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
      return res.status(503).json({ 
        success: false,
        message: 'Database not ready', 
        error: 'MongoDB connection is not established',
        mongoState: mongoose.connection.readyState
      });
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

    // 檢查是否為導師
    if (user.userType !== 'tutor') {
      return res.status(403).json({
        success: false,
        message: '只有導師才能使用此 API'
      });
    }

    // 獲取該用戶的所有上傳記錄
    const uploadLogs = await UploadLog.find({ 
      userId: user._id 
    }).sort({ createdAt: -1 });

    console.log('✅ 導師 profile 獲取成功:', user.name);
    console.log('📁 上傳記錄數量:', uploadLogs.length);

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
      qualifications: user.tutorProfile?.documents?.map(doc => doc.type) || [],
      hourlyRate: user.tutorProfile?.sessionRate || 0,
      availableTime: user.tutorProfile?.availableTime?.map(time => `${time.day} ${time.time}`.trim()) || [],
      avatar: user.avatar || user.tutorProfile?.avatarUrl || '',
      avatarOffsetX: user.tutorProfile?.avatarOffsetX || 50,
      examResults: user.tutorProfile?.examResults?.map(exam => `${exam.subject} ${exam.grade}`).join(', ') || '',
      courseFeatures: user.tutorProfile?.courseFeatures || '',
      documents: {
        idCard: user.documents?.idCard || '',
        educationCert: user.documents?.educationCert || ''
      },
      profileStatus: user.profileStatus || 'approved',
      remarks: user.remarks || '',
      uploadLogs: uploadLogs.map(log => ({
        _id: log._id,
        fileUrl: log.fileUrl,
        type: log.type,
        createdAt: log.createdAt
      }))
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

    // 檢查導師是否存在
    const tutor = await User.findById(userId);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: '找不到導師'
      });
    }

    if (tutor.userType !== 'tutor') {
      return res.status(400).json({
        success: false,
        message: '該用戶不是導師'
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
    if (updateData.subjects !== undefined) updateObject['tutorProfile.subjects'] = updateData.subjects;
    if (updateData.teachingAreas !== undefined) updateObject['tutorProfile.teachingAreas'] = updateData.teachingAreas;
    if (updateData.teachingMethods !== undefined) updateObject['tutorProfile.teachingMethods'] = updateData.teachingMethods;
    if (updateData.hourlyRate !== undefined) updateObject['tutorProfile.sessionRate'] = updateData.hourlyRate;
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
    
    // 處理 qualifications - 將字符串數組轉換為 documents 對象數組
    if (updateData.qualifications !== undefined) {
      if (Array.isArray(updateData.qualifications)) {
        const documents = updateData.qualifications.map(qual => ({
          type: qual,
          url: ''
        }));
        updateObject['tutorProfile.documents'] = documents;
      }
    }

    // 處理 documents - 身份證和學歷證書
    if (updateData.documents !== undefined) {
      if (updateData.documents.idCard !== undefined) {
        updateObject['documents.idCard'] = updateData.documents.idCard;
      }
      if (updateData.documents.educationCert !== undefined) {
        updateObject['documents.educationCert'] = updateData.documents.educationCert;
      }
    }

    console.log('📝 更新對象:', updateObject);

    // 更新導師資料並設為待審核狀態
    const updatedTutor = await User.findByIdAndUpdate(
      userId,
      { 
        $set: updateObject,
        profileStatus: 'pending',
        remarks: ''
      },
      { new: true }
    ).select('-password');

    console.log('✅ 導師 profile 更新成功，狀態設為待審核');

    res.json({
      success: true,
      data: updatedTutor,
      message: '導師資料更新成功，已提交審核'
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
  getTutorById,
  getTutorByTutorId,
  getTutors,
  getTutorDetail,
  getTutorProfile,
  updateTutorProfile,
  testTutors
}; 