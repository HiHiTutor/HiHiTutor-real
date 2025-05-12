require('dotenv').config();
const mongoose = require('mongoose');
const StudentCase = require('../models/StudentCase');
const TutorCase = require('../models/TutorCase');

// 學生案例假資料
const studentCases = [
  {
    id: 1,
    subject: '數學',
    location: '台北市',
    budget: '800',
    mode: '面對面',
    requirement: '需要補習高中數學',
    category: '高中',
    subCategory: '數學',
    region: '台北市',
    priceRange: '800-1000',
    featured: true,
    createdAt: new Date('2024-03-20')
  },
  {
    id: 2,
    subject: '英文',
    location: '新北市',
    budget: '1000',
    mode: '線上',
    requirement: '需要補習國中英文',
    category: '國中',
    subCategory: '英文',
    region: '新北市',
    priceRange: '1000-1200',
    featured: true,
    createdAt: new Date('2024-03-19')
  }
];

// 導師案例假資料
const tutorCases = [
  {
    id: 1,
    subject: '數學',
    location: '台北市',
    budget: '800',
    mode: '面對面',
    experience: '3年以上',
    featured: true,
    category: '高中',
    subCategory: '數學',
    region: '台北市',
    priceRange: '800-1000',
    createdAt: new Date('2024-03-20')
  },
  {
    id: 2,
    subject: '英文',
    location: '新北市',
    budget: '1000',
    mode: '線上',
    experience: '2年以上',
    featured: true,
    category: '國中',
    subCategory: '英文',
    region: '新北市',
    priceRange: '1000-1200',
    createdAt: new Date('2024-03-19')
  }
];

async function seedData() {
  try {
    // 連接 MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 清空現有資料
    await StudentCase.deleteMany({});
    await TutorCase.deleteMany({});
    console.log('Cleared existing data');

    // 插入新資料
    await StudentCase.insertMany(studentCases);
    await TutorCase.insertMany(tutorCases);
    console.log('Seeded new data');

    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// 執行腳本
seedData(); 