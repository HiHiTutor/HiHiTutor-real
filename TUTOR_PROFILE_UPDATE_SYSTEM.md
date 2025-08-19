# 導師資料更新系統 - 即時生效版本

## 概述

本系統已從原來的審批制改為即時生效制，導師修改資料後無需等待管理員審批，但系統會自動監控和記錄所有修改，防止濫用。

## 主要功能

### 1. 前端驗證防護

#### 聯絡資料檢測
- **連續數字檢測**: 自動檢測並阻止輸入連續5個或以上數字
- **特殊符號檢測**: 阻止輸入@符號等電子郵件標識
- **關鍵詞檢測**: 檢測常見聯絡方式關鍵詞（電話、微信、QQ等）

#### 實時驗證
- 輸入時實時檢查是否包含聯絡資料
- 失去焦點時進行完整驗證
- 表單提交前進行最終驗證

#### 驗證規則
```typescript
// 檢測連續數字
/\d{5,}/.test(text)

// 檢測@符號
text.toLowerCase().includes('@')

// 檢測聯絡關鍵詞
const contactKeywords = [
  '電話', 'phone', 'tel', 'mobile', 'whatsapp', 'wechat', 'line', 'telegram',
  '電郵', 'email', '郵箱', '信箱', '聯絡', '聯繫', 'contact', 'qq', 'skype',
  '微信', 'qq號', 'qq群', '微信群', 'line群', 'telegram群'
];
```

### 2. 警告系統

#### 警告組件
- **詳細警告**: 顯示完整的平台條款違規警告
- **簡潔警告**: 用於空間有限的區域
- **緊湊警告**: 最小化顯示的警告信息

#### 警告內容
```
⚠️ 重要提醒：如導師提供任何聯絡資料，即違反平台條款，帳號將被永久停用。

嚴禁輸入電話號碼、電子郵件、社交媒體帳號等聯絡方式。所有聯絡必須通過平台進行。
```

### 3. 後台監控系統

#### 修改記錄
- 記錄所有導師資料修改
- 保存修改前後的值
- 記錄修改時間和用戶信息

#### 數據結構
```javascript
profileChangeLog: [{
  timestamp: Date,
  fields: [String],        // 修改的字段列表
  oldValues: Mixed,        // 舊值
  newValues: Mixed,        // 新值
  ipAddress: String,       // 修改時的IP地址
  userAgent: String        // 修改時的用戶代理
}]
```

#### 管理員API
- `GET /api/admin/notifications/tutor-changes` - 獲取所有修改記錄
- `GET /api/admin/notifications/tutor-changes/:tutorId` - 獲取特定導師的修改記錄
- `GET /api/admin/notifications/recent-changes` - 獲取最近的修改記錄
- `GET /api/admin/notifications/export-changes` - 導出修改記錄為CSV

### 4. 前端組件

#### ValidatedInput
- 自動驗證輸入內容
- 實時顯示錯誤信息
- 支持多種輸入類型（文本、文本域等）

#### ContactInfoWarning
- 三種顯示模式：詳細、簡潔、緊湊
- 響應式設計
- 可自定義樣式

## 使用方法

### 導師端

1. **編輯個人資料**
   - 訪問 `/tutor/dashboard`
   - 所有輸入字段都會自動驗證
   - 包含聯絡資料時會顯示錯誤提示

2. **提交表單**
   - 系統會自動檢查所有字段
   - 如有聯絡資料會阻止提交
   - 成功提交後資料即時生效

### 管理員端

1. **查看修改記錄**
   - 訪問管理員後台
   - 使用 `TutorChangeMonitor` 組件
   - 可查看所有導師的修改歷史

2. **導出數據**
   - 支持CSV格式導出
   - 可選擇日期範圍
   - 包含完整的修改記錄

## 技術實現

### 後端
- **控制器**: `backend/controllers/tutorController.js`
- **模型**: `backend/models/User.js` (添加 `profileChangeLog` 字段)
- **路由**: `backend/routes/adminNotifications.js`

### 前端
- **驗證工具**: `user-frontend/src/utils/validation.ts`
- **警告組件**: `user-frontend/src/components/ContactInfoWarning.tsx`
- **驗證輸入**: `user-frontend/src/components/ValidatedInput.tsx`
- **監控組件**: `admin-frontend/src/components/TutorChangeMonitor.tsx`

## 安全特性

### 1. 多層防護
- 前端實時驗證
- 後端數據檢查
- 管理員監控系統

### 2. 完整記錄
- 所有修改都有記錄
- 包含時間戳和用戶信息
- 支持審計追蹤

### 3. 自動清理
- 檢測到聯絡資料時自動阻止
- 提供清理建議
- 防止數據洩露

## 配置選項

### 環境變數
```bash
# 可選：啟用管理員通知
ENABLE_ADMIN_NOTIFICATIONS=true

# 可選：通知頻率限制
NOTIFICATION_RATE_LIMIT=1000
```

### 自定義驗證規則
```typescript
// 在 validation.ts 中添加新的關鍵詞
const contactKeywords = [
  ...existingKeywords,
  '新的關鍵詞'
];
```

## 監控和維護

### 1. 定期檢查
- 檢查修改記錄數量
- 分析常見的違規模式
- 更新驗證規則

### 2. 性能監控
- 監控數據庫查詢性能
- 檢查API響應時間
- 優化查詢索引

### 3. 安全審計
- 定期檢查修改記錄
- 分析可疑的修改模式
- 更新安全策略

## 故障排除

### 常見問題

1. **驗證不生效**
   - 檢查瀏覽器控制台錯誤
   - 確認組件正確導入
   - 檢查驗證函數調用

2. **修改記錄不顯示**
   - 檢查數據庫連接
   - 確認API路由正確
   - 檢查權限設置

3. **性能問題**
   - 檢查數據庫索引
   - 優化查詢語句
   - 考慮分頁加載

### 調試模式
```typescript
// 啟用詳細日誌
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('驗證詳情:', validation);
}
```

## 未來改進

### 1. AI檢測
- 使用機器學習識別聯絡資料
- 智能文本分析
- 自動內容審核

### 2. 實時通知
- WebSocket實時推送
- 管理員即時警報
- 自動處理機制

### 3. 高級分析
- 修改趨勢分析
- 風險評分系統
- 預測性維護

## 聯繫支持

如有問題或建議，請聯繫開發團隊或提交Issue。 