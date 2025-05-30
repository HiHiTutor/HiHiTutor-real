const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async (phone) => {
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

    console.log('👤 User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      role: user.role,
      status: user.status,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Check if user has correct admin settings
    const isCorrect = 
      user.userType === 'admin' && 
      user.role === 'admin' && 
      user.status === 'active';

    if (!isCorrect) {
      console.log('⚠️ User does not have correct admin settings');
      console.log('Updating user settings...');

      user.userType = 'admin';
      user.role = 'admin';
      user.status = 'active';
      await user.save();

      console.log('✅ User settings updated successfully');
    } else {
      console.log('✅ User has correct admin settings');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// 運行腳本
checkAdmin('60761408'); 