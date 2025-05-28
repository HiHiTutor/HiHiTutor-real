# HiHiTutor 推薦排序 API 使用指南

## 概述

本文檔說明 `/api/find-student-cases` 的新推薦排序功能，包括 VIP、置頂和評分系統的實現。

## 新增字段

### StudentCase 模型新增字段

```javascript
{
  // VIP 相關字段
  isVip: Boolean,           // 是否為 VIP 案例
  vipLevel: Number,         // VIP 等級 (0-2)
  
  // 置頂相關字段
  isTop: Boolean,           // 是否為置頂案例
  topLevel: Number,         // 置頂等級 (0-2)
  
  // 評分相關字段
  ratingScore: Number,      // 評分 (0-5)
  ratingCount: Number,      // 評價數量
  
  // 付費相關字段
  isPaid: Boolean,          // 是否為付費案例
  paymentType: String,      // 付費類型: 'free', 'basic', 'premium', 'vip'
  
  // 推廣相關字段
  promotionLevel: Number,   // 推廣等級 (0-5)
  
  // 原有字段
  featured: Boolean         // 是否為推薦案例
}
```

## 推薦排序演算法

### 排序優先級

當 `featured=true` 時，系統使用以下 6 級排序優先級：

1. **VIP 置頂 + 高評分** (最多 2 個)
   - `isVip: true` AND `ratingScore >= 4`
   - 排序：`vipLevel desc, ratingScore desc, createdAt desc`

2. **VIP 置頂** (最多 2 個)
   - `isVip: true` (無評分限制)
   - 排序：`vipLevel desc, ratingScore desc, createdAt desc`

3. **置頂 + 高評分** (最多 1 個)
   - `isTop: true` AND `isVip != true` AND `ratingScore >= 4`
   - 排序：`topLevel desc, ratingScore desc, createdAt desc`

4. **置頂** (最多 1 個)
   - `isTop: true` AND `isVip != true` (無評分限制)
   - 排序：`topLevel desc, ratingScore desc, createdAt desc`

5. **普通高評分** (最多 1 個)
   - `isVip != true` AND `isTop != true` AND `ratingScore >= 4`
   - 排序：`ratingScore desc, createdAt desc`

6. **其他普通 fallback** (最多 1 個)
   - `isVip != true` AND `isTop != true`
   - 排序：`ratingScore desc, createdAt desc`

### 限制說明

- 每次最多返回 8 筆 featured 案例
- 使用 `_id: { $nin: [...] }` 避免重複
- 確保付費 VIP/置頂個案有足夠曝光機會

## API 使用方法

### GET 請求

```javascript
// 獲取推薦案例
GET /api/find-student-cases?featured=true&limit=8

// 回應格式
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "...",
        "title": "...",
        "category": "...",
        "subjects": [...],
        "regions": [...],
        "budget": "...",
        "mode": "...",
        "ratingScore": 4.8,
        "ratingCount": 25,
        "isVip": true,
        "vipLevel": 2,
        "isTop": false,
        "topLevel": 0,
        "isPaid": true,
        "paymentType": "vip",
        "promotionLevel": 0,
        "recommendationType": "vip_high_rating",
        "priorityScore": 148,
        "date": "2024-03-20T00:00:00.000Z"
      }
    ],
    "totalCount": 8,
    "allDocumentsCount": 50,
    "recommendationInfo": {
      "algorithm": "mixed_priority",
      "maxResults": 8,
      "appliedAt": "2024-03-21T10:30:00.000Z"
    }
  }
}
```

### POST 請求

```javascript
// 創建新案例
POST /api/find-student-cases
Content-Type: application/json
Authorization: Bearer <token>

{
  "tutorId": "tutor123",
  "title": "尋找數學補習老師",
  "category": "中學",
  "subjects": ["數學"],
  "regions": ["香港島"],
  "modes": ["線上"],
  "budget": "500-600",
  "requirements": "需要有經驗的數學老師",
  
  // 新增的推薦相關字段
  "featured": true,
  "isVip": true,
  "vipLevel": 2,
  "isTop": false,
  "topLevel": 0,
  "ratingScore": 4.5,
  "ratingCount": 10,
  "isPaid": true,
  "paymentType": "vip",
  "promotionLevel": 1
}
```

## 字段驗證規則

### 數值範圍限制

```javascript
{
  vipLevel: 0-2,        // 0: 普通, 1: VIP, 2: 超級VIP
  topLevel: 0-2,        // 0: 普通, 1: 置頂, 2: 超級置頂
  ratingScore: 0-5,     // 評分範圍
  ratingCount: >= 0,    // 評價數量不能為負
  promotionLevel: 0-5   // 推廣等級
}
```

### 枚舉值

```javascript
{
  paymentType: ['free', 'basic', 'premium', 'vip']
}
```

## 回應字段說明

### 推薦相關新字段

- `recommendationType`: 推薦類型標識
  - `vip_high_rating`: VIP + 高評分
  - `vip_normal`: VIP 普通
  - `top_high_rating`: 置頂 + 高評分
  - `top_normal`: 置頂普通
  - `normal_high_rating`: 普通高評分
  - `fallback`: 普通 fallback

- `priorityScore`: 優先級分數 (用於調試)

### 推薦信息

```javascript
{
  "recommendationInfo": {
    "algorithm": "mixed_priority",
    "maxResults": 8,
    "appliedAt": "2024-03-21T10:30:00.000Z"
  }
}
```

## 測試

### 運行測試腳本

```bash
cd backend
node scripts/test-recommendation.js
```

### 測試結果示例

```
📊 推薦結果分析:
總共推薦: 8 個案例
分類統計: {
  vipHighRating: 2,
  vipNormal: 2,
  topHighRating: 1,
  topNormal: 1,
  normalHighRating: 1,
  fallback: 1
}
```

## 注意事項

1. **向後兼容性**: 所有新字段都有默認值，不會影響現有數據
2. **性能優化**: 使用索引優化查詢性能
3. **數據一致性**: 字段驗證確保數據完整性
4. **錯誤處理**: 推薦演算法失敗時會回退到基本排序
5. **日誌記錄**: 詳細的日誌幫助調試和監控

## 建議索引

```javascript
// 推薦查詢優化索引
db.studentcases.createIndex({ 
  "featured": 1, 
  "isVip": 1, 
  "ratingScore": -1, 
  "createdAt": -1 
});

db.studentcases.createIndex({ 
  "featured": 1, 
  "isTop": 1, 
  "ratingScore": -1, 
  "createdAt": -1 
});
``` 