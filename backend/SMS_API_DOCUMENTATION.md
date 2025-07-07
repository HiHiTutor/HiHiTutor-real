# SMS.to API 整合文檔

## 概述

HiHiTutor 使用 SMS.to API 發送 SMS 驗證碼到香港電話號碼。系統使用 Client ID & Secret 認證方式，支援動態驗證碼生成和驗證。

## 環境變數設定

在 `.env` 文件中添加以下變數：

```env
SMS_TO_CLIENT_ID=wXqeLUcZC0jara4H
SMS_TO_CLIENT_SECRET=1JlsvJhngSP1dTdvmcw6UpoTtT4qWnx0
```

## API 端點

### 1. 發送 SMS 驗證碼

**端點：** `POST /api/send-sms`

**請求體：**
```json
{
  "phoneNumber": "+85295011159",
  "senderId": "HiHiTutor", // 可選
  "purpose": "phone_verification" // 可選，預設值
}
```

**成功響應：**
```json
{
  "success": true,
  "message": "SMS verification code sent successfully",
  "data": {
    "phoneNumber": "+85295011159",
    "messageId": "msg_123456",
    "expiresIn": "10 minutes",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. 驗證 SMS 驗證碼

**端點：** `POST /api/verify-sms`

**請求體：**
```json
{
  "phoneNumber": "+85295011159",
  "code": "123456",
  "purpose": "phone_verification" // 可選，預設值
}
```

**成功響應：**
```json
{
  "success": true,
  "message": "Verification code verified successfully",
  "data": {
    "phoneNumber": "+85295011159",
    "verifiedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. 測試 SMS 發送（固定號碼）

**端點：** `POST /api/test-sms`

**請求體：** `{}` (空對象)

**成功響應：**
```json
{
  "success": true,
  "message": "Test SMS sent successfully",
  "data": {
    "phoneNumber": "+85295011159",
    "otp": "123456",
    "messageId": "msg_123456",
    "expiresIn": "10 minutes",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. 驗證電話號碼格式

**端點：** `POST /api/validate-phone`

**請求體：**
```json
{
  "phoneNumber": "95011159"
}
```

**成功響應：**
```json
{
  "success": true,
  "data": {
    "phoneNumber": "95011159",
    "isValid": true,
    "formatted": "+85295011159",
    "isFormatted": true
  }
}
```

## 電話號碼格式支援

系統支援以下香港電話號碼格式：

- `+85295011159` (國際格式)
- `85295011159` (無 + 號)
- `95011159` (本地格式)

## 驗證碼特性

- **長度：** 6 位數字
- **有效期：** 10 分鐘
- **最大嘗試次數：** 3 次
- **自動清理：** 過期後自動從數據庫刪除

## 錯誤處理

### 常見錯誤響應

**400 - 請求參數錯誤：**
```json
{
  "success": false,
  "error": "Phone number is required"
}
```

**400 - 無效的電話號碼格式：**
```json
{
  "success": false,
  "error": "Invalid Hong Kong phone number format"
}
```

**429 - 請求過於頻繁：**
```json
{
  "success": false,
  "error": "Please wait 8 minutes before requesting a new code"
}
```

**400 - 驗證碼錯誤：**
```json
{
  "success": false,
  "error": "Invalid verification code"
}
```

**500 - 服務器錯誤：**
```json
{
  "success": false,
  "error": "Failed to send SMS"
}
```

## 測試

### 使用測試腳本

```bash
# 完整測試
node test-sms-api.js

# 測試固定號碼
node test-sms-api.js --fixed

# 測試驗證碼驗證
node test-sms-api.js --verify +85295011159 123456
```

### 使用 curl

```bash
# 發送 SMS
curl -X POST http://localhost:3001/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+85295011159"}'

# 驗證驗證碼
curl -X POST http://localhost:3001/api/verify-sms \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+85295011159", "code": "123456"}'
```

## 整合到註冊流程

### 前端整合示例

```javascript
// 發送驗證碼
const sendVerificationCode = async (phoneNumber) => {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('驗證碼已發送');
      // 開始倒計時，防止重複發送
    } else {
      console.error('發送失敗:', result.error);
    }
  } catch (error) {
    console.error('請求失敗:', error);
  }
};

// 驗證驗證碼
const verifyCode = async (phoneNumber, code) => {
  try {
    const response = await fetch('/api/verify-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber, code })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('驗證成功');
      // 繼續註冊流程
    } else {
      console.error('驗證失敗:', result.error);
    }
  } catch (error) {
    console.error('請求失敗:', error);
  }
};
```

## 安全注意事項

1. **環境變數保護：** 確保 Client ID 和 Secret 不會暴露在前端代碼中
2. **請求限制：** 系統會限制同一電話號碼的驗證碼請求頻率
3. **驗證碼有效期：** 驗證碼 10 分鐘後自動失效
4. **嘗試次數限制：** 每個驗證碼最多嘗試 3 次
5. **數據清理：** 過期的驗證碼會自動從數據庫中刪除

## 故障排除

### 常見問題

1. **SMS 發送失敗：**
   - 檢查環境變數是否正確設定
   - 確認 SMS.to 帳戶餘額
   - 檢查電話號碼格式

2. **驗證碼驗證失敗：**
   - 確認驗證碼未過期
   - 檢查嘗試次數是否超限
   - 確認電話號碼格式一致

3. **API 響應慢：**
   - 檢查網絡連接
   - 確認 SMS.to API 服務狀態
   - 查看服務器日誌 