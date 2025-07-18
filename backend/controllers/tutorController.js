const tutors = require('../data/tutors');
const User = require('../models/User');
const UploadLog = require('../models/UploadLog');
const mongoose = require('mongoose');
const TutorCase = require('../models/TutorCase');
const { getTeachingModeLabel } = require('../constants/teachingModeOptions');

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
    
    // 等待 MongoDB 連接就緒
    console.log('🔍 檢查 MongoDB 連接狀態...');
    let mongoState = mongoose.connection.readyState;
    console.log('- 初始狀態:', mongoState, '(', ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState], ')');
    
    // 如果正在連接中，等待連接完成
    if (mongoState === 2) {
      console.log('⏳ MongoDB 正在連接中，等待連接完成...');
      let waitCount = 0;
      const maxWait = 30; // 最多等待 30 次 (15 秒)
      
      while (mongoState === 2 && waitCount < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 等待 500ms
        mongoState = mongoose.connection.readyState;
        waitCount++;
        console.log(`- 等待中... (${waitCount}/${maxWait}) 狀態: ${mongoState}`);
      }
      
      if (mongoState === 1) {
        console.log('✅ MongoDB 連接成功！');
      } else {
        console.log('⚠️ MongoDB 連接超時，當前狀態:', mongoState);
      }
    }
    
    // 定義 tutors 變數
    let tutors = [];
    let source = 'database';
    
    // 檢查 MongoDB 連接狀態
    console.log('🔍 MongoDB 連接狀態檢查:');
    console.log('- 當前狀態:', mongoState);
    console.log('- 狀態說明: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    if (mongoState !== 1) {
      console.log('⚠️ MongoDB 未連接，嘗試重新連接...');
      
      try {
        // 嘗試重新連接
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 10000,
          connectTimeoutMS: 10000
        });
        console.log('✅ MongoDB 重新連接成功');
        mongoState = mongoose.connection.readyState;
      } catch (reconnectError) {
        console.error('❌ MongoDB 重新連接失敗:', reconnectError.message);
        console.log('⚠️ 使用 mock 數據作為 fallback');
        source = 'mock';
        
        // 使用 mock 數據作為 fallback
        const mockTutors = require('../data/tutors');
        
        // 過濾模擬數據
        let filteredMockTutors = mockTutors;
        
        // 搜尋過濾
        if (search) {
          const searchLower = typeof search === 'string' ? search.toLowerCase() : '';
          filteredMockTutors = filteredMockTutors.filter(tutor => 
            typeof tutor.name === 'string' && tutor.name.toLowerCase().includes(searchLower) ||
            (typeof tutor.subject === 'string' && tutor.subject.toLowerCase().includes(searchLower)) ||
            (typeof tutor.education === 'string' && tutor.education.toLowerCase().includes(searchLower))
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
                  typeof tutorSubject === 'string' && typeof filterSubject === 'string' && tutorSubject.toLowerCase() === filterSubject.toLowerCase()
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
                typeof tutor.subject === 'string' && typeof filterSubject === 'string' && tutor.subject.toLowerCase() === filterSubject.toLowerCase()
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
          console.log(`🎯 分類過濾: ${category}`);
          // 根據分類獲取對應的科目列表
          const categorySubjects = getCategorySubjects(category);
          if (categorySubjects && categorySubjects.length > 0) {
            console.log(`📚 分類對應的科目: ${categorySubjects.join(', ')}`);
            
            // 如果已經有科目過濾，則取交集
            if (subjects) {
              const subjectArray = Array.isArray(subjects) ? subjects : subjects.split(',');
              const intersection = subjectArray.filter(subject => 
                categorySubjects.some(catSubject => 
                  (typeof subject === 'string' && typeof catSubject === 'string' && subject.toLowerCase().includes(catSubject.toLowerCase())) ||
                  (typeof catSubject === 'string' && typeof subject === 'string' && catSubject.toLowerCase().includes(subject.toLowerCase()))
                )
              );
              if (intersection.length > 0) {
                query['tutorProfile.subjects'] = { $in: intersection };
                console.log(`🔍 科目交集: ${intersection.join(', ')}`);
              } else {
                // 如果沒有交集，返回空結果
                console.log('⚠️ 分類與科目沒有交集，返回空結果');
                tutors = [];
              }
            } else {
              // 如果沒有科目過濾，使用分類的科目進行模糊匹配
              const categoryConditions = categorySubjects.map(subject => ({
                'tutorProfile.subjects': { $regex: subject, $options: 'i' }
              }));
              
              // 如果已經有 $or 條件，合併它們
              if (query.$or) {
                query.$or = [...query.$or, ...categoryConditions];
              } else {
                query.$or = categoryConditions;
              }
              
              console.log(`🔍 使用分類科目過濾: ${categorySubjects.join(', ')}`);
            }
          } else {
            console.log(`⚠️ 未找到分類 ${category} 對應的科目`);
          }
        } else if (category === 'unlimited') {
          console.log('🎯 分類設為 unlimited，跳過分類過濾');
        }
        
        // 精選導師過濾 - 實現加權隨機選擇
        if (featured === 'true') {
          console.log('🎯 查詢精選導師 (featured=true) - 加權隨機選擇');
          
          try {
            // 分別查詢不同類型的導師
                      const vipTutors = await User.find({ 
            userType: 'tutor',
            isActive: true,
            status: 'active',
            isVip: true 
          }).select('name avatar tutorProfile rating isVip isTop createdAt tutorId');
            
            const topTutors = await User.find({ 
              userType: 'tutor',
              isActive: true,
              status: 'active',
              isTop: true,
              isVip: false  // 排除 VIP，避免重複
            }).select('name email avatar tutorProfile rating isVip isTop createdAt tutorId');
            
            const regularTutors = await User.find({ 
              userType: 'tutor',
              isActive: true,
              status: 'active',
              isVip: false,
              isTop: false
            }).select('name email avatar tutorProfile rating isVip isTop createdAt tutorId');
            
            console.log(`📊 找到導師數量:`);
            console.log(`- VIP 導師: ${vipTutors.length} 個`);
            console.log(`- 置頂導師: ${topTutors.length} 個`);
            console.log(`- 普通導師: ${regularTutors.length} 個`);
            
            // 詳細顯示每個導師嘅狀態
            if (vipTutors.length > 0) {
              console.log('👑 VIP 導師列表:');
              vipTutors.forEach(tutor => {
                console.log(`  - ${tutor.name} (isVip: ${tutor.isVip}, isTop: ${tutor.isTop}, status: ${tutor.status || 'N/A'})`);
              });
            }
            
            if (topTutors.length > 0) {
              console.log('⭐ 置頂導師列表:');
              topTutors.forEach(tutor => {
                console.log(`  - ${tutor.name} (isVip: ${tutor.isVip}, isTop: ${tutor.isTop}, status: ${tutor.status || 'N/A'})`);
              });
            }
            
            if (regularTutors.length > 0) {
              console.log('📚 普通導師列表 (前5個):');
              regularTutors.slice(0, 5).forEach(tutor => {
                console.log(`  - ${tutor.name} (isVip: ${tutor.isVip}, isTop: ${tutor.isTop}, status: ${tutor.status || 'N/A'})`);
              });
            }
            
            // 檢查所有導師嘅狀態
            const allTutors = await User.find({ userType: 'tutor' }).select('name isVip isTop isActive status');
            console.log(`🔍 資料庫中所有導師狀態檢查:`);
            console.log(`- 總導師數: ${allTutors.length}`);
            console.log(`- isActive: true 的導師: ${allTutors.filter(t => t.isActive === true).length}`);
            console.log(`- status: 'active' 的導師: ${allTutors.filter(t => t.status === 'active').length}`);
            console.log(`- isVip: true 的導師: ${allTutors.filter(t => t.isVip === true).length}`);
            console.log(`- isTop: true 的導師: ${allTutors.filter(t => t.isTop === true).length}`);
            
            // 顯示所有導師嘅詳細狀態
            console.log('📋 所有導師詳細狀態:');
            allTutors.forEach(tutor => {
              console.log(`  - ${tutor.name}: isActive=${tutor.isActive}, status=${tutor.status}, isVip=${tutor.isVip}, isTop=${tutor.isTop}`);
            });
            
            // 加權隨機選擇邏輯
            const targetCount = parseInt(limit) || 8;
            const selectedTutors = [];
            
            // 計算各類型導師的目標數量
            const vipCount = Math.ceil(targetCount * 0.5);  // 50% VIP
            const topCount = Math.ceil(targetCount * 0.3);  // 30% 置頂
            const regularCount = targetCount - vipCount - topCount;  // 剩餘給普通導師
            
            console.log(`🎲 目標分配:`);
            console.log(`- VIP: ${vipCount} 個`);
            console.log(`- 置頂: ${topCount} 個`);
            console.log(`- 普通: ${regularCount} 個`);
            
            // 隨機選擇 VIP 導師
            if (vipTutors.length > 0) {
              const shuffledVip = vipTutors.sort(() => Math.random() - 0.5);
              const selectedVip = shuffledVip.slice(0, Math.min(vipCount, vipTutors.length));
              selectedTutors.push(...selectedVip);
              console.log(`✅ 選擇了 ${selectedVip.length} 個 VIP 導師`);
            }
            
            // 隨機選擇置頂導師
            if (topTutors.length > 0) {
              const shuffledTop = topTutors.sort(() => Math.random() - 0.5);
              const selectedTop = shuffledTop.slice(0, Math.min(topCount, topTutors.length));
              selectedTutors.push(...selectedTop);
              console.log(`✅ 選擇了 ${selectedTop.length} 個置頂導師`);
            }
            
            // 隨機選擇普通導師
            if (regularTutors.length > 0) {
              const shuffledRegular = regularTutors.sort(() => Math.random() - 0.5);
              const selectedRegular = shuffledRegular.slice(0, Math.min(regularCount, regularTutors.length));
              selectedTutors.push(...selectedRegular);
              console.log(`✅ 選擇了 ${selectedRegular.length} 個普通導師`);
            }
            
            // 如果還不夠目標數量，從剩餘導師中隨機補充
            if (selectedTutors.length < targetCount) {
              const remainingTutors = [...vipTutors, ...topTutors, ...regularTutors]
                .filter(tutor => !selectedTutors.some(selected => selected._id.toString() === tutor._id.toString()));
              
              if (remainingTutors.length > 0) {
                const shuffledRemaining = remainingTutors.sort(() => Math.random() - 0.5);
                const needed = targetCount - selectedTutors.length;
                const additional = shuffledRemaining.slice(0, Math.min(needed, remainingTutors.length));
                selectedTutors.push(...additional);
                console.log(`✅ 補充了 ${additional.length} 個導師`);
              }
            }
            
            // 最終隨機排序
            const finalShuffled = selectedTutors.sort(() => Math.random() - 0.5);
            
            console.log(`🎉 最終選擇了 ${finalShuffled.length} 個導師`);
            
            // 格式化結果
            tutors = finalShuffled.map(tutor => ({
              _id: tutor._id,
              userId: tutor._id,
              tutorId: tutor.tutorId,
              name: tutor.name,
              subjects: tutor.tutorProfile?.subjects || [],
              education: tutor.tutorProfile?.educationLevel || '',
              experience: `${tutor.tutorProfile?.teachingExperienceYears || 0}年教學經驗`,
              rating: tutor.rating || 0,
              avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || '',
              isVip: tutor.isVip || false,
              isTop: tutor.isTop || false,
              createdAt: tutor.createdAt,
              date: tutor.createdAt,
              teachingModes: tutor.tutorProfile?.teachingMethods || [],
              regions: tutor.tutorProfile?.teachingAreas || []
            }));
            
          } catch (weightedError) {
            console.error('❌ 加權隨機選擇失敗:', weightedError.message);
            // 如果加權選擇失敗，回退到原來的邏輯
            query.$or = [
              { isVip: true },
              { isTop: true }
            ];
            console.log('🔄 回退到原來的查詢邏輯');
          }
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
                  typeof tutorMode === 'string' && typeof filterMode === 'string' && tutorMode.toLowerCase() === filterMode.toLowerCase()
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
        
        // 地區過濾
        if (regions) {
          const regionArray = Array.isArray(regions) ? regions : regions.split(',');
          console.log(`- 地區過濾條件: ${regionArray.join(', ')}`);
          
          filteredMockTutors = filteredMockTutors.filter(tutor => {
            // 檢查 tutor.regions 數組
            if (tutor.regions && Array.isArray(tutor.regions)) {
              const hasMatchingRegion = regionArray.some(filterRegion => 
                tutor.regions.some(tutorRegion => 
                  typeof tutorRegion === 'string' && typeof filterRegion === 'string' && tutorRegion.toLowerCase() === filterRegion.toLowerCase()
                )
              );
              if (hasMatchingRegion) {
                console.log(`- 導師 ${tutor.name} 匹配地區: ${tutor.regions.join(', ')}`);
                return true;
              }
            }
            
            return false;
          });
          
          console.log(`- 地區過濾後剩餘導師: ${filteredMockTutors.length} 個`);
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
          date: new Date().toISOString(),
          teachingModes: tutor.teachingModes || [],
          regions: tutor.regions || []
        }));
        
        console.log(`✅ 使用模擬數據，找到 ${mappedTutors.length} 個導師`);
        tutors = mappedTutors;
      }
    }
    
    // 如果 MongoDB 連接成功，從資料庫查詢
    if (mongoState === 1 && tutors.length === 0) {
      console.log('✅ 從資料庫查詢導師資料...');
      
      try {
        const User = require('../models/User');
        
        // 檢查是否為 featured 查詢
        console.log('🔍 檢查查詢類型:', { featured, search, subjects, regions, modes, category });
        
        // 如果已經在加權隨機選擇中處理了 featured 查詢，跳過這裡
        if (featured === 'true') {
          console.log('🔄 跳過原來的查詢邏輯，因為已經在加權隨機選擇中處理');
          console.log('⚠️ 但係 tutors 陣列係空，可能有問題！');
          console.log('🔍 檢查加權隨機選擇是否正確執行...');
          
          // 重新執行加權隨機選擇作為 fallback
          console.log('🔄 重新執行加權隨機選擇...');
          
          // 分別查詢不同類型的導師
          const vipTutors = await User.find({ 
            userType: 'tutor',
            isActive: true,
            status: 'active',
            isVip: true 
          }).select('name avatar tutorProfile rating isVip isTop createdAt tutorId');
          
          const topTutors = await User.find({ 
            userType: 'tutor',
            isActive: true,
            status: 'active',
            isTop: true,
            isVip: false  // 排除 VIP，避免重複
          }).select('name avatar tutorProfile rating isVip isTop createdAt tutorId');
          
          const regularTutors = await User.find({ 
            userType: 'tutor',
            isActive: true,
            status: 'active',
            isVip: false,
            isTop: false
          }).select('name avatar tutorProfile rating isVip isTop createdAt tutorId');
          
          console.log(`📊 Fallback 查詢結果:`);
          console.log(`- VIP 導師: ${vipTutors.length} 個`);
          console.log(`- 置頂導師: ${topTutors.length} 個`);
          console.log(`- 普通導師: ${regularTutors.length} 個`);
          
          // 詳細顯示每個導師嘅狀態
          if (vipTutors.length > 0) {
            console.log('👑 VIP 導師列表:');
            vipTutors.forEach(tutor => {
              console.log(`  - ${tutor.name} (isVip: ${tutor.isVip}, isTop: ${tutor.isTop}, status: ${tutor.status || 'N/A'})`);
            });
          }
          
          if (topTutors.length > 0) {
            console.log('⭐ 置頂導師列表:');
            topTutors.forEach(tutor => {
              console.log(`  - ${tutor.name} (isVip: ${tutor.isVip}, isTop: ${tutor.isTop}, status: ${tutor.status || 'N/A'})`);
            });
          }
          
          // 加權隨機選擇邏輯
          const targetCount = parseInt(limit) || 8;
          const selectedTutors = [];
          
          // 計算各類型導師的目標數量
          const vipCount = Math.ceil(targetCount * 0.5);  // 50% VIP
          const topCount = Math.ceil(targetCount * 0.3);  // 30% 置頂
          const regularCount = targetCount - vipCount - topCount;  // 剩餘給普通導師
          
          console.log(`🎲 Fallback 目標分配:`);
          console.log(`- VIP: ${vipCount} 個`);
          console.log(`- 置頂: ${topCount} 個`);
          console.log(`- 普通: ${regularCount} 個`);
          
          // 隨機選擇 VIP 導師
          if (vipTutors.length > 0) {
            const shuffledVip = vipTutors.sort(() => Math.random() - 0.5);
            const selectedVip = shuffledVip.slice(0, Math.min(vipCount, vipTutors.length));
            selectedTutors.push(...selectedVip);
            console.log(`✅ Fallback 選擇了 ${selectedVip.length} 個 VIP 導師`);
          }
          
          // 隨機選擇置頂導師
          if (topTutors.length > 0) {
            const shuffledTop = topTutors.sort(() => Math.random() - 0.5);
            const selectedTop = shuffledTop.slice(0, Math.min(topCount, topTutors.length));
            selectedTutors.push(...selectedTop);
            console.log(`✅ Fallback 選擇了 ${selectedTop.length} 個置頂導師`);
          }
          
          // 隨機選擇普通導師
          if (regularTutors.length > 0) {
            const shuffledRegular = regularTutors.sort(() => Math.random() - 0.5);
            const selectedRegular = shuffledRegular.slice(0, Math.min(regularCount, regularTutors.length));
            selectedTutors.push(...selectedRegular);
            console.log(`✅ Fallback 選擇了 ${selectedRegular.length} 個普通導師`);
          }
          
          // 如果還不夠目標數量，從剩餘導師中隨機補充
          if (selectedTutors.length < targetCount) {
            const remainingTutors = [...vipTutors, ...topTutors, ...regularTutors]
              .filter(tutor => !selectedTutors.some(selected => selected._id.toString() === tutor._id.toString()));
            
            if (remainingTutors.length > 0) {
              const shuffledRemaining = remainingTutors.sort(() => Math.random() - 0.5);
              const needed = targetCount - selectedTutors.length;
              const additional = shuffledRemaining.slice(0, Math.min(needed, remainingTutors.length));
              selectedTutors.push(...additional);
              console.log(`✅ Fallback 補充了 ${additional.length} 個導師`);
            }
          }
          
          // 最終隨機排序
          const finalShuffled = selectedTutors.sort(() => Math.random() - 0.5);
          
          console.log(`🎉 Fallback 最終選擇了 ${finalShuffled.length} 個導師`);
          
          // 格式化結果
          tutors = finalShuffled.map(tutor => ({
            _id: tutor._id,
            userId: tutor._id,
            tutorId: tutor.tutorId,
            name: tutor.name,
            subjects: tutor.tutorProfile?.subjects || [],
            education: tutor.tutorProfile?.educationLevel || '',
            experience: `${tutor.tutorProfile?.teachingExperienceYears || 0}年教學經驗`,
            rating: tutor.rating || 0,
            avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || '',
            isVip: tutor.isVip || false,
            isTop: tutor.isTop || false,
            createdAt: tutor.createdAt,
            date: tutor.createdAt,
            teachingModes: tutor.tutorProfile?.teachingMethods || [],
            regions: tutor.tutorProfile?.teachingAreas || []
          }));
          
        } else {
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
          
          // 科目過濾
          if (subjects) {
            const subjectArray = Array.isArray(subjects) ? subjects : subjects.split(',');
            query['tutorProfile.subjects'] = { $in: subjectArray };
          }
          
          // 分類過濾
          if (category && category !== 'unlimited') {
            console.log(`🎯 分類過濾: ${category}`);
            // 根據分類獲取對應的科目列表
            const categorySubjects = getCategorySubjects(category);
            if (categorySubjects && categorySubjects.length > 0) {
              console.log(`📚 分類對應的科目: ${categorySubjects.join(', ')}`);
              
              // 如果已經有科目過濾，則取交集
              if (subjects) {
                const subjectArray = Array.isArray(subjects) ? subjects : subjects.split(',');
                const intersection = subjectArray.filter(subject => 
                  categorySubjects.includes(subject)
                );
                if (intersection.length > 0) {
                  query['tutorProfile.subjects'] = { $in: intersection };
                  console.log(`🔍 科目交集: ${intersection.join(', ')}`);
                } else {
                  // 如果沒有交集，返回空結果
                  console.log('⚠️ 分類與科目沒有交集，返回空結果');
                  tutors = [];
                }
              } else {
                // 如果沒有科目過濾，直接使用分類的科目進行精確匹配
                query['tutorProfile.subjects'] = { $in: categorySubjects };
                console.log(`🔍 使用分類科目過濾: ${categorySubjects.join(', ')}`);
              }
            } else {
              console.log(`⚠️ 未找到分類 ${category} 對應的科目`);
            }
          } else if (category === 'unlimited') {
            console.log('🎯 分類設為 unlimited，跳過分類過濾');
          }
          
          console.log('🔍 查詢條件:', JSON.stringify(query, null, 2));
          
          // 執行查詢
          const dbTutors = await User.find(query)
            .select('name email avatar tutorProfile rating isVip isTop createdAt tutorId')
            .sort({ rating: -1, createdAt: -1 })
            .limit(parseInt(limit) || 50);
          
          console.log(`✅ 從資料庫找到 ${dbTutors.length} 位導師`);
          
          // 格式化資料庫結果
          tutors = dbTutors.map(tutor => ({
            _id: tutor._id,
            userId: tutor._id,
            tutorId: tutor.tutorId,
            name: tutor.name,
            subjects: tutor.tutorProfile?.subjects || [],
            education: tutor.tutorProfile?.educationLevel || '',
            experience: `${tutor.tutorProfile?.teachingExperienceYears || 0}年教學經驗`,
            rating: tutor.rating || 0,
            avatar: tutor.avatar || tutor.tutorProfile?.avatarUrl || '',
            isVip: tutor.isVip || false,
            isTop: tutor.isTop || false,
            createdAt: tutor.createdAt,
            date: tutor.createdAt,
            teachingModes: tutor.tutorProfile?.teachingMethods || [],
            regions: tutor.tutorProfile?.teachingAreas || []
          }));
        }
        
      } catch (dbError) {
        console.error('❌ 資料庫查詢失敗:', dbError.message);
        source = 'mock';
        mongoState = 0;
        
        // 如果資料庫查詢失敗，使用 mock 資料
        const mockTutors = require('../data/tutors');
        tutors = mockTutors.slice(0, parseInt(limit) || 15).map(tutor => ({
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
          date: new Date().toISOString(),
          teachingModes: tutor.teachingModes || [],
          regions: tutor.regions || []
        }));
      }
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
        regions: tutor.regions
      };
    });

    console.log(`📤 返回 ${formattedTutors.length} 個導師數據`);
    res.json({ 
      success: true,
      data: { tutors: formattedTutors },
      source: source,
      mongoState: mongoState,
      mongoStateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState] || 'unknown'
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
      qualifications: user.tutorProfile?.documents?.map(doc => doc.type) || [],
      hourlyRate: user.tutorProfile?.sessionRate || 0,
      availableTime: user.tutorProfile?.availableTime?.map(time => `${time.day} ${time.time}`.trim()) || [],
      examResults: user.tutorProfile?.examResults?.map(exam => `${exam.subject} ${exam.grade}`) || [],
      courseFeatures: user.tutorProfile?.courseFeatures || '',
      rating: user.rating || 0
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
      examResults: tutor.tutorProfile?.examResults?.map(exam => `${exam.subject} ${exam.grade}`) || [],
      courseFeatures: tutor.tutorProfile?.courseFeatures || '',
      rating: tutor.rating || 0,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt
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
    
    // 確保 subjects 有值，避免驗證錯誤
    if (updateData.subjects !== undefined) {
      updateObject['tutorProfile.subjects'] = Array.isArray(updateData.subjects) && updateData.subjects.length > 0 
        ? updateData.subjects 
        : ['primary-chinese']; // 默認值
    }
    
    if (updateData.teachingAreas !== undefined) updateObject['tutorProfile.teachingAreas'] = updateData.teachingAreas;
    if (updateData.teachingMethods !== undefined) updateObject['tutorProfile.teachingMethods'] = updateData.teachingMethods;
    
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
  getTutorByTutorId,
  getTutors,
  getTutorDetail,
  getTutorProfile,
  updateTutorProfile,
  testTutors
}; 