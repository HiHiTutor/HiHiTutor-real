const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userType: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin@hihitutor.com',
      phone: '69999999',
      password: hashedPassword,
      userType: 'admin',
      role: 'admin',
      status: 'active'
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email:', admin.email);
    console.log('📱 Phone:', admin.phone);
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

createAdmin(); 