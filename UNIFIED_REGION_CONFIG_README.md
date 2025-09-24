# 統一地區配置系統

## 概述

本系統實現了地區配置的統一管理，只需修改一個文件即可同步更新所有前後台的地區配置。

## 統一配置文件

**主要配置文件**: `shared/regionOptions.js`

這是唯一需要修改的地區配置文件。修改此文件後，運行同步腳本即可更新所有前後台。

## 文件結構

```
shared/
├── regionOptions.js            # 🎯 主要配置文件（唯一需要修改的文件）
├── admin-region-data.js        # 管理後台內嵌數據（自動生成）

scripts/
├── sync-region-config.js       # 同步腳本

user-frontend/src/constants/
├── regionOptions.ts            # 用戶前端配置（自動生成）

backend/constants/
├── regionOptions.js            # 後端配置（自動生成）
```

## 使用方法

### 1. 修改地區配置

編輯 `shared/regionOptions.js` 文件：

```javascript
const REGION_OPTIONS = [
  {
    value: 'unlimited',
    label: '不限',
    regions: []
  },
  {
    value: 'hong-kong-island',
    label: '香港島',
    regions: [
      { value: 'central', label: '中環' },
      { value: 'sheung-wan', label: '上環' },
      // ... 其他子地區
    ]
  },
  // ... 其他大區
];
```

### 2. 同步配置

運行同步腳本：

```bash
node scripts/sync-region-config.js
```

### 3. 更新管理後台內嵌數據

同步腳本會生成 `shared/admin-region-data.js` 文件，請手動複製其中的 `fallbackRegions` 數據到以下文件：

- `admin-frontend/src/pages/CreateUser.tsx`
- `admin-frontend/src/pages/CreateCase.tsx`

### 4. 部署更新

提交並推送更改：

```bash
git add .
git commit -m "更新地區配置"
git push
```

## 配置格式

### 地區結構

```javascript
{
  value: 'region-key',
  label: '地區顯示名稱',
  regions: [
    { value: 'subregion-key', label: '子地區顯示名稱' },
    // ... 更多子地區
  ]
}
```

### 支持的格式

- **數組格式**: 供前端和後端使用
- **TypeScript 接口**: 供 TypeScript 項目使用
- **內嵌格式**: 供管理後台使用

## 自動同步的文件

同步腳本會自動更新以下文件：

1. `user-frontend/src/constants/regionOptions.ts`
2. `backend/constants/regionOptions.js`

## 手動更新的文件

由於管理後台使用內嵌數據，需要手動更新：

1. `admin-frontend/src/pages/CreateUser.tsx` - 複製 `shared/admin-region-data.js` 中的數據
2. `admin-frontend/src/pages/CreateCase.tsx` - 複製 `shared/admin-region-data.js` 中的數據

## 注意事項

⚠️ **重要**: 請勿直接修改自動生成的文件，這些文件會在下次同步時被覆蓋。

✅ **正確做法**: 只修改 `shared/regionOptions.js`，然後運行同步腳本。

## 添加新地區

1. 在 `shared/regionOptions.js` 中添加新地區
2. 運行 `node scripts/sync-region-config.js`
3. 手動更新管理後台內嵌數據
4. 提交更改

## 添加新子地區

1. 在 `shared/regionOptions.js` 中對應大區的 `regions` 數組中添加新子地區
2. 運行 `node scripts/sync-region-config.js`
3. 手動更新管理後台內嵌數據
4. 提交更改

## 故障排除

如果同步失敗，請檢查：

1. `shared/regionOptions.js` 語法是否正確
2. 文件路徑是否存在
3. 是否有寫入權限

## 版本歷史

- **v1.0**: 初始版本，支持香港島、九龍、新界、離島四個大區
- **v1.1**: 添加不限、全香港選項
