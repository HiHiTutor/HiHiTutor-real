// 檢查文件一致性的腳本
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor';

async function checkFileConsistency() {
  try {
    console.log('🔗 連接到 MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 連接成功');

    const User = require('./models/User');
    
    // 查找用戶
    const user = await User.findOne({ userId: '1001000' });
    if (!user) {
      console.log('❌ 用戶不存在: 1001000');
      return;
    }
    
    console.log('🔍 用戶:', user.name);
    console.log('');
    
    // 檢查 publicCertificates
    const publicCerts = user.tutorProfile?.publicCertificates || [];
    console.log('📊 publicCertificates (前台顯示):');
    console.log('數量:', publicCerts.length);
    publicCerts.forEach((url, index) => {
      const filename = url.split('/').pop();
      console.log(`  ${index + 1}. ${filename}`);
    });
    console.log('');
    
    // 檢查 educationCert
    const educationCerts = user.documents?.educationCert || [];
    console.log('📊 educationCert (後台管理):');
    console.log('數量:', educationCerts.length);
    educationCerts.forEach((url, index) => {
      const filename = url.split('/').pop();
      console.log(`  ${index + 1}. ${filename}`);
    });
    console.log('');
    
    // 比較兩個字段
    console.log('🔍 比較分析:');
    console.log('publicCertificates 數量:', publicCerts.length);
    console.log('educationCert 數量:', educationCerts.length);
    
    if (publicCerts.length !== educationCerts.length) {
      console.log('❌ 數量不一致！');
      
      // 找出缺少的文件
      const publicFilenames = publicCerts.map(url => url.split('/').pop());
      const educationFilenames = educationCerts.map(url => url.split('/').pop());
      
      const missingInEducation = publicFilenames.filter(filename => 
        !educationFilenames.includes(filename)
      );
      
      if (missingInEducation.length > 0) {
        console.log('缺少的文件 (在 educationCert 中):');
        missingInEducation.forEach(filename => {
          console.log(`  - ${filename}`);
        });
      }
      
      const missingInPublic = educationFilenames.filter(filename => 
        !publicFilenames.includes(filename)
      );
      
      if (missingInPublic.length > 0) {
        console.log('缺少的文件 (在 publicCertificates 中):');
        missingInPublic.forEach(filename => {
          console.log(`  - ${filename}`);
        });
      }
      
      console.log('');
      console.log('🔧 建議修復方案:');
      console.log('1. 將 publicCertificates 的完整文件列表同步到 educationCert');
      console.log('2. 確保兩個字段包含相同的文件');
      
    } else {
      console.log('✅ 數量一致');
      
      // 檢查文件是否完全相同
      const publicFilenames = publicCerts.map(url => url.split('/').pop()).sort();
      const educationFilenames = educationCerts.map(url => url.split('/').pop()).sort();
      
      const isIdentical = JSON.stringify(publicFilenames) === JSON.stringify(educationFilenames);
      
      if (isIdentical) {
        console.log('✅ 文件完全一致');
      } else {
        console.log('❌ 文件內容不一致');
        console.log('publicCertificates:', publicFilenames);
        console.log('educationCert:', educationFilenames);
      }
    }
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 數據庫連接已關閉');
    process.exit(0);
  }
}

checkFileConsistency();
