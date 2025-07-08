# HiHiTutor 密碼重設 API 文檔

## 請求密碼重設

**端點**: `POST /api/auth/request-password-reset`

### 請求格式

```json
{
  "email": "user@example.com"
}
```

### 響應格式

#### 成功響應 (200)
```json
{
  "success": true,
  "message": "如果該 email 已註冊，重設密碼連結將發送到您的信箱"
}
```

#### 錯誤響應 (400)
```json
{
  "success": false,
  "message": "請提供有效的 email 地址"
}
```

#### 錯誤響應 (500)
```json
{
  "success": false,
  "message": "發送重設密碼email時發生錯誤，請稍後再試"
}
```

### Email 格式

系統會發送一封包含以下內容的 email：

**主旨**: 🔐 重設你的 HiHiTutor 密碼

**內容**:
```
HiHiTutor 用戶你好，

請按以下連結重設你的密碼（連結 10 分鐘內有效）：

👉 https://hihitutor.com/reset-password?token=xxx

如你沒有要求重設密碼，請忽略此訊息。
```

**發件人**: HiHiTutor 平台通知 <uadmin@hihitutor.com>

### 安全特性

1. **Token 有效期**: 10 分鐘
2. **唯一性**: 每次請求生成新的 token
3. **一次性使用**: token 使用後立即失效
4. **隱私保護**: 無論 email 是否存在都返回相同訊息

## 重設密碼

**端點**: `POST /api/auth/reset-password`

### 請求格式

```json
{
  "token": "reset_token_here",
  "password": "new_password"
}
```

### 響應格式

#### 成功響應 (200)
```json
{
  "success": true,
  "message": "密碼重設成功"
}
```

#### 錯誤響應 (400)
```json
{
  "success": false,
  "message": "無效或過期的 token"
}
```

## 測試範例

### 請求密碼重設
```bash
curl -X POST https://hi-hi-tutor-real-backend2.vercel.app/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 重設密碼
```bash
curl -X POST https://hi-hi-tutor-real-backend2.vercel.app/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "your_reset_token", "password": "new_password"}'
```

## 環境變數要求

確保以下環境變數已正確設置：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=uadmin@hihitutor.com
SMTP_PASS=your_app_password
SMTP_FROM=uadmin@hihitutor.com
```

## 注意事項

1. **Email 服務**: 使用 `uadmin@hihitutor.com` 作為發件人
2. **Token 安全性**: 32 位元組隨機 token，10 分鐘有效期
3. **錯誤處理**: 完善的錯誤處理和日誌記錄
4. **送達率**: 建議設置 SPF/DKIM 記錄以提高 email 送達率 