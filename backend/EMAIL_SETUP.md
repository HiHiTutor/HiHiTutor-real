# Email 服務設置指南

## 重設密碼 Email 功能

現在系統已經實作了重設密碼email功能，當用戶請求重設密碼時，系統會自動發送包含重設連結的email到用戶的email地址。

## 環境變數配置

要啟用email功能，需要在環境變數中設置以下SMTP配置：

```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Gmail 設置步驟

1. **啟用兩步驟驗證**
   - 登入你的Gmail帳戶
   - 前往 Google 帳戶設定 > 安全性
   - 啟用兩步驟驗證

2. **生成應用程式密碼**
   - 在安全性設定中，找到「應用程式密碼」
   - 選擇「郵件」和「其他（自訂名稱）」
   - 輸入名稱（例如：HiHiTutor）
   - 複製生成的16位元密碼

3. **設置環境變數**
   - 將你的Gmail地址設為 `SMTP_USER` 和 `SMTP_FROM`
   - 將應用程式密碼設為 `SMTP_PASS`

## 其他 SMTP 服務商

你也可以使用其他SMTP服務商，例如：

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
```

## 開發環境

在開發環境中（`NODE_ENV=development`），系統會模擬發送email，只會在控制台輸出email內容，不會實際發送。

## 測試

設置完成後，可以測試重設密碼功能：

1. 前往忘記密碼頁面
2. 輸入已註冊的email地址
3. 檢查是否收到重設密碼email
4. 點擊email中的連結進行密碼重設

## 故障排除

如果email發送失敗，請檢查：

1. SMTP配置是否正確
2. 網路連接是否正常
3. 防火牆是否阻擋SMTP端口
4. Gmail應用程式密碼是否正確
5. 兩步驟驗證是否已啟用 