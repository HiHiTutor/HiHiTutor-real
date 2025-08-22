# 導師修改監控系統

## 概述

這個系統允許後台管理員監控導師資料的修改情況，當導師修改了他們的資料時，管理員會收到通知並可以查看詳細的修改記錄。

## 功能特點

### 🔍 實時監控
- 自動記錄所有導師資料修改
- 記錄修改時間、修改的字段、舊值和新值
- 記錄修改者的 IP 地址和用戶代理信息

### 📊 詳細記錄
- 修改的具體字段名稱
- 修改前後的值對比
- 修改的時間戳
- 修改者的網絡信息

### 🚨 智能分類
- **重要修改**：教學科目、課時費、身份證、學歷證書
- **注意修改**：教學模式、地區、課程分類
- **一般修改**：其他字段

### 📱 管理界面
- 導師修改記錄列表
- 分頁顯示和搜索功能
- 詳細修改記錄彈窗
- CSV 導出功能

## 系統架構

### 後端 (Backend)

#### 1. 數據模型
```javascript
// User.js 中的 profileChangeLog 字段
profileChangeLog: [{
  timestamp: Date,        // 修改時間
  fields: [String],       // 修改的字段列表
  oldValues: Mixed,       // 舊值
  newValues: Mixed,       // 新值
  ipAddress: String,      // IP 地址
  userAgent: String       // 用戶代理
}]
```

#### 2. API 端點
- `GET /api/admin/notifications/tutor-changes` - 獲取導師修改記錄
- `GET /api/admin/notifications/tutor-changes/:tutorId` - 獲取特定導師的修改記錄
- `GET /api/admin/notifications/recent-changes` - 獲取最近的修改記錄
- `GET /api/admin/notifications/export-changes` - 導出修改記錄為 CSV

#### 3. 自動記錄
在 `tutorController.js` 中，每次更新導師資料時會自動記錄修改歷史：

```javascript
// 記錄修改歷史
const changeLog = {
  timestamp: new Date(),
  fields: Object.keys(updateObject),
  oldValues: {},
  newValues: updateObject,
  ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
  userAgent: req.headers['user-agent'] || 'unknown'
};

// 更新導師資料並添加修改記錄
const updatedTutor = await User.findByIdAndUpdate(
  userId,
  { 
    $set: updateObject,
    $push: { profileChangeLog: changeLog }
  },
  { new: true }
);
```

### 前端 (Frontend)

#### 1. 頁面組件
- `TutorChangeMonitor.tsx` - 主要的監控頁面
- 使用 Material-UI 組件構建
- 響應式設計，支持移動端

#### 2. 功能特性
- 最近修改摘要卡片
- 分頁表格顯示
- 詳細修改記錄彈窗
- 字段重要性標識
- 數據導出功能

## 使用方法

### 1. 訪問監控頁面
在後台管理系統中，點擊側邊欄的「導師修改監控」菜單項。

### 2. 查看修改記錄
- 頁面會顯示所有有修改記錄的導師
- 每個導師顯示：ID、姓名、郵箱、最近修改時間、修改次數
- 點擊「查看」按鈕可以查看詳細的修改記錄

### 3. 詳細記錄查看
在詳細記錄彈窗中，你可以看到：
- 每次修改的具體時間
- 修改了哪些字段
- 每個字段的舊值和新值
- 修改者的 IP 地址和用戶代理
- 字段的重要性分類（重要/注意/一般）

### 4. 數據導出
點擊「導出 CSV」按鈕可以將所有修改記錄導出為 CSV 文件，方便離線分析。

## 配置說明

### 1. 字段重要性配置
在 `TutorChangeMonitor.tsx` 中可以配置哪些字段是重要的：

```typescript
const getChangeType = (field: string): 'critical' | 'important' | 'normal' => {
  const criticalFields = [
    'tutorProfile.subjects',      // 教學科目
    'tutorProfile.sessionRate',   // 課時費
    'documents.idCard',           // 身份證
    'documents.educationCert'     // 學歷證書
  ];
  
  const importantFields = [
    'tutorProfile.teachingMode',  // 教學模式
    'tutorProfile.region',        // 地區
    'tutorProfile.category'       // 課程分類
  ];
  
  if (criticalFields.includes(field)) return 'critical';
  if (importantFields.includes(field)) return 'important';
  return 'normal';
};
```

### 2. 顯示名稱配置
可以為字段配置中文顯示名稱：

```typescript
const getFieldDisplayName = (field: string): string => {
  const fieldMap: Record<string, string> = {
    'name': '姓名',
    'tutorProfile.subjects': '教學科目',
    'tutorProfile.sessionRate': '課時費',
    // ... 更多字段映射
  };
  
  return fieldMap[field] || field;
};
```

## 測試

### 1. 運行測試腳本
```bash
cd backend
node test-tutor-change-log.js
```

這個腳本會：
- 查找一個導師用戶
- 模擬更新導師資料
- 記錄修改歷史
- 測試查詢功能

### 2. 手動測試
1. 登入導師賬戶
2. 修改個人資料
3. 在後台查看修改記錄

## 注意事項

### 1. 性能考慮
- 修改記錄會隨著時間增長而增加
- 建議定期清理舊的修改記錄
- 可以考慮添加時間範圍過濾

### 2. 隱私保護
- IP 地址和用戶代理信息僅供管理員查看
- 不建議在公開場合展示這些信息

### 3. 數據備份
- 修改記錄包含重要的審計信息
- 建議定期備份這些數據

## 未來改進

### 1. 實時通知
- 添加 WebSocket 支持，實現實時通知
- 當導師修改資料時，管理員立即收到通知

### 2. 智能分析
- 分析修改模式，識別異常行為
- 提供修改趨勢分析

### 3. 審批流程
- 可以選擇性地啟用審批流程
- 重要修改需要管理員審批後才能生效

### 4. 郵件通知
- 當有重要修改時，發送郵件通知給管理員
- 可配置通知頻率和條件

## 故障排除

### 1. 修改記錄沒有顯示
- 檢查導師是否真的修改了資料
- 檢查數據庫中的 `profileChangeLog` 字段
- 檢查 API 端點是否正常工作

### 2. IP 地址顯示為 "unknown"
- 檢查代理服務器配置
- 檢查 `req.ip` 和相關頭部字段
- 可能需要配置信任代理

### 3. 前端頁面無法加載
- 檢查路由配置
- 檢查組件導入
- 檢查 Material-UI 依賴

## 聯繫支持

如果在使用過程中遇到問題，請聯繫開發團隊或查看相關的錯誤日誌。
