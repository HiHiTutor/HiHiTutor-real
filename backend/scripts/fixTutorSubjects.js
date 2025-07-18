const mongoose = require('mongoose');
const User = require('../models/User');

// 科目映射表：中文名稱 -> 標準化代碼
const SUBJECT_MAPPING = {
  // 幼兒教育
  '幼兒中文': 'early-childhood-chinese',
  '幼兒英文': 'early-childhood-english',
  '幼兒數學': 'early-childhood-math',
  '拼音': 'early-childhood-phonics',
  '注音': 'early-childhood-phonics',
  '邏輯思維': 'early-childhood-logic',
  '面試技巧': 'early-childhood-interview',
  '幼稚園功課': 'early-childhood-homework',
  
  // 小學教育
  '小學中文': 'primary-chinese',
  '小學英文': 'primary-english',
  '小學數學': 'primary-math',
  '常識': 'primary-general',
  '普通話': 'primary-mandarin',
  'STEM': 'primary-stem',
  '全科補習': 'primary-all',
  
  // 中學教育
  '中學中文': 'secondary-chinese',
  '中學英文': 'secondary-english',
  '中學數學': 'secondary-math',
  '通識': 'secondary-ls',
  '物理': 'secondary-physics',
  '化學': 'secondary-chemistry',
  '生物': 'secondary-biology',
  '經濟': 'secondary-economics',
  '地理': 'secondary-geography',
  '歷史': 'secondary-history',
  '中國歷史': 'secondary-chinese-history',
  '企會財': 'secondary-bafs',
  '資訊科技': 'secondary-ict',
  '綜合科學': 'secondary-integrated-science',
  'DSE': 'secondary-dse',
  
  // 通用科目名稱
  '中文': 'secondary-chinese',
  '英文': 'secondary-english',
  '數學': 'secondary-math',
  
  // 興趣班
  '繪畫': 'art',
  '音樂': 'music',
  '鋼琴': 'music',
  '跳舞': 'dance',
  '舞蹈': 'dance',
  '戲劇': 'drama',
  '編程': 'programming',
  '外語': 'foreign-language',
  '魔術': 'magic-chess',
  '棋藝': 'magic-chess',
  '攝影': 'photography',
  
  // 大學課程
  '大學通識': 'uni-liberal',
  '大學數學': 'uni-math',
  '統計': 'uni-math',
  '經濟學': 'uni-economics',
  '資訊科技': 'uni-it',
  '商科': 'uni-business',
  '會計': 'uni-business',
  '管理': 'uni-business',
  '工程': 'uni-engineering',
  '論文': 'uni-thesis',
  
  // 成人教育
  '商務英文': 'business-english',
  '英語會話': 'conversation',
  '廣東話': 'chinese-language',
  '第二語言': 'second-language',
  '電腦技能': 'computer-skills',
  'Excel': 'computer-skills',
  'Photoshop': 'computer-skills',
  '考試準備': 'exam-prep',
  'IELTS': 'exam-prep',
  'TOEFL': 'exam-prep',
  'JLPT': 'exam-prep'
};

// 連接數據庫
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// 修復導師科目格式
const fixTutorSubjects = async () => {
  try {
    console.log('🔍 開始修復導師科目格式...');
    
    // 獲取所有導師
    const tutors = await User.find({ 
      userType: 'tutor',
      'tutorProfile.subjects': { $exists: true }
    });
    
    console.log(`📊 找到 ${tutors.length} 位導師需要檢查`);
    
    let updatedCount = 0;
    
    for (const tutor of tutors) {
      const originalSubjects = tutor.tutorProfile.subjects || [];
      const updatedSubjects = [];
      let hasChanges = false;
      
      console.log(`\n👤 檢查導師: ${tutor.name} (${tutor.tutorId})`);
      console.log(`   原始科目: ${originalSubjects.join(', ')}`);
      
      for (const subject of originalSubjects) {
        // 檢查是否已經是標準化代碼
        if (subject.includes('-') && (subject.startsWith('primary-') || subject.startsWith('secondary-') || subject.startsWith('early-childhood-') || subject.startsWith('uni-') || subject.startsWith('adult-'))) {
          updatedSubjects.push(subject);
          console.log(`   ✅ 保持標準化代碼: ${subject}`);
        } else {
          // 嘗試映射中文名稱
          const mappedSubject = SUBJECT_MAPPING[subject];
          if (mappedSubject) {
            updatedSubjects.push(mappedSubject);
            console.log(`   🔄 映射: ${subject} -> ${mappedSubject}`);
            hasChanges = true;
          } else {
            // 如果找不到映射，保持原樣
            updatedSubjects.push(subject);
            console.log(`   ⚠️  無法映射: ${subject} (保持原樣)`);
          }
        }
      }
      
      if (hasChanges) {
        // 更新數據庫
        await User.findByIdAndUpdate(tutor._id, {
          'tutorProfile.subjects': updatedSubjects
        });
        console.log(`   ✅ 已更新科目: ${updatedSubjects.join(', ')}`);
        updatedCount++;
      } else {
        console.log(`   ℹ️  無需更新`);
      }
    }
    
    console.log(`\n🎉 修復完成！`);
    console.log(`📈 總共更新了 ${updatedCount} 位導師的科目格式`);
    
  } catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error);
  }
};

// 主函數
const main = async () => {
  await connectDB();
  await fixTutorSubjects();
  await mongoose.disconnect();
  console.log('✅ 數據庫連接已關閉');
};

// 執行腳本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixTutorSubjects }; 