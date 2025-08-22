const mongoose = require('mongoose');
const TutorCase = require('./models/TutorCase');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkCases() {
  try {
    console.log('🔍 檢查最新的導師案例...\n');
    
    const cases = await TutorCase.find().sort({createdAt: -1}).limit(5);
    console.log(`📊 找到 ${cases.length} 個導師案例:\n`);
    
    cases.forEach((case_, index) => {
      console.log(`${index + 1}. ID: ${case_.id || 'N/A'}`);
      console.log(`   Title: ${case_.title || 'N/A'}`);
      console.log(`   Status: ${case_.status || 'N/A'}`);
      console.log(`   Created: ${case_.createdAt || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkCases();
