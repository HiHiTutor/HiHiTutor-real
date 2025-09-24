#!/usr/bin/env node

/**
 * 地區配置同步腳本
 * 從 shared/regionOptions.js 同步配置到所有前後台文件
 * 
 * 使用方法：
 * node scripts/sync-region-config.js
 */

const fs = require('fs');
const path = require('path');

// 導入統一配置
const { REGION_OPTIONS } = require('../shared/regionOptions');

console.log('🔄 開始同步地區配置...');

// 生成 TypeScript 格式
function generateTypeScript() {
  return `// 從統一配置文件導入地區分類
// 注意：此文件現在從 shared/regionOptions.js 自動生成
// 如需修改地區配置，請編輯 shared/regionOptions.js

export interface RegionOption {
  value: string;
  label: string;
  regions: { value: string; label: string }[];
}

export const REGION_OPTIONS = ${JSON.stringify(REGION_OPTIONS, null, 2)};

export default REGION_OPTIONS;`;
}

// 生成後端 JavaScript 格式
function generateBackendJavaScript() {
  return `// 從統一配置文件導入地區分類
const { REGION_OPTIONS } = require('../../shared/regionOptions');

module.exports = REGION_OPTIONS;`;
}

// 生成管理後台內嵌格式（用於 CreateUser.tsx 和 CreateCase.tsx）
function generateAdminInlineFormat() {
  return `// 從統一配置文件導入地區分類
// 注意：此數據從 shared/regionOptions.js 自動生成
// 如需修改地區配置，請編輯 shared/regionOptions.js

const fallbackRegions = ${JSON.stringify(REGION_OPTIONS, null, 2)};`;
}

// 同步文件列表
const syncFiles = [
  {
    path: 'user-frontend/src/constants/regionOptions.ts',
    content: generateTypeScript()
  },
  {
    path: 'backend/constants/regionOptions.js',
    content: generateBackendJavaScript()
  }
];

// 執行同步
syncFiles.forEach(file => {
  try {
    const fullPath = path.resolve(file.path);
    const dir = path.dirname(fullPath);
    
    // 確保目錄存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 寫入文件
    fs.writeFileSync(fullPath, file.content, 'utf8');
    console.log(`✅ 已同步: ${file.path}`);
  } catch (error) {
    console.error(`❌ 同步失敗: ${file.path}`, error.message);
  }
});

// 生成管理後台內嵌數據文件（供手動複製）
const adminInlineContent = generateAdminInlineFormat();
const adminInlinePath = path.resolve('shared/admin-region-data.js');
fs.writeFileSync(adminInlinePath, adminInlineContent, 'utf8');
console.log(`✅ 已生成管理後台數據: ${adminInlinePath}`);

console.log('🎉 地區配置同步完成！');
console.log('📝 如需修改地區配置，請編輯 shared/regionOptions.js 然後重新運行此腳本');
console.log('📋 管理後台內嵌數據已生成在 shared/admin-region-data.js，請手動複製到相關文件');
