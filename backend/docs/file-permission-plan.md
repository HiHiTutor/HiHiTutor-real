# HiHiTutor 檔案公開權限設計計劃（只供參考，暫不實作）

## 📂 目標分類

| 類別 | 上傳者 | 是否公開 | 備註 |
|------|--------|-----------|------|
| 導師大頭照 (avatar) | 導師 | ✅ 必須公開 | 將會以 public-read 上傳 |
| 導師身份證 | 導師 | ❌ 永遠私密 | 僅 admin 透過 signed URL 存取 |
| 導師證書 | 導師 | ✅ / ❌ 導師可選 | 可設 checkbox 決定是否設為 public-read |
| admin 檢查檔案 | admin | ✅ 透過 API 取得 signed URL | 無需登入 AWS Console |

## 📌 管理策略

1. frontend 僅存 public URL 或 signed URL，不暴露 S3 bucket 結構
2. admin 頁面呼叫 API 取得私密圖像連結，限時顯示
3. 導師可在「設定」中自行選擇證書是否公開

## ⛔ 現階段此為設計文件，請勿實作或修改任何代碼 