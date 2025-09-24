#!/usr/bin/env node

/**
 * 科目配置同步腳本
 * 從 shared/categoryOptions.js 同步配置到所有前後台文件
 * 
 * 使用方法：
 * node scripts/sync-category-config.js
 */

const fs = require('fs');
const path = require('path');

// 導入統一配置
const { CATEGORY_OPTIONS, CATEGORY_OPTIONS_ARRAY } = require('../shared/categoryOptions');

console.log('🔄 開始同步科目配置...');

// 生成 TypeScript 數組格式
function generateTypeScriptArray() {
  return `// 從統一配置文件導入科目分類
// 注意：此文件現在從 shared/categoryOptions.js 自動生成
// 如需修改科目配置，請編輯 shared/categoryOptions.js

export interface CategoryOption {
  value: string;
  label: string;
  subjects?: { value: string; label: string }[];
  subCategories?: {
    value: string;
    label: string;
    subjects: { value: string; label: string }[];
  }[];
}

// 統一的科目分類配置
const CATEGORY_OPTIONS: CategoryOption[] = ${JSON.stringify(CATEGORY_OPTIONS_ARRAY, null, 2)};

export default CATEGORY_OPTIONS;`;
}

// 生成管理後台 TypeScript 格式（包含 OBJECT 格式）
function generateAdminTypeScript() {
  return `// 從統一配置文件導入科目分類
// 注意：此文件現在從 shared/categoryOptions.js 自動生成
// 如需修改科目配置，請編輯 shared/categoryOptions.js

export interface CategoryOption {
  value: string;
  label: string;
  subjects?: { value: string; label: string }[];
  subCategories?: {
    value: string;
    label: string;
    subjects: { value: string; label: string }[];
  }[];
}

// 統一的科目分類配置
const CATEGORY_OPTIONS: CategoryOption[] = ${JSON.stringify(CATEGORY_OPTIONS_ARRAY, null, 2)};

// 為了向後兼容，也提供舊的對象格式
export const CATEGORY_OPTIONS_OBJECT = CATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.value] = category;
  return acc;
}, {} as Record<string, CategoryOption>);

export default CATEGORY_OPTIONS;`;
}

// 生成後端 JavaScript 格式
function generateBackendJavaScript() {
  return `// 從統一配置文件導入科目分類
const { CATEGORY_OPTIONS } = require('../../shared/categoryOptions');

module.exports = CATEGORY_OPTIONS;`;
}

// 同步文件列表
const syncFiles = [
  {
    path: 'user-frontend/src/constants/categoryOptions.ts',
    content: generateTypeScriptArray()
  },
  {
    path: 'admin-frontend/src/constants/categoryOptions.ts',
    content: generateAdminTypeScript()
  },
  {
    path: 'backend/constants/categoryOptions.js',
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

console.log('🎉 科目配置同步完成！');
console.log('📝 如需修改科目配置，請編輯 shared/categoryOptions.js 然後重新運行此腳本');
