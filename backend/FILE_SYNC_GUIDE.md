# 文件同步系統使用指南

## 概述

本系統實現了自動統一 `publicCertificates` 和 `educationCert` 兩個字段的功能，確保前台和後台顯示的文件數據一致。

## 功能特性

### 1. 自動同步
- 後台每次管理文件時，系統會自動檢查並統一兩個字段
- 以 `educationCert` 為準，同步到 `publicCertificates`
- 確保數據一致性

### 2. 手動同步 API

#### 同步單個用戶文件
```bash
POST /api/sync-files/users/{userId}/sync
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "sourceField": "educationCert"  // 可選，默認為 educationCert
}
```

#### 檢查文件一致性
```bash
GET /api/sync-files/users/{userId}/consistency
Authorization: Bearer {admin_token}
```

#### 同步所有導師用戶
```bash
POST /api/sync-files/sync-all-tutors
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "sourceField": "educationCert"  // 可選，默認為 educationCert
}
```

### 3. 腳本工具

#### 統一所有用戶文件
```bash
# 同步所有導師用戶
node syncAllUserFiles.js

# 同步特定用戶
node syncAllUserFiles.js 1001000
```

#### 檢查文件一致性
```bash
node checkFileConsistency.js
```

## 文件存儲架構

### S3 存儲
```
Bucket: hihitutor-uploads
路徑: uploads/user-docs/{userId}/
```

### 數據庫字段
- `user.documents.educationCert`: 學歷證書存儲（後台管理用）
- `user.tutorProfile.publicCertificates`: 公開證書（前台顯示用）

## 同步邏輯

1. **文件上傳時**：
   - 同時添加到 `educationCert` 和 `publicCertificates`
   - 自動檢查並統一兩個字段

2. **文件刪除時**：
   - 從兩個字段中移除文件
   - 自動檢查並統一兩個字段

3. **手動同步時**：
   - 以 `educationCert` 為準
   - 將 `educationCert` 的內容同步到 `publicCertificates`

## 使用場景

### 場景 1: 修復現有數據不一致
```bash
# 檢查用戶 1001000 的文件一致性
curl -X GET "https://your-api.com/api/sync-files/users/1001000/consistency" \
  -H "Authorization: Bearer your-token"

# 同步用戶 1001000 的文件
curl -X POST "https://your-api.com/api/sync-files/users/1001000/sync" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"sourceField": "educationCert"}'
```

### 場景 2: 批量修復所有導師
```bash
# 同步所有導師用戶的文件
curl -X POST "https://your-api.com/api/sync-files/sync-all-tutors" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"sourceField": "educationCert"}'
```

### 場景 3: 使用腳本修復
```bash
# 在 backend 目錄下執行
node syncAllUserFiles.js
```

## 監控和日誌

系統會在以下情況記錄日誌：
- 檢測到字段不一致時
- 執行同步操作時
- 同步完成後

日誌格式：
```
🔧 檢測到字段不一致，正在同步...
✅ 已統一 publicCertificates 和 educationCert
```

## 注意事項

1. **權限要求**：所有 API 都需要管理員權限
2. **數據備份**：建議在執行批量同步前備份數據庫
3. **測試環境**：建議先在測試環境驗證功能
4. **監控**：定期檢查文件一致性，確保系統正常運行

## 故障排除

### 問題 1: 同步後仍然不一致
- 檢查是否有其他進程在修改數據
- 確認同步腳本執行完成
- 檢查數據庫連接狀態

### 問題 2: API 返回 404
- 確認用戶 ID 正確
- 檢查用戶是否存在
- 確認 API 端點正確

### 問題 3: 權限錯誤
- 確認使用管理員 token
- 檢查 token 是否過期
- 確認用戶有管理員權限

## 更新日誌

- **v1.0.0**: 初始版本，實現基本同步功能
- **v1.1.0**: 添加自動同步功能
- **v1.2.0**: 添加批量同步 API
- **v1.3.0**: 添加一致性檢查功能
