const mongoose = require('mongoose');

// 連接數據庫
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

const fixTutorIds = async () => {
  try {
    console.log('🔧 開始修正 tutorId 格式...');
    
    // 查找所有導師
    const tutors = await User.find({ userType: 'tutor' });
    console.log(`📊 總共有 ${tutors.length} 個導師`);
    
    // 找出需要修正的導師（tutorId 以 TUTOR 開頭）
    const tutorsToFix = tutors.filter(tutor => 
      tutor.tutorId && tutor.tutorId.startsWith('TUTOR')
    );
    
    console.log(`🔍 需要修正的導師數量: ${tutorsToFix.length}`);
    
    if (tutorsToFix.length === 0) {
      console.log('✅ 沒有需要修正的 tutorId');
      return;
    }
    
    // 顯示需要修正的導師
    console.log('\n📋 需要修正的導師:');
    tutorsToFix.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} (${tutor.email})`);
      console.log(`   - 舊 tutorId: ${tutor.tutorId}`);
    });
    
    // 找出最大的現有 tutorId 數字
    const existingTutorIds = tutors
      .filter(t => t.tutorId && t.tutorId.startsWith('T') && !t.tutorId.startsWith('TUTOR'))
      .map(t => {
        const num = parseInt(t.tutorId.substring(1));
        return isNaN(num) ? 0 : num;
      });
    
    const maxTutorIdNum = existingTutorIds.length > 0 ? Math.max(...existingTutorIds) : 0;
    console.log(`📊 現有最大 tutorId 數字: ${maxTutorIdNum}`);
    
    // 修正 tutorId
    let nextTutorIdNum = maxTutorIdNum + 1;
    
    for (const tutor of tutorsToFix) {
      const newTutorId = `T${String(nextTutorIdNum).padStart(5, '0')}`;
      
      console.log(`🔄 修正 ${tutor.name}: ${tutor.tutorId} → ${newTutorId}`);
      
      await User.findByIdAndUpdate(tutor._id, {
        tutorId: newTutorId
      });
      
      nextTutorIdNum++;
    }
    
    console.log(`✅ 成功修正 ${tutorsToFix.length} 個導師的 tutorId`);
    
    // 驗證修正結果
    console.log('\n🔍 驗證修正結果...');
    const updatedTutors = await User.find({ userType: 'tutor' })
      .select('name tutorId email')
      .sort({ tutorId: 1 });
    
    console.log('\n📋 修正後的導師列表 (前20個):');
    updatedTutors.slice(0, 20).forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name}`);
      console.log(`   - tutorId: ${tutor.tutorId}`);
      console.log(`   - email: ${tutor.email}`);
      console.log('');
    });
    
    console.log('🎉 tutorId 修正完成！');
    
  } catch (error) {
    console.error('❌ 修正時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
};

fixTutorIds(); 