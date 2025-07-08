# 密碼重設 API 文檔

## 新的密碼重設流程

### 1. 請求重設密碼

**端點**: `POST /api/auth/request-password-reset`

**描述**: 請求發送重設密碼email到指定email地址

**請求參數**:
```json
{
  "email": "user@example.com"
}
```

**響應範例**:
```json
{
  "success": true,
  "message": "如果該 email 已註冊，重設密碼連結將發送到您的信箱"
}
```

**錯誤響應**:
```json
{
  "success": false,
  "message": "請提供有效的 email 地址"
}
```

**安全性特點**:
- 無論email是否存在，都返回相同的成功訊息
- 避免帳號資訊洩漏（Do not leak registered status）
- Token有效期為30分鐘

### 2. Email 內容

**主旨**: `[HiHiTutor] 密碼重設連結`

**內容範本**:
```
親愛的用戶，您好！

您剛剛請求重設密碼，請點擊以下連結完成操作：
https://hihitutor.com/reset-password?token=xxx

如果您沒有要求重設密碼，請忽略此郵件。

謝謝！
HiHiTutor 團隊
```

**重設連結格式**: `https://hihitutor.com/reset-password?token=xxx`

### 3. 重設密碼（現有端點）

**端點**: `POST /api/auth/reset-password`

**請求參數**:
```json
{
  "token": "reset_token_from_email",
  "password": "new_password"
}
```

## 技術實現

### Token 生成
- 使用 `crypto.randomBytes(32).toString('hex')` 生成64位元隨機token
- 儲存在 `RegisterToken` 集合中
- 類型設為 `password-reset`
- 有效期30分鐘

### 數據庫結構
```javascript
{
  token: "64位元隨機字串",
  email: "user@example.com",
  type: "password-reset",
  isUsed: false,
  expiresAt: "30分鐘後",
  createdAt: "當前時間"
}
```

### Email 服務
- 使用現有的 `emailService.sendPasswordResetEmail()` 方法
- 支援HTML和純文字格式
- 包含美觀的重設按鈕和備用連結

## 測試

### 1. 測試有效email
```bash
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "existing@example.com"}'
```

### 2. 測試無效email
```bash
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com"}'
```

### 3. 測試無效格式
```bash
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}'
```

## 注意事項

1. **安全性**: 無論email是否存在都返回成功訊息
2. **有效期**: Token有效期為30分鐘
3. **一次性使用**: Token使用後會被標記為已使用
4. **自動清理**: 過期的token會自動從數據庫中刪除
5. **開發環境**: 在開發環境中只會模擬發送email 