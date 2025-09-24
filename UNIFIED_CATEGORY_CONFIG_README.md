# 統一科目配置系統

## 概述

本系統實現了科目配置的統一管理，只需修改一個文件即可同步更新所有前後台的科目配置。

## 統一配置文件

**主要配置文件**: `shared/categoryOptions.js`

這是唯一需要修改的科目配置文件。修改此文件後，運行同步腳本即可更新所有前後台。

## 文件結構

```
shared/
├── categoryOptions.js          # 🎯 主要配置文件（唯一需要修改的文件）

scripts/
├── sync-category-config.js     # 同步腳本

user-frontend/src/constants/
├── categoryOptions.ts          # 用戶前端配置（自動生成）

admin-frontend/src/constants/
├── categoryOptions.ts          # 管理後台配置（自動生成）

backend/constants/
├── categoryOptions.js          # 後端配置（自動生成）
```

## 使用方法

### 1. 修改科目配置

編輯 `shared/categoryOptions.js` 文件：

```javascript
const CATEGORY_OPTIONS = {
  'early-childhood': {
    label: '幼兒教育',
    subjects: [
      { value: 'early-childhood-chinese', label: '幼兒中文' },
      // ... 其他科目
    ]
  },
  'primary': {
    label: '小學教育',
    subjects: [
      { value: 'primary-chinese', label: '中文' },
      // ... 其他科目
    ]
  },
  'secondary': {
    label: '中學教育',
    subjects: [
      { value: 'secondary-chinese', label: '中文' },
      // ... 其他科目
    ]
  }
};
```

### 2. 同步配置

運行同步腳本：

```bash
node scripts/sync-category-config.js
```

### 3. 部署更新

提交並推送更改：

```bash
git add .
git commit -m "更新科目配置"
git push
```

## 配置格式

### 分類結構

```javascript
{
  'category-key': {
    label: '分類顯示名稱',
    subjects: [
      { value: 'subject-key', label: '科目顯示名稱' },
      // ... 更多科目
    ]
  }
}
```

### 支持的格式

- **對象格式**: 供後端使用
- **數組格式**: 供前端使用
- **TypeScript 接口**: 供 TypeScript 項目使用

## 自動同步的文件

同步腳本會自動更新以下文件：

1. `user-frontend/src/constants/categoryOptions.ts`
2. `admin-frontend/src/constants/categoryOptions.ts`
3. `backend/constants/categoryOptions.js`

## 注意事項

⚠️ **重要**: 請勿直接修改自動生成的文件，這些文件會在下次同步時被覆蓋。

✅ **正確做法**: 只修改 `shared/categoryOptions.js`，然後運行同步腳本。

## 添加新科目

1. 在 `shared/categoryOptions.js` 中添加新科目
2. 運行 `node scripts/sync-category-config.js`
3. 提交更改

## 添加新分類

1. 在 `shared/categoryOptions.js` 中添加新分類
2. 運行 `node scripts/sync-category-config.js`
3. 提交更改

## 故障排除

如果同步失敗，請檢查：

1. `shared/categoryOptions.js` 語法是否正確
2. 文件路徑是否存在
3. 是否有寫入權限

## 版本歷史

- **v1.0**: 初始版本，支持三層科目結構（幼兒教育、小學教育、中學教育）
