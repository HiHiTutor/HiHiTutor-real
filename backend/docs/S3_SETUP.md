# S3 存儲桶設置指南

## 問題描述

由於 AWS S3 的新政策，存儲桶默認禁用了 ACL（Access Control Lists），這導致上傳的文件無法公開訪問。

## 解決方案

### 方法 1: 使用存儲桶策略（推薦）

1. **設置存儲桶策略**：
   ```bash
   cd backend
   node scripts/setupS3BucketPolicy.js
   ```

2. **確保 AWS 憑證有足夠權限**：
   - `s3:PutBucketPolicy`
   - `s3:GetBucketPolicy`

### 方法 2: 手動設置（AWS Console）

1. 登入 AWS Console
2. 進入 S3 服務
3. 選擇存儲桶 `hihitutor-uploads`
4. 點擊 "Permissions" 標籤
5. 在 "Bucket policy" 部分點擊 "Edit"
6. 添加以下策略：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hihitutor-uploads/*"
    }
  ]
}
```

7. 點擊 "Save changes"

### 方法 3: 使用 AWS CLI

```bash
aws s3api put-bucket-policy \
  --bucket hihitutor-uploads \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::hihitutor-uploads/*"
      }
    ]
  }'
```

## 驗證設置

設置完成後，可以通過以下方式驗證：

1. **直接訪問文件 URL**：
   ```
   https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1000996/1753630456734-TestIcon2.jpg
   ```

2. **使用 curl 測試**：
   ```bash
   curl -I "https://hihitutor-uploads.s3.ap-southeast-2.amazonaws.com/uploads/user-docs/1000996/1753630456734-TestIcon2.jpg"
   ```

3. **檢查前端圖片顯示**：
   - 訪問導師儀表板
   - 上傳新文件
   - 確認圖片能正常顯示

## 注意事項

- 此策略會使存儲桶中的所有對象都可以公開讀取
- 如果需要更細粒度的控制，可以修改 Resource 路徑
- 建議定期審查存儲桶策略的安全性

## 故障排除

### 錯誤：AccessDenied
- 檢查 AWS 憑證權限
- 確認存儲桶名稱正確

### 錯誤：NoSuchBucket
- 確認存儲桶存在
- 檢查存儲桶名稱拼寫

### 圖片仍然無法顯示
- 清除瀏覽器緩存
- 檢查 Next.js 配置中的域名設置
- 確認文件確實已上傳到 S3 