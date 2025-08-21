# 🎓 教學模式資料庫部署指南

## 📋 概述

本指南將幫助您在 Vercel 上部署教學模式資料庫，統一管理教學模式和子模式的資料。

## 🚀 部署步驟

### 1. 部署後端到 Vercel

確保您的後端已經部署到 Vercel，並且包含以下新檔案：
- `backend/models/TeachingMode.js` - 教學模式資料模型
- `backend/scripts/initTeachingModes.js` - 初始化腳本
- `backend/routes/teachingModes.js` - API 路由

### 2. 設定環境變數

在 Vercel 儀表板中設定以下環境變數：
```
MONGODB_URI=your_mongodb_connection_string
```

### 3. 初始化資料庫

部署完成後，調用以下 API 端點來初始化教學模式資料：

```bash
POST https://your-backend-domain.vercel.app/api/teaching-modes/init
```

### 4. 驗證部署

調用以下端點驗證資料是否正確載入：

```bash
GET https://your-backend-domain.vercel.app/api/teaching-modes
```

## 📊 資料結構

### 教學模式資料

```json
[
  {
    "value": "both",
    "label": "皆可",
    "subCategories": [],
    "sortOrder": 1
  },
  {
    "value": "face-to-face",
    "label": "面授",
    "subCategories": [
      { "value": "home", "label": "上門" },
      { "value": "center", "label": "補習中心" },
      { "value": "library", "label": "圖書館" },
      { "value": "coffee-shop", "label": "咖啡廳" },
      { "value": "student-home", "label": "學生家" }
    ],
    "sortOrder": 2
  },
  {
    "value": "online",
    "label": "網課",
    "subCategories": [
      { "value": "zoom", "label": "Zoom" },
      { "value": "teams", "label": "Microsoft Teams" },
      { "value": "skype", "label": "Skype" },
      { "value": "google-meet", "label": "Google Meet" },
      { "value": "other-platform", "label": "其他平台" }
    ],
    "sortOrder": 3
  }
]
```

## 🔄 API 端點

### 獲取所有教學模式
```
GET /api/teaching-modes
```

### 獲取特定教學模式
```
GET /api/teaching-modes/:value
```

### 初始化資料庫
```
POST /api/teaching-modes/init
```

### 格式轉換
```
POST /api/teaching-modes/convert
Body: { "oldMode": "in-person", "oldSubMode": "one-on-one" }
```

### 驗證教學模式
```
POST /api/teaching-modes/validate
Body: { "mode": "face-to-face", "subMode": "home" }
```

### 獲取映射表
```
GET /api/teaching-modes/mappings/legacy
GET /api/teaching-modes/mappings/sub-modes
```

## 🔧 向後兼容

系統支援以下舊格式的教學模式：

### 主模式映射
- `in-person` → `face-to-face`
- `面授` → `face-to-face`
- `面對面` → `face-to-face`
- `線下` → `face-to-face`
- `網課` → `online`
- `網上` → `online`
- `線上` → `online`
- `皆可` → `both`

### 子模式映射
- `one-on-one` → `home`
- `small-group` → `center`
- `large-center` → `center`

## 🧪 測試

### 1. 測試初始化
```bash
curl -X POST https://your-backend-domain.vercel.app/api/teaching-modes/init
```

### 2. 測試獲取資料
```bash
curl https://your-backend-domain.vercel.app/api/teaching-modes
```

### 3. 測試格式轉換
```bash
curl -X POST https://your-backend-domain.vercel.app/api/teaching-modes/convert \
  -H "Content-Type: application/json" \
  -d '{"oldMode": "in-person", "oldSubMode": "one-on-one"}'
```

### 4. 測試驗證
```bash
curl -X POST https://your-backend-domain.vercel.app/api/teaching-modes/validate \
  -H "Content-Type: application/json" \
  -d '{"mode": "face-to-face", "subMode": "home"}'
```

## 🚨 故障排除

### 常見問題

1. **MONGODB_URI 未設定**
   - 檢查 Vercel 環境變數設定
   - 確保 MongoDB 連接字串正確

2. **初始化失敗**
   - 檢查 MongoDB 連接狀態
   - 查看 Vercel 函數日誌

3. **API 端點無回應**
   - 確認後端已正確部署
   - 檢查路由是否正確註冊

### 日誌檢查

在 Vercel 儀表板中查看函數日誌，尋找錯誤信息。

## 📝 更新記錄

- **v1.0.0** - 初始版本，包含基本教學模式資料
- 支援向後兼容的格式轉換
- 提供完整的 API 端點
- 包含驗證和映射功能

## 🔗 相關連結

- [MongoDB Atlas](https://www.mongodb.com/atlas) - 雲端資料庫服務
- [Vercel](https://vercel.com) - 部署平台
- [Mongoose](https://mongoosejs.com) - MongoDB ODM
