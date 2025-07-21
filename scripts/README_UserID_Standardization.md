# 用戶ID標準化腳本

這個腳本用於統一MongoDB中所有用戶的UserID和TutorID格式。

## 標準化規則

### UserID 格式
- **格式**: 7位數字
- **示例**: `1000001`, `1000002`, `1000003`, ...
- **適用**: 所有用戶（學生、導師、機構、管理員）

### TutorID 格式
- **格式**: `TU` + 4位數字
- **示例**: `TU0001`, `TU0002`, `TU0003`, ...
- **適用**: 只有 `userType` 為 `'tutor'` 的用戶

## 使用方法

### 1. 直接運行腳本
```bash
# 在主目錄下運行
node scripts/runStandardizeUserIds.js
```

### 2. 或者直接運行標準化腳本
```bash
# 在 backend 目錄下運行
cd backend
node scripts/standardizeUserIds.js
```

### 3. 在 hihitutor 目錄下運行
```bash
# 在 hihitutor/backend 目錄下運行
cd hihitutor/backend
node scripts/standardizeUserIds.js
```

## 環境變數要求

確保設定了 `MONGODB_URI` 環境變數：

```bash
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"
```

## 腳本功能

### 1. 分析現有數據
- 統計現有ID格式的有效性
- 顯示需要標準化的用戶數量
- 檢查重複ID

### 2. 標準化處理
- 為無效格式的UserID生成新的7位數字ID
- 為導師生成標準的TU格式TutorID
- 確保所有ID的唯一性
- 保留現有有效格式的ID

### 3. 驗證結果
- 檢查標準化後的結果
- 顯示統計信息
- 提供示例用戶數據

## 輸出示例

```
🔗 連接到 MongoDB...
✅ 成功連接到 MongoDB
📊 總共有 150 個用戶

📋 現有ID格式統計:
- 有效 UserID: 120
- 無效 UserID: 30
- 有效 TutorID: 45
- 無效 TutorID: 15
- 導師無 TutorID: 5

🔄 開始標準化用戶ID...
🆔 用戶 張三 (zhang@example.com): TUTOR001 → 1000001
🎓 導師 李老師 (li@example.com): AA0001 → TU0001
...

✅ 標準化完成！
📊 更新統計:
- 更新用戶數: 30
- 更新導師數: 20

🎉 所有用戶ID已成功標準化！
```

## 注意事項

1. **備份數據**: 運行前請務必備份MongoDB數據
2. **生產環境**: 建議在測試環境先運行，確認無誤後再在生產環境執行
3. **停機時間**: 腳本運行期間建議暫停應用服務，避免數據衝突
4. **權限檢查**: 確保數據庫連接有足夠的讀寫權限

## 錯誤處理

如果遇到錯誤，腳本會：
- 顯示詳細的錯誤信息
- 記錄到控制台
- 安全退出，不會部分更新數據

## 回滾方案

如果需要回滾，可以：
1. 使用MongoDB備份恢復
2. 或者手動修改特定用戶的ID

## 聯繫支持

如有問題，請檢查：
1. MongoDB連接是否正常
2. 環境變數是否正確設定
3. 數據庫權限是否足夠 