require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkEnvironment = async () => {
  try {
    // Check environment variables
    console.log('Environment Variables Check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    // Check JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || process.env.REACT_APP_JWT_SECRET;
    console.log('- JWT_SECRET exists:', !!jwtSecret);
    console.log('- JWT_SECRET source:', process.env.JWT_SECRET ? 'JWT_SECRET' : (process.env.REACT_APP_JWT_SECRET ? 'REACT_APP_JWT_SECRET' : 'Not found'));
    console.log('- JWT_SECRET length:', jwtSecret?.length);
    
    // Check MongoDB URI
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    if (process.env.MONGODB_URI) {
      console.log('- MONGODB_URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
    }
    
    if (!jwtSecret || !process.env.MONGODB_URI) {
      console.error('❌ Missing required environment variables');
      if (!jwtSecret) console.error('   - JWT_SECRET is missing');
      if (!process.env.MONGODB_URI) console.error('   - MONGODB_URI is missing');
      process.exit(1);
    }

    // Test database connection
    console.log('\nTesting MongoDB Connection...');
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Successfully connected to MongoDB');
      console.log('- Connection state:', mongoose.connection.readyState);
      console.log('- Database name:', mongoose.connection.name);
    } catch (dbError) {
      console.error('❌ MongoDB connection error:', {
        message: dbError.message,
        code: dbError.code,
        name: dbError.name
      });
      throw dbError;
    }

    // Check admin user
    const adminUser = await User.findOne({ phone: '60761408' });
    if (adminUser) {
      console.log('\nAdmin User Check:');
      console.log('- Found user:', adminUser.name);
      console.log('- Email:', adminUser.email);
      console.log('- Phone:', adminUser.phone);
      console.log('- User Type:', adminUser.userType);
      console.log('- Role:', adminUser.role);
      console.log('- Status:', adminUser.status);
      console.log('- Password exists:', !!adminUser.password);
      console.log('- Password length:', adminUser.password?.length);
      
      // Test password verification
      const testPassword = 'admin123';
      const isPasswordValid = await adminUser.comparePassword(testPassword);
      console.log('- Password verification test:', isPasswordValid ? '✅ Success' : '❌ Failed');
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

checkEnvironment(); 