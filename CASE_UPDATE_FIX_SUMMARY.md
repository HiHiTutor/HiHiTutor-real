# 案例更新錯誤修復總結

## 問題描述
在管理後台更新案例時，當案例ID是自定義字符串格式（如 "S1755856900740"）時，會出現以下錯誤：

```
CastError: Cast to ObjectId failed for value "S1755856900740" (type string) at path "_id" for model "StudentCase"
```

## 問題原因
後端在 `updateCase`、`updateCaseStatus` 和 `updatePromotionLevel` 函數中使用了以下查詢邏輯：

```javascript
{ $or: [{ _id: id }, { id: id }] }
```

當 `id` 是自定義字符串（如 "S1755856900740"）時，MongoDB 嘗試將其轉換為 `_id` 字段的 ObjectId，但失敗了，因為該字符串不是有效的 ObjectId 格式。

## 修復方案
修改查詢邏輯，優先使用 `id` 字段，只有當 `id` 是有效的 ObjectId 格式時才添加到 `_id` 查詢中。

### 修復前
```javascript
{ $or: [{ _id: id }, { id: id }] }
```

### 修復後
```javascript
const buildQuery = (id) => {
  const query = { id: id };
  // 只有當 id 是有效的 ObjectId 格式時才添加到 _id 查詢中
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query._id = id;
  }
  return query;
};
```

## 修復的文件
1. `backend/controllers/adminController.js`
   - `updateCase` 函數
   - `updateCaseStatus` 函數  
   - `updatePromotionLevel` 函數

2. `hihitutor/backend/controllers/adminController.js`
   - `updateCase` 函數
   - `updateCaseStatus` 函數
   - `updatePromotionLevel` 函數

## 修復效果
- 支持自定義字符串ID（如 "S1755856900740"）
- 同時保持對標準 ObjectId 格式的支持
- 避免 MongoDB ObjectId 轉換錯誤
- 確保案例更新功能正常工作

## 測試建議
1. 使用自定義字符串ID的案例進行更新測試
2. 使用標準 ObjectId 格式的案例進行更新測試
3. 測試不同類型的案例（學生案例、導師案例）
4. 測試案例狀態更新和推廣等級更新功能
