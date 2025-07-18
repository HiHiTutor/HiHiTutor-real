const mongoose = require('mongoose');
const User = require('../models/User');

// 連接到 MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

const fixKarenSubjects = async () => {
  try {
    console.log('🔍 查找 Karen Yim 的資料...');
    
    // 查找 Karen Yim
    const karen = await User.findOne({ 
      $or: [
        { name: 'Karen Yim' },
        { tutorId: 'TU0001' },
        { userId: '1000150' }
      ]
    });

    if (!karen) {
      console.log('❌ 找不到 Karen Yim');
      return;
    }

    console.log('✅ 找到 Karen Yim:', {
      name: karen.name,
      tutorId: karen.tutorId,
      userId: karen.userId,
      currentSubjects: karen.tutorProfile?.subjects || []
    });

    // 添加一些默認科目
    const defaultSubjects = [
      'primary-chinese',
      'primary-english', 
      'primary-math',
      'secondary-chinese',
      'secondary-english',
      'secondary-math'
    ];

    console.log('📝 準備添加科目:', defaultSubjects);

    // 更新科目
    const updatedKaren = await User.findByIdAndUpdate(
      karen._id,
      {
        $set: {
          'tutorProfile.subjects': defaultSubjects
        }
      },
      { new: true }
    );

    console.log('✅ 科目更新成功:', {
      name: updatedKaren.name,
      newSubjects: updatedKaren.tutorProfile.subjects
    });

    console.log('🎉 Karen Yim 的科目已修復！');

  } catch (error) {
    console.error('❌ 修復科目時出錯:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 連接已關閉');
  }
};

// 執行腳本
if (require.main === module) {
  connectDB().then(() => {
    fixKarenSubjects();
  });
}

module.exports = { fixKarenSubjects }; 