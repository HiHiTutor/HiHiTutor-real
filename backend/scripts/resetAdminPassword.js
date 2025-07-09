const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async (phone, newPassword) => {
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

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password reset successful for user:', {
      name: user.name,
      email: user.email,
      phone: user.phone
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// 運行腳本 - 設置一個簡單的密碼用於測試
resetPassword('60761408', 'admin123'); 