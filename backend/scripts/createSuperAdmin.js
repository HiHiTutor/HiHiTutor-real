const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createSuperAdmin() {
  try {
    // 連接到數據庫
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hihitutor');
    console.log('✅ Connected to MongoDB');

    // 檢查是否已經存在超級管理員
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('⚠️ Super Admin already exists:', {
        name: existingSuperAdmin.name,
        email: existingSuperAdmin.email,
        role: existingSuperAdmin.role,
        userType: existingSuperAdmin.userType
      });
      return;
    }

    // 創建超級管理員用戶
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    
    const superAdmin = new User({
      name: 'Super Administrator',
      email: 'superadmin@hihitutor.com',
      phone: '99999999',
      password: hashedPassword,
      userType: 'super_admin',
      role: 'super_admin',
      status: 'active',
      isActive: true
    });

    await superAdmin.save();
    
    console.log('✅ Super Admin created successfully:', {
      name: superAdmin.name,
      email: superAdmin.email,
      phone: superAdmin.phone,
      role: superAdmin.role,
      userType: superAdmin.userType,
      status: superAdmin.status
    });

    console.log('🔑 Default credentials:');
    console.log('   Email: superadmin@hihitutor.com');
    console.log('   Phone: 99999999');
    console.log('   Password: superadmin123');
    console.log('⚠️ Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  createSuperAdmin();
}

module.exports = createSuperAdmin; 