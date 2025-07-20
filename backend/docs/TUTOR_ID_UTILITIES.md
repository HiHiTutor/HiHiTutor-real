# 導師 ID 工具函數文檔

## 概述

本工具模組提供了完整的導師 ID 生成、驗證和管理功能，確保系統中每個導師都有唯一的標識符。

## 功能特性

### ✅ 主要功能
- **唯一 ID 生成**: 防止 tutorId 重複
- **多種格式支援**: 簡單格式 (TU0001) 和傳統格式 (AA0001)
- **格式驗證**: 確保生成的 ID 符合規範
- **批量修復**: 自動修復缺失的 tutorId
- **存在性檢查**: 驗證 tutorId 是否已存在

### 🔧 技術特點
- 防止無限循環的安全機制
- 完整的錯誤處理和日誌記錄
- 支援自定義 User 模型
- 非阻塞的異步操作

## 安裝和使用

### 1. 引入模組

```javascript
const { 
  generateUniqueTutorId, 
  generateTraditionalTutorId, 
  validateTutorId, 
  isTutorIdExists, 
  fixMissingTutorIds 
} = require('../utils/tutorUtils');
```

### 2. 基本使用

```javascript
// 生成簡單格式的 tutorId
const simpleId = await generateUniqueTutorId(User);
console.log(simpleId); // 例如: "TU0001"

// 生成傳統格式的 tutorId
const traditionalId = await generateTraditionalTutorId(User);
console.log(traditionalId); // 例如: "AA0001"

// 驗證格式
const isValid = validateTutorId("TU0001", "simple"); // true
const isValidTraditional = validateTutorId("AA0001", "traditional"); // true

// 檢查是否存在
const exists = await isTutorIdExists("TU0001", User); // true/false
```

## API 參考

### generateUniqueTutorId(UserModel)

生成簡單格式的唯一導師 ID。

**參數:**
- `UserModel` (Object, 可選): User 模型，預設為 `require('../models/User')`

**返回值:**
- `Promise<string>`: 唯一的 tutorId (格式: TU0001, TU0002, ...)

**範例:**
```javascript
const tutorId = await generateUniqueTutorId(User);
console.log(tutorId); // "TU0001"
```

### generateTraditionalTutorId(UserModel)

生成傳統格式的唯一導師 ID。

**參數:**
- `UserModel` (Object, 可選): User 模型，預設為 `require('../models/User')`

**返回值:**
- `Promise<string>`: 唯一的 tutorId (格式: AA0001, AA0002, ..., AB0001, ...)

**範例:**
```javascript
const tutorId = await generateTraditionalTutorId(User);
console.log(tutorId); // "AA0001"
```

### validateTutorId(tutorId, format)

驗證 tutorId 格式是否正確。

**參數:**
- `tutorId` (string): 要驗證的 tutorId
- `format` (string, 可選): 格式類型 ('simple' | 'traditional')，預設為 'simple'

**返回值:**
- `boolean`: 是否有效

**範例:**
```javascript
validateTutorId("TU0001", "simple"); // true
validateTutorId("AA0001", "traditional"); // true
validateTutorId("TU001", "simple"); // false (少一位數字)
validateTutorId("", "simple"); // false (空字符串)
```

### isTutorIdExists(tutorId, UserModel)

檢查指定的 tutorId 是否已存在於數據庫中。

**參數:**
- `tutorId` (string): 要檢查的 tutorId
- `UserModel` (Object, 可選): User 模型，預設為 `require('../models/User')`

**返回值:**
- `Promise<boolean>`: 是否存在

**範例:**
```javascript
const exists = await isTutorIdExists("TU0001", User);
console.log(exists); // true 或 false
```

### fixMissingTutorIds(UserModel, format)

批量修復缺失的 tutorId。

**參數:**
- `UserModel` (Object, 可選): User 模型，預設為 `require('../models/User')`
- `format` (string, 可選): 生成格式 ('simple' | 'traditional')，預設為 'simple'

**返回值:**
- `Promise<Object>`: 修復結果

**返回對象結構:**
```javascript
{
  success: boolean,        // 是否全部成功
  message: string,         // 結果訊息
  fixed: number,          // 成功修復的數量
  total: number,          // 總共需要修復的數量
  errors: Array           // 錯誤列表
}
```

**範例:**
```javascript
const result = await fixMissingTutorIds(User, 'simple');
console.log(result);
// {
//   success: true,
//   message: "修復完成，成功修復 5 個導師的 tutorId",
//   fixed: 5,
//   total: 5,
//   errors: []
// }
```

## 格式說明

### 簡單格式 (TU + 4位數字)
- **格式**: `TU` + 4位數字
- **範例**: TU0001, TU0002, TU1234, TU9999
- **優點**: 簡單易懂，容易記憶
- **容量**: 最多 9999 個導師

