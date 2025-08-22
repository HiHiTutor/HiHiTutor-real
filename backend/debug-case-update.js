const mongoose = require('mongoose');
require('dotenv').config();

// 连接到数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const StudentCase = require('./models/StudentCase');
const TutorCase = require('./models/TutorCase');

async function debugCaseUpdate() {
  try {
    console.log('🔍 调试case更新问题...\n');

    const caseId = 'S1755856900740';
    
    // 1. 检查StudentCase集合
    console.log('📋 在StudentCase集合中查找...');
    const studentCase = await StudentCase.findOne({ id: caseId });
    if (studentCase) {
      console.log('✅ 在StudentCase中找到记录:');
      console.log(`   _id: ${studentCase._id}`);
      console.log(`   id: ${studentCase.id}`);
      console.log(`   title: ${studentCase.title}`);
      console.log(`   posterId: ${studentCase.posterId || '未设置'}`);
      console.log(`   updatedAt: ${studentCase.updatedAt}`);
    } else {
      console.log('❌ 在StudentCase中未找到记录');
    }

    // 2. 检查TutorCase集合
    console.log('\n📋 在TutorCase集合中查找...');
    const tutorCase = await TutorCase.findOne({ id: caseId });
    if (tutorCase) {
      console.log('✅ 在TutorCase中找到记录:');
      console.log(`   _id: ${tutorCase._id}`);
      console.log(`   id: ${tutorCase.id}`);
      console.log(`   title: ${tutorCase.title}`);
      console.log(`   posterId: ${tutorCase.posterId || '未设置'}`);
      console.log(`   updatedAt: ${tutorCase.updatedAt}`);
    } else {
      console.log('❌ 在TutorCase中未找到记录');
    }

    // 3. 尝试使用_id查找
    if (studentCase) {
      console.log('\n🔍 使用_id查找StudentCase...');
      const caseById = await StudentCase.findById(studentCase._id);
      if (caseById) {
        console.log('✅ 使用_id成功找到记录');
      } else {
        console.log('❌ 使用_id未找到记录');
      }
    }

    // 4. 检查所有可能的查询条件
    console.log('\n🔍 检查所有可能的查询条件...');
    
    // 使用id字段
    const byId = await StudentCase.findOne({ id: caseId });
    console.log(`   使用 id: '${caseId}' -> ${byId ? '找到' : '未找到'}`);
    
    // 使用_id字段（如果前端发送的是ObjectId字符串）
    try {
      const byObjectId = await StudentCase.findById(caseId);
      console.log(`   使用 _id: '${caseId}' -> ${byObjectId ? '找到' : '未找到'}`);
    } catch (e) {
      console.log(`   使用 _id: '${caseId}' -> 无效的ObjectId格式`);
    }

    // 5. 尝试更新操作
    if (studentCase) {
      console.log('\n🧪 测试更新操作...');
      
      const updateData = {
        posterId: '1000996',
        updatedAt: new Date()
      };
      
      console.log('   更新数据:', updateData);
      
      // 使用id字段更新
      const updateById = await StudentCase.findOneAndUpdate(
        { id: caseId },
        { $set: updateData },
        { new: true }
      );
      
      if (updateById) {
        console.log('✅ 使用id字段更新成功');
        console.log(`   新的posterId: ${updateById.posterId}`);
        console.log(`   新的updatedAt: ${updateById.updatedAt}`);
      } else {
        console.log('❌ 使用id字段更新失败');
      }
    }

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugCaseUpdate();
