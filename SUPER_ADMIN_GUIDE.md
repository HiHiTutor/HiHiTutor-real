# 超級管理員 (Super Admin) 功能指南

## 概述

HiHiTutor 系統現在支持三層權限管理：
1. **用戶 (User)** - 普通用戶
2. **管理員 (Admin)** - 系統管理員
3. **超級管理員 (Super Admin)** - 最高權限管理員

## 權限對比

| 功能 | 用戶 | 管理員 | 超級管理員 |
|------|------|--------|------------|
| 查看用戶列表 | ❌ | ✅ | ✅ |
| 管理普通用戶 | ❌ | ✅ | ✅ |
| 創建/管理管理員 | ❌ | ✅ | ✅ |
| 創建/管理超級管理員 | ❌ | ❌ | ✅ |
| 系統設置管理 | ❌ | ❌ | ✅ |
| 刪除管理員 | ❌ | ❌ | ✅ |
| 刪除用戶 | ❌ | ❌ | ✅ |

## 創建第一個超級管理員

### 方法 1: 使用腳本 (推薦)

```bash
cd backend
node scripts/createSuperAdmin.js
```

這將創建一個默認的超級管理員帳號：
- **Email**: superadmin@hihitutor.com
- **Phone**: 99999999
- **Password**: superadmin123

### 方法 2: 使用 API

```bash
curl -X POST http://localhost:3001/api/super-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "name": "Super Administrator",
    "email": "superadmin@hihitutor.com",
    "phone": "99999999",
    "password": "superadmin123"
  }'
```

## API 端點

### 超級管理員專用 API

- `POST /api/super-admin` - 創建超級管理員
- `GET /api/super-admin` - 獲取所有超級管理員
- `PUT /api/super-admin/:id` - 更新超級管理員
- `DELETE /api/super-admin/:id` - 刪除超級管理員

### 權限要求

所有超級管理員 API 都需要：
1. 有效的 JWT Token
2. 超級管理員權限

## 前端功能

### 登入支持

超級管理員可以使用與管理員相同的登入頁面，系統會自動識別權限級別。

### 用戶管理

在用戶詳情頁面，超級管理員可以：
- 將用戶升級為管理員
- 將用戶升級為超級管理員
- 管理所有類型的用戶
- **刪除用戶**（僅超級管理員專用功能）

### 角色顯示

系統會顯示用戶的角色：
- **用戶** - 普通用戶
- **管理員** - 系統管理員  
- **超級管理員** - 最高權限管理員

## 安全注意事項

1. **密碼安全**: 首次登入後請立即更改默認密碼
2. **權限控制**: 只有超級管理員可以創建其他超級管理員
3. **自我保護**: 超級管理員不能刪除自己的帳號
4. **刪除保護**: 超級管理員不能刪除其他超級管理員
5. **審計日誌**: 所有管理操作都會記錄在系統日誌中
6. **刪除確認**: 刪除用戶時需要填寫刪除原因並二次確認

## 數據庫結構

### User 模型更新

```javascript
role: {
  type: String,
  enum: ['user', 'admin', 'super_admin'],
  default: 'user'
},
userType: {
  type: String,
  enum: ['student', 'tutor', 'organization', 'admin', 'super_admin'],
  required: true
}
```

## 中間件更新

### 權限驗證

- `verifyAdmin` - 驗證管理員或超級管理員權限
- `verifySuperAdmin` - 驗證超級管理員權限
- `isAdmin` - 檢查是否為管理員或超級管理員
- `isSuperAdmin` - 檢查是否為超級管理員

## 故障排除

### 常見問題

1. **無法創建超級管理員**
   - 檢查當前用戶是否為超級管理員
   - 確認 API Token 有效

2. **登入失敗**
   - 確認用戶角色設置正確
   - 檢查數據庫中的用戶記錄

3. **權限不足**
   - 確認用戶的 role 和 userType 都設置為 'super_admin'
   - 檢查 JWT Token 是否包含正確的權限信息

### 日誌檢查

查看服務器日誌以獲取詳細的錯誤信息：

```bash
# 檢查管理員驗證日誌
grep "Admin 驗證" logs/app.log

# 檢查超級管理員驗證日誌  
grep "Super Admin 驗證" logs/app.log
```

## 更新日誌

- **2024-01-XX**: 初始版本，添加超級管理員功能
- 支持三層權限管理
- 添加超級管理員專用 API
- 更新前端權限檢查邏輯
- 添加權限管理 Hook 