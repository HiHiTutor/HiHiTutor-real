# 實時導師修改通知系統

## 概述

這個系統為管理員提供實時通知功能，當導師修改他們的個人資料時，管理員會立即收到通知，包括：
- 彈出通知顯示修改詳情
- 側邊欄菜單項的通知徽章
- 完整的修改記錄監控頁面

## 功能特點

### 🔔 實時通知
- **彈出通知**: 當有新的導師修改時，頁面右上角會彈出通知
- **自動更新**: 每30秒自動檢查新的修改記錄
- **智能顯示**: 只顯示最近24小時內的修改記錄

### 📱 通知內容
- 導師姓名和ID
- 修改的具體字段
- 修改時間（相對時間顯示）
- 快速操作按鈕

### 🎯 通知徽章
- 側邊欄 "導師修改監控" 菜單項顯示通知數量
- 數量統計最近24小時內的修改記錄
- 實時更新，無需刷新頁面

## 系統架構

### 後端組件

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
- `GET /api/admin/notifications/tutor-changes` - 獲取所有修改記錄
- `GET /api/admin/notifications/recent-changes` - 獲取最近的修改記錄
- `GET /api/admin/notifications/tutor-changes/:tutorId` - 獲取特定導師的修改記錄

#### 3. 自動記錄
在 `tutorController.js` 中，每次更新導師資料時會自動記錄修改歷史。

### 前端組件

#### 1. TutorChangeNotification
- 實時彈出通知組件
- 顯示修改詳情和快速操作
- 自動隱藏和手動關閉功能

#### 2. useNotifications Hook
- 管理通知狀態
- 定期檢查新的修改記錄
- 計算通知數量

#### 3. Sidebar 通知徽章
- 在側邊欄菜單項上顯示通知數量
- 實時更新通知統計

## 使用方法

### 管理員端

#### 1. 查看實時通知
- 當導師修改資料時，頁面右上角會自動彈出通知
- 通知顯示導師姓名、修改字段和時間
- 可以點擊 "查看詳情" 進入監控頁面

#### 2. 監控修改記錄
- 點擊側邊欄的 "導師修改監控"
- 查看所有導師的修改歷史
- 使用分頁和搜索功能

#### 3. 通知徽章
- 側邊欄菜單項會顯示通知數量
- 數量表示最近24小時內的修改記錄
- 點擊可進入監控頁面

### 導師端

#### 1. 修改個人資料
- 登入導師帳戶
- 修改任何個人資料字段
- 系統會自動記錄修改歷史

#### 2. 修改記錄
- 所有修改都會被記錄
- 包括修改時間、字段、IP地址等
- 管理員可以查看完整的修改歷史

## 技術實現

### 實時更新機制

#### 1. 定期檢查
```javascript
useEffect(() => {
  fetchRecentChanges();
  
  // 每 30 秒檢查一次新的修改記錄
  const interval = setInterval(fetchRecentChanges, 30000);
  
  return () => clearInterval(interval);
}, []);
```

#### 2. 通知觸發
```javascript
const fetchRecentChanges = async () => {
  const response = await api.get('/admin/notifications/recent-changes?limit=5');
  if (response.data.success && response.data.data.length > 0) {
    setOpen(true); // 觸發通知彈出
  }
};
```

### 通知顯示邏輯

#### 1. 時間過濾
```javascript
// 只顯示最近24小時內的修改記錄
const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

recentChangesResponse.data.data.forEach((tutor: any) => {
  tutor.changes.forEach((change: any) => {
    if (new Date(change.timestamp) > oneDayAgo) {
      tutorChangesCount++;
    }
  });
});
```

#### 2. 字段映射
```javascript
const getFieldDisplayName = (field: string) => {
  const fieldMap: { [key: string]: string } = {
    'tutorProfile.introduction': '自我介紹',
    'tutorProfile.courseFeatures': '課程特色',
    'tutorProfile.subjects': '教學科目',
    // ... 更多字段映射
  };
  
  return fieldMap[field] || field;
};
```

## 配置選項

### 通知設置

#### 1. 檢查頻率
```javascript
// 在 useNotifications.ts 中修改
const interval = setInterval(fetchNotifications, 30000); // 30秒
```

#### 2. 通知顯示時間
```javascript
// 在 TutorChangeNotification.tsx 中修改
<Snackbar
  autoHideDuration={10000} // 10秒後自動隱藏
  // ...
/>
```

#### 3. 時間範圍過濾
```javascript
// 在 useNotifications.ts 中修改
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24小時
```

### 字段重要性分類

#### 1. 重要修改
- 教學科目
- 課時費
- 身份證
- 學歷證書

#### 2. 注意修改
- 教學模式
- 地區
- 課程分類

#### 3. 一般修改
- 自我介紹
- 課程特色
- 其他描述性字段

## 測試指南

### 1. 運行測試腳本
```bash
cd backend
node test-tutor-change-notification.js
```

### 2. 手動測試
1. 登入導師帳戶
2. 修改個人資料
3. 檢查管理員前端的通知
4. 驗證修改記錄是否正確記錄

### 3. 驗證點
- 修改記錄是否正確保存
- 通知是否正確觸發
- 通知徽章是否正確更新
- 監控頁面是否正確顯示數據

## 故障排除

### 常見問題

#### 1. 通知不顯示
- 檢查瀏覽器控制台是否有錯誤
- 確認 API 端點是否正常工作
- 檢查網絡連接狀態

#### 2. 通知徽章不更新
- 檢查 useNotifications hook 是否正常工作
- 確認 API 響應格式是否正確
- 檢查組件是否正確重新渲染

#### 3. 修改記錄不保存
- 檢查 tutorController 是否正確執行
- 確認數據庫連接是否正常
- 檢查 User 模型是否正確定義

### 調試技巧

#### 1. 啟用日誌
```javascript
console.log('🔔 獲取管理員通知數據...');
console.log('📊 通知統計:', { /* 數據 */ });
```

#### 2. 檢查 API 響應
```javascript
const response = await api.get('/admin/notifications/recent-changes');
console.log('API 響應:', response.data);
```

#### 3. 驗證數據庫
```javascript
// 直接查詢數據庫
const tutorsWithChanges = await User.find({
  profileChangeLog: { $exists: true, $ne: [] }
});
console.log('數據庫查詢結果:', tutorsWithChanges);
```

## 性能優化

### 1. 緩存策略
- 使用 React 的 useMemo 和 useCallback
- 實現數據緩存機制
- 減少不必要的 API 調用

### 2. 數據庫優化
- 為 profileChangeLog 字段添加索引
- 使用聚合管道優化查詢
- 實現分頁加載

### 3. 前端優化
- 使用 React.memo 優化組件渲染
- 實現虛擬滾動處理大量數據
- 使用 Web Workers 處理複雜計算

## 未來改進

### 1. 推送通知
- 實現 WebSocket 實時推送
- 添加瀏覽器推送通知
- 支持郵件和短信通知

### 2. 智能過濾
- 實現機器學習分類
- 自動識別重要修改
- 個性化通知設置

### 3. 移動端支持
- 響應式設計優化
- 移動端專用通知
- 觸摸手勢支持

## 總結

實時導師修改通知系統為管理員提供了強大的監控能力，確保能夠及時了解導師資料的變更情況。系統具有以下優勢：

1. **實時性**: 30秒內檢測到新的修改記錄
2. **完整性**: 記錄所有修改的詳細信息
3. **易用性**: 直觀的通知界面和操作流程
4. **可擴展性**: 模塊化設計，易於維護和擴展

通過這個系統，管理員可以更好地監控和管理導師資料，確保平台數據的質量和準確性。
