# 🎯 導師推薦邏輯實現總結

## 📋 概述

實現了首頁導師推薦的「分批輪播 + 置頂保障」機制，確保每次訪問都有不同的導師組合，同時保證 VIP 和置頂導師的優先曝光。

## 🎲 推薦邏輯設計

### 目標配置
- **總數量**: 8 個導師
- **VIP 導師**: 5 個（分批輪播）
- **置頂導師**: 2-3 個（評分優先）
- **普通導師**: 0-1 個（補足名額）

### 核心算法

#### 1. VIP 導師分批輪播
```javascript
// 按評分排序
const sortedVip = vipTutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));

// 計算分頁參數
const vipPageSize = 5;
const vipTotalPages = Math.ceil(sortedVip.length / vipPageSize);

// 隨機選擇一個分頁（實現輪播效果）
const vipPageIndex = Math.floor(Math.random() * vipTotalPages);
const vipStartIndex = vipPageIndex * vipPageSize;
const vipEndIndex = Math.min(vipStartIndex + vipPageSize, sortedVip.length);

const vipSelected = sortedVip.slice(vipStartIndex, vipEndIndex);
```

#### 2. 置頂導師評分優先
```javascript
// 按評分排序
const sortedTop = topTutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));

// 計算剩餘名額，最多選擇3個置頂導師
const remainingSlots = targetCount - selectedTutors.length;
const topCount = Math.min(3, remainingSlots, sortedTop.length);

const topSelected = sortedTop.slice(0, topCount);
```

#### 3. 普通導師補足名額
```javascript
// 按評分排序
const sortedNormal = normalTutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));

// 計算剩餘名額
const remainingSlots = targetCount - selectedTutors.length;

if (remainingSlots > 0) {
  const normalSelected = sortedNormal.slice(0, remainingSlots);
  selectedTutors.push(...normalSelected);
}
```

## 🔄 輪播機制

### VIP 導師輪播示例
假設有 50 位 VIP 導師：

```
第1次訪問: 選擇第1頁 (1-5名)
第2次訪問: 選擇第3頁 (11-15名)  
第3次訪問: 選擇第2頁 (6-10名)
第4次訪問: 選擇第5頁 (21-25名)
...
```

### 特點
- ✅ 每次訪問都有不同組合
- ✅ VIP 導師排序維持公平（前5、6-10…可輪播）
- ✅ 評分高者優先
- ✅ 普通導師亦有曝光空間

## 📊 排序邏輯

最終排序優先級：
1. **VIP 狀態** (VIP > 非VIP)
2. **置頂狀態** (置頂 > 非置頂)  
3. **評分高低** (高評分 > 低評分)

```javascript
const finalSorted = selectedTutors.sort((a, b) => {
  // 首先按 VIP 狀態排序
  if (a.isVip && !b.isVip) return -1;
  if (!a.isVip && b.isVip) return 1;
  
  // 然後按置頂狀態排序
  if (a.isTop && !b.isTop) return -1;
  if (!a.isTop && b.isTop) return 1;
  
  // 最後按評分排序
  return (b.rating || 0) - (a.rating || 0);
});
```

## 🛡️ 容錯機制

### 1. 自動提升機制
如果沒有 VIP 或置頂導師，自動提升普通導師：
- 前3個評分最高的 → VIP
- 接下來5個 → 置頂

### 2. 補充機制
如果選擇的導師不足8個，從剩餘導師中按評分補充。

### 3. 回退機制
如果選擇失敗，回退到原來的查詢邏輯。

## 📝 實現文件

### 後端文件
- `backend/controllers/tutorController.js` - 主要邏輯實現
- `hihitutor/backend/controllers/tutorController.js` - 備份版本

### 前端文件  
- `user-frontend/src/app/page.tsx` - 首頁調用
- `hihitutor/user-frontend/src/app/page.tsx` - 備份版本

### 關鍵參數
```javascript
queryParams={{ featured: 'true', limit: '8' }}
```

## 🎯 效果預期

### 用戶體驗
- 每次刷新首頁都會看到不同的導師組合
- VIP 導師有穩定的曝光機會
- 置頂導師有優先展示權
- 普通導師也有機會被推薦

### 導師公平性
- VIP 導師按評分分批輪播，避免總是同一批人
- 置頂導師按評分排序，高評分者優先
- 普通導師有補充曝光機會

### 系統穩定性
- 多重容錯機制確保系統穩定運行
- 詳細的日誌記錄便於調試
- 回退機制防止系統崩潰

## 🔍 調試信息

系統會輸出詳細的選擇過程：
```
👑 VIP 導師選擇:
- 總頁數: 10
- 選擇頁面: 3
- 選擇範圍: 11-15
- 選擇數量: 5 個
  1. 張老師 (評分: 4.9)
  2. 李老師 (評分: 4.8)
  ...

⭐ 置頂導師選擇:
- 選擇數量: 3 個
  1. 王老師 (評分: 4.7)
  2. 陳老師 (評分: 4.6)
  ...

📚 普通導師選擇:
- 選擇數量: 0 個

🎉 最終選擇了 8 個導師，按優先級排序
📋 最終導師列表:
  1. 張老師 (👑 VIP, 評分: 4.9)
  2. 李老師 (👑 VIP, 評分: 4.8)
  ...
```

這個實現確保了導師推薦系統的公平性、多樣性和穩定性。 