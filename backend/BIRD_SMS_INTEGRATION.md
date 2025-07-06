# 🐦 Bird SMS 整合說明

## 📋 功能概述

HiHiTutor 已成功整合 Bird.com SMS API 來發送驗證碼。此整合包含以下功能：

### ✅ 主要功能
- 使用 Bird.com API 發送 SMS 驗證碼
- 驗證碼有效期：10 分鐘
- 重複發送限制：90 秒內不能重發
- 完整的錯誤處理和日誌記錄
- 支援香港電話號碼格式驗證

### 🔧 技術實現
- 使用 axios 發送 HTTP 請求
- 整合到現有的 `/auth/request-verification-code` API
- 使用 MongoDB 儲存驗證碼和令牌
- 支援開發環境和生產環境

## 🚀 使用方法

### 1. 環境設置

在 `backend/.env` 檔案中添加：
```env
BIRD_ACCESS_KEY=FM7VijIDBhXM5QfpOc1RcZO4UDVNfdcMoaz3
NODE_ENV=development
```

### 2. API 端點

#### 發送驗證碼
```http
POST /auth/request-verification-code
Content-Type: application/json

{
  "phone": "61234567"
}
```

**回應範例：**
```json
{
  "success": true,
  "message": "驗證碼已發送",
  "token": "TEMP-REGISTER-TOKEN-abc123",
  "code": "123456"  // 僅在開發環境中返回
}
```

#### 驗證驗證碼
```http
POST /auth/verify-code
Content-Type: application/json

{
  "phone": "61234567",
  "code": "123456"
}
```

**回應範例：**
```json
{
  "success": true,
  "message": "驗證成功",
  "token": "TEMP-REGISTER-TOKEN-def456"
}
```

## 🧪 測試

### 1. 測試 Bird SMS 功能
```bash
node test-bird-sms.js
```

### 2. 測試完整驗證流程
```bash
node test-verification-api.js
```

### 3. 簡單使用範例
```bash
node bird-sms-example.js
```

## 📁 檔案結構

```
backend/
├── utils/
│   └── sendBirdSMS.js          # Bird SMS 核心功能
├── controllers/
│   └── authController.js       # 已整合 Bird SMS 的驗證控制器
├── test-bird-sms.js           # Bird SMS 功能測試
├── test-verification-api.js   # 完整驗證流程測試
├── bird-sms-example.js        # 簡單使用範例
└── BIRD_SMS_INTEGRATION.md    # 本說明文件
```

## 🔍 錯誤處理

### 常見錯誤回應

#### 1. 電話號碼格式錯誤
```json
{
  "success": false,
  "message": "請提供有效的香港電話號碼（8碼，4、5、6、7、8或9開頭）"
}
```

#### 2. 重複發送限制
```json
{
  "success": false,
  "message": "請等待 45 秒後再重新發送驗證碼"
}
```

#### 3. SMS 發送失敗
```json
{
  "success": false,
  "message": "SMS 發送失敗，請稍後再試"
}
```

#### 4. 驗證碼無效
```json
{
  "success": false,
  "message": "驗證碼無效或已過期"
}
```

## ⚙️ 配置說明

### Bird.com API 配置
- **API URL**: `https://api.bird.com/workspaces/{workspace_id}/channels/{channel_id}/messages`
- **Workspace ID**: `d181cf84-f717-48f6-8c5a-1d6e0ffdc07b`
- **Channel ID**: `331127f9-8ba7-5c83-8d1b-18de4ceff379`
- **Authorization**: `AccessKey {BIRD_ACCESS_KEY}`

### 驗證碼配置
- **長度**: 6 位數字
- **有效期**: 10 分鐘
- **重發限制**: 90 秒
- **格式**: 100000-999999

## 🔒 安全考量

1. **API Key 保護**: 使用環境變數儲存 API Key
2. **驗證碼過期**: 自動清理過期驗證碼
3. **重複發送限制**: 防止濫用
4. **電話號碼驗證**: 確保格式正確
5. **錯誤訊息**: 不洩露敏感資訊

## 📞 支援

如有問題，請檢查：
1. 環境變數是否正確設置
2. 網路連線是否正常
3. Bird.com API 服務狀態
4. 電話號碼格式是否正確

## 🚀 部署注意事項

1. 確保生產環境中設置正確的 `BIRD_ACCESS_KEY`
2. 設置 `NODE_ENV=production` 以隱藏驗證碼
3. 監控 SMS 發送成功率
4. 定期檢查 API 配額使用情況 