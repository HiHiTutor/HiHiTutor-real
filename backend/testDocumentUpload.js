const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testDocumentUpload() {
  try {
    console.log('🔗 連接到數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功');

    // 找到一個導師用戶
    const tutor = await User.findOne({ userType: 'tutor' });
    if (!tutor) {
      console.log('❌ 找不到導師用戶');
      return;
    }

    console.log('📋 找到導師:', {
      id: tutor._id,
      name: tutor.name,
      email: tutor.email
    });

    // 模擬更新導師資料，包含文件URL
    const updateData = {
      documents: {
        idCard: 'https://example-bucket.s3.amazonaws.com/uploads/user-docs/123/1746199624487-id-card.pdf',
        educationCert: 'https://example-bucket.s3.amazonaws.com/uploads/user-docs/123/1746199624495-education-cert.pdf'
      }
    };

    console.log('📝 模擬更新數據:', updateData);

    // 更新導師資料
    const updatedTutor = await User.findByIdAndUpdate(
      tutor._id,
      { 
        $set: {
          'documents.idCard': updateData.documents.idCard,
          'documents.educationCert': updateData.documents.educationCert,
          profileStatus: 'pending',
          remarks: ''
        }
      },
      { new: true }
    ).select('-password');

    console.log('✅ 更新成功');
    console.log('📋 更新後的資料:', {
      id: updatedTutor._id,
      name: updatedTutor.name,
      documents: updatedTutor.documents,
      profileStatus: updatedTutor.profileStatus
    });

    // 檢查待審核的導師
    const pendingTutors = await User.find({ 
      userType: 'tutor', 
      profileStatus: 'pending' 
    });

    console.log('\n📊 待審核導師數量:', pendingTutors.length);
    pendingTutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} - 文件:`, {
        idCard: tutor.documents?.idCard ? '已上傳' : '未上傳',
        educationCert: tutor.documents?.educationCert ? '已上傳' : '未上傳'
      });
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

testDocumentUpload(); 