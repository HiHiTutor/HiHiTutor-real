// 直接修復數據庫中的用戶數據
// 這個腳本會直接修改 MongoDB 中的數據

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://hihitutor:HiHiTutor2024@hihitutor.8qjqj.mongodb.net/hihitutor?retryWrites=true&w=majority';

async function fixUserData() {
  let client;
  
  try {
    console.log('🔗 連接到 MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 連接成功');

    const db = client.db('hihitutor');
    const users = db.collection('users');
    
    // 查找用戶
    const user = await users.findOne({ userId: '1001000' });
    if (!user) {
      console.log('❌ 用戶不存在: 1001000');
      return;
    }
    
    console.log('🔍 找到用戶:', user.name);
    console.log('📊 當前 publicCertificates 數量:', user.tutorProfile?.publicCertificates?.length || 0);
    console.log('📊 當前 educationCert 數量:', user.documents?.educationCert?.length || 0);
    
    // 獲取 publicCertificates 的完整文件列表
    const publicCerts = user.tutorProfile?.publicCertificates || [];
    
    if (publicCerts.length === 4) {
      console.log('🔧 修復 educationCert 數據...');
      
      // 更新 educationCert 為與 publicCertificates 相同的文件列表
      const result = await users.updateOne(
        { userId: '1001000' },
        {
          $set: {
            'documents.educationCert': publicCerts
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ 數據修復成功!');
        console.log('📊 修復後 educationCert 數量:', publicCerts.length);
        
        // 驗證修復結果
        const updatedUser = await users.findOne({ userId: '1001000' });
        console.log('🔍 驗證修復結果:');
        console.log('publicCertificates:', updatedUser.tutorProfile.publicCertificates);
        console.log('educationCert:', updatedUser.documents.educationCert);
      } else {
        console.log('⚠️ 沒有數據被修改');
      }
    } else {
      console.log('ℹ️ publicCertificates 不是 4 個文件，無需修復');
    }
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 數據庫連接已關閉');
    }
    process.exit(0);
  }
}

fixUserData();
