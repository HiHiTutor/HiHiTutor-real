# 地區選項統一指南

## 問題描述

在 HiHiTutor 系統中，地區選項在不同地方存在不一致的問題：

1. **創建用戶時**：使用一套地區選項
2. **編輯用戶時**：無法正確顯示原本選擇的地區
3. **地區選項不統一**：後端、前端、admin-frontend 使用不同的地區配置

## 解決方案

### 1. 統一地區配置文件

將所有地區選項統一放在 `backend/constants/regionOptions.js` 中，其他地方都引用這個文件。

#### 統一後的地區結構：
```javascript
[
  {
    value: 'unlimited',
    label: '不限',
    regions: []
  },
  {
    value: 'all-hong-kong',
    label: '全香港',
    regions: []
  },
  {
    value: 'hong-kong-island',
    label: '香港島',
    regions: [
      { value: 'central', label: '中環' },
      { value: 'sheung-wan', label: '上環' },
      // ... 更多子地區
    ]
  },
  // ... 更多大區
]
```

### 2. 新增地區 API 端點

創建 `backend/routes/regions.js` 提供以下 API：

- `GET /regions` - 獲取所有地區選項
- `GET /regions/label/:value` - 根據地區值獲取地區標籤
- `GET /regions/subregion/label/:value` - 根據子地區值獲取子地區標籤

### 3. 創建地區工具函數

創建 `backend/utils/regionUtils.js` 提供：

- `getRegionLabel(value)` - 獲取地區標籤
- `getSubRegionLabel(value)` - 獲取子地區標籤
- `formatRegionDisplay(region, subRegions)` - 格式化地區顯示文本
- 驗證函數等

### 4. 更新前端配置

- **user-frontend**: 更新 `src/constants/regionOptions.ts`
- **admin-frontend**: 更新 `src/pages/UserDetail.tsx` 中的地區選項

### 5. 修復地區顯示問題

在 admin-frontend 的用戶詳情頁面中：

1. **顯示當前選擇**：在編輯表單中顯示用戶原本選擇的地區
2. **統一選項**：使用與後端一致的地區選項
3. **改善用戶體驗**：清楚顯示當前選擇的地區和子地區

## 文件更改清單

### 後端文件
- ✅ `backend/constants/regionOptions.js` - 統一地區配置
- ✅ `backend/routes/regions.js` - 新增地區 API
- ✅ `backend/utils/regionUtils.js` - 新增地區工具函數

### 前端文件
- ✅ `user-frontend/src/constants/regionOptions.ts` - 更新地區配置
- ✅ `admin-frontend/src/pages/UserDetail.tsx` - 修復地區顯示

## 使用方法

### 1. 獲取地區選項
```javascript
// 從後端 API 獲取
const response = await fetch('/api/regions');
const regionOptions = await response.json();
```

### 2. 顯示地區標籤
```javascript
// 使用工具函數
import { getRegionLabel, formatRegionDisplay } from '../utils/regionUtils';

const regionLabel = getRegionLabel('hong-kong-island'); // 返回 "香港島"
const displayText = formatRegionDisplay('hong-kong-island', ['central', 'wan-chai']); 
// 返回 "香港島 - 中環、灣仔"
```

### 3. 驗證地區值
```javascript
import { isValidRegion, isValidSubRegion } from '../utils/regionUtils';

const isValid = isValidRegion('hong-kong-island'); // true
const isValidSub = isValidSubRegion('central'); // true
```

## 部署注意事項

1. **Vercel 部署**：確保後端的地區配置文件正確部署
2. **API 路由**：確保新的地區 API 端點正常工作
3. **前端同步**：確保所有前端都使用統一的地區配置

## 測試建議

1. **創建用戶**：測試地區選擇是否正確保存
2. **編輯用戶**：測試是否能正確顯示原本選擇的地區
3. **地區過濾**：測試導師搜索的地區過濾功能
4. **API 測試**：測試地區相關的 API 端點

## 未來改進

1. **多語言支持**：為地區名稱添加多語言支持
2. **地區熱度**：根據用戶選擇頻率調整地區排序
3. **智能推薦**：根據用戶位置智能推薦相關地區
4. **地區統計**：添加地區使用統計和分析功能
