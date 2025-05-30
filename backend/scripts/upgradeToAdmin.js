const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const upgradeToAdmin = async (phone) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      console.log('❌ User not found with phone:', phone);
      return;
    }

    console.log('👤 Found user:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      currentUserType: user.userType,
      currentRole: user.role
    });

    // Upgrade user to admin
    user.userType = 'admin';
    user.role = 'admin';
    user.status = 'active';
    await user.save();

    console.log('✅ Successfully upgraded user to admin');
    console.log('📱 Phone:', user.phone);
    console.log('👑 New role:', user.role);
    console.log('🔰 New userType:', user.userType);

  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// 運行腳本
upgradeToAdmin('60761408'); 