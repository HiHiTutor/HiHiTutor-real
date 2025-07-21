#!/usr/bin/env node

/**
 * 運行用戶ID標準化腳本
 * 使用方法: node scripts/runStandardizeUserIds.js
 */

const path = require('path');
const { standardizeUserIds } = require('../backend/scripts/standardizeUserIds');

console.log('🚀 開始執行用戶ID標準化...');
console.log('📋 標準化規則:');
console.log('   - UserID: 7位數字格式 (1000001, 1000002, ...)');
console.log('   - TutorID: TU + 4位數字格式 (TU0001, TU0002, ...)');
console.log('');

// 檢查環境變數
if (!process.env.MONGODB_URI) {
  console.error('❌ 錯誤: MONGODB_URI 環境變數未設定');
  console.log('請設定 MONGODB_URI 環境變數後再運行此腳本');
  process.exit(1);
}

// 執行標準化
standardizeUserIds()
  .then(() => {
    console.log('\n🎉 用戶ID標準化完成！');
    console.log('✅ 所有用戶現在都使用統一的ID格式');
  })
  .catch((error) => {
    console.error('\n❌ 標準化失敗:', error.message);
    process.exit(1);
  }); 