### 傳統格式 (2字母 + 4位數字)
- **格式**: 2個大寫字母 + 4位數字
- **範例**: AA0001, AA0002, ..., AB0001, ..., ZZ9999
- **優點**: 容量更大，支援更多導師
- **容量**: 最多 676 × 9999 = 6,759,324 個導師

## 使用場景

### 1. 新導師註冊
```javascript
const { generateUniqueTutorId } = require('../utils/tutorUtils');

// 在導師註冊流程中
const tutorId = await generateUniqueTutorId(User);
const newTutor = new User({
  name: '張老師',
  email: 'zhang@example.com',
  tutorId: tutorId,
  userType: 'tutor'
});
await newTutor.save();
```

### 2. 導師申請審核
```javascript
const { generateTraditionalTutorId } = require('../utils/tutorUtils');

// 在審核通過時分配 tutorId
const tutorId = await generateTraditionalTutorId(User);
await User.findByIdAndUpdate(userId, {
  userType: 'tutor',
  tutorId: tutorId,
  'tutorProfile.applicationStatus': 'approved'
});
```

### 3. 數據清理和修復
```javascript
const { fixMissingTutorIds } = require('../utils/tutorUtils');

// 批量修復缺失的 tutorId
const result = await fixMissingTutorIds(User, 'simple');
if (result.success) {
  console.log(`成功修復 ${result.fixed} 個導師的 tutorId`);
} else {
  console.log('修復過程中發生錯誤:', result.errors);
}
```

### 4. 格式驗證
```javascript
const { validateTutorId } = require('../utils/tutorUtils');

// 在 API 中驗證輸入
function validateTutorInput(tutorId) {
  if (!validateTutorId(tutorId, 'simple')) {
    throw new Error('無效的 tutorId 格式');
  }
}
```

## 測試

運行測試腳本來驗證所有功能：

```bash
cd backend
node scripts/testTutorUtils.js
```

測試腳本會執行以下測試：
1. 生成簡單格式 tutorId
2. 生成傳統格式 tutorId
3. 驗證各種格式的 tutorId
4. 檢查 tutorId 存在性
5. 批量修復缺失的 tutorId
6. 統計當前導師 tutorId 情況

## 錯誤處理

### 常見錯誤

1. **無法生成唯一 ID**
   ```
   Error: 無法生成唯一的 tutorId，請檢查數據庫狀態
   ```
   **解決方案**: 檢查數據庫連接和 User 模型

2. **tutorId 已達上限**
   ```
   Error: tutorId 已達上限 (ZZ9999)
   ```
   **解決方案**: 考慮使用簡單格式或重新設計 ID 系統

3. **數據庫連接錯誤**
   ```
   Error: Failed to check existing tutorId
   ```
   **解決方案**: 檢查數據庫連接和環境變數

### 最佳實踐

1. **在生產環境中使用**
   ```javascript
   try {
     const tutorId = await generateUniqueTutorId(User);
     // 使用生成的 tutorId
   } catch (error) {
     console.error('生成 tutorId 失敗:', error);
     // 處理錯誤
   }
   ```

2. **定期檢查和修復**
   ```javascript
   // 定期運行修復腳本
   const result = await fixMissingTutorIds(User, 'simple');
   if (!result.success) {
     // 發送警報或記錄錯誤
   }
   ```

3. **在 API 中驗證輸入**
   ```javascript
   if (!validateTutorId(req.body.tutorId, 'simple')) {
     return res.status(400).json({ error: '無效的 tutorId 格式' });
   }
   ```

## 遷移指南

### 從舊版本遷移

如果你之前使用的是其他 tutorId 生成方式，可以按以下步驟遷移：

1. **備份數據庫**
   ```bash
   mongodump --uri="your_mongodb_uri"
   ```

2. **運行修復腳本**
   ```javascript
   const { fixMissingTutorIds } = require('./utils/tutorUtils');
   await fixMissingTutorIds(User, 'simple'); // 或 'traditional'
   ```

3. **更新現有代碼**
   ```javascript
   // 舊代碼
   const tutorId = generateTutorId(); // 舊的生成方式
   
   // 新代碼
   const { generateUniqueTutorId } = require('./utils/tutorUtils');
   const tutorId = await generateUniqueTutorId(User);
   ```

## 版本歷史

- **v1.0.0**: 初始版本，支援簡單和傳統格式
- **v1.1.0**: 添加格式驗證和存在性檢查
- **v1.2.0**: 添加批量修復功能
- **v1.3.0**: 改進錯誤處理和日誌記錄

## 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個工具模組。

## 授權

本模組遵循 MIT 授權條款。 