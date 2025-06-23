const mongoose = require('mongoose');
require('dotenv').config();

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function testTutorUpdate() {
  try {
    console.log('🔍 檢查導師數據...');
    
    // 查找導師
    const tutor = await User.findOne({ userId: '1000002' });
    
    if (!tutor) {
      console.log('❌ 找不到導師 1000002');
      return;
    }
    
    console.log('✅ 找到導師:', tutor.name);
    console.log('📊 導師資料:');
    console.log('- userId:', tutor.userId);
    console.log('- name:', tutor.name);
    console.log('- avatar:', tutor.avatar);
    console.log('- tutorProfile:', JSON.stringify(tutor.tutorProfile, null, 2));
    
    // 檢查 tutorProfile 是否存在
    if (!tutor.tutorProfile) {
      console.log('⚠️ tutorProfile 不存在，創建中...');
      tutor.tutorProfile = {};
    }
    
    // 更新一些測試數據
    const updateData = {
      name: '測試導師',
      'tutorProfile.gender': 'male',
      'tutorProfile.teachingExperienceYears': 5,
      'tutorProfile.educationLevel': '大學',
      'tutorProfile.subjects': ['數學', '物理'],
      'tutorProfile.introduction': '我是一名經驗豐富的導師',
      'tutorProfile.teachingAreas': ['港島', '九龍'],
      'tutorProfile.teachingMethods': ['face-to-face', 'online'],
      'tutorProfile.sessionRate': 300,
      'tutorProfile.availableTime': ['星期一 上午', '星期二 下午'],
      'tutorProfile.examResults': 'DSE 5**',
      'tutorProfile.courseFeatures': '專注於考試技巧',
      'tutorProfile.documents': [
        { type: '教師證書', url: '' },
        { type: '學位證書', url: '' }
      ]
    };
    
    console.log('📝 更新數據:', updateData);
    
    const updatedTutor = await User.findByIdAndUpdate(
      tutor._id,
      { $set: updateData },
      { new: true }
    );
    
    console.log('✅ 更新成功');
    console.log('📊 更新後的資料:');
    console.log('- name:', updatedTutor.name);
    console.log('- tutorProfile:', JSON.stringify(updatedTutor.tutorProfile, null, 2));
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    mongoose.connection.close();
  }
}

testTutorUpdate(); 