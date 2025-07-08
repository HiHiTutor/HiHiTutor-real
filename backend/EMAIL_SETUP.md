# HiHiTutor Email 服務設置指南

## 重設密碼 Email 功能

現在系統已經實作了重設密碼email功能，當用戶請求重設密碼時，系統會自動發送包含重設連結的email到用戶的email地址。

## 環境變數配置

為了確保密碼重設 email 功能正常運作，請在 Vercel 環境變數中設置以下配置：

### 必需環境變數

```env
# SMTP 服務器配置
SMTP_HOST=smtp.gmail.com          # 或其他 SMTP 服務器
SMTP_PORT=587                     # SMTP 端口（通常是 587 或 465）
SMTP_SECURE=false                 # 是否使用 SSL/TLS
SMTP_USER=uadmin@hihitutor.com    # SMTP 用戶名
SMTP_PASS=your_app_password       # SMTP 密碼或應用密碼
SMTP_FROM=uadmin@hihitutor.com    # 發件人 email 地址
```

### 推薦的 SMTP 服務

1. **Gmail (推薦用於開發)**
   - SMTP_HOST: smtp.gmail.com
   - SMTP_PORT: 587
   - SMTP_SECURE: false
   - 需要啟用 2FA 並生成應用密碼

2. **SendGrid**
   - SMTP_HOST: smtp.sendgrid.net
   - SMTP_PORT: 587
   - SMTP_SECURE: false

3. **Resend**
   - SMTP_HOST: smtp.resend.com
   - SMTP_PORT: 587
   - SMTP_SECURE: false

## 設置步驟

### 1. Gmail 設置（開發環境）

1. 登入 Gmail 帳戶
2. 啟用兩步驟驗證
3. 生成應用密碼：
   - 前往 Google 帳戶設定
   - 安全性 > 兩步驟驗證 > 應用程式密碼
   - 生成新的應用密碼
4. 在 Vercel 環境變數中設置：
   ```
   SMTP_USER=uadmin@hihitutor.com
   SMTP_PASS=生成的應用密碼
   ```

### 2. 生產環境建議

對於生產環境，建議：

1. **使用專業 email 服務**（如 SendGrid、Resend、Mailgun）
2. **設置 SPF/DKIM 記錄**以提高 email 送達率
3. **監控 email 發送狀態**

## SPF/DKIM 設置建議

### SPF 記錄
在 DNS 中添加：
```
v=spf1 include:_spf.google.com ~all
```

### DKIM 記錄
根據使用的 email 服務商設置相應的 DKIM 記錄。

## 測試

設置完成後，可以測試 email 功能：

```bash
curl -X POST https://hi-hi-tutor-real-backend2.vercel.app/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 故障排除

### 常見問題

1. **"Cannot find module 'nodemailer'"**
   - 確保已安裝 nodemailer 依賴

2. **"Authentication failed"**
   - 檢查 SMTP 用戶名和密碼
   - 確保已啟用應用密碼（Gmail）

3. **"Connection timeout"**
   - 檢查 SMTP_HOST 和 SMTP_PORT
   - 確認防火牆設置

4. **Email 被標記為垃圾郵件**
   - 設置 SPF/DKIM 記錄
   - 使用專業 email 服務
   - 確保發件人地址與域名匹配

## 安全注意事項

1. **不要將 SMTP 密碼提交到版本控制**
2. **定期更換應用密碼**
3. **監控 email 發送日誌**
4. **設置 email 發送限制以防止濫用** 