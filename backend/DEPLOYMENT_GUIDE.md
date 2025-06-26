# HiHiTutor Backend 部署指南

## 項目信息
- **項目名稱**: hi-hi-tutor-real-backend2
- **平台**: Vercel
- **主要文件**: app.js

## 部署步驟

### 1. 環境變數設置

在 Vercel Dashboard 中設置以下環境變數：

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇項目: `hi-hi-tutor-real-backend2`
3. 進入 `Settings` > `Environment Variables`
4. 添加以下變數：

| 變數名稱 | 值 | 環境 |
|---------|----|------|
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority` | Production, Preview, Development |

### 2. 手動部署

#### 方法一：使用 Vercel CLI
```bash
# 登入 Vercel
vercel login

# 部署到生產環境
vercel --prod
```

#### 方法二：使用 GitHub 自動部署
1. 推送代碼到 GitHub
2. Vercel 會自動檢測並部署

### 3. 驗證部署

部署完成後，檢查以下端點：

- **健康檢查**: `https://hi-hi-tutor-real-backend2.vercel.app/api/health`
- **導師 API**: `https://hi-hi-tutor-real-backend2.vercel.app/api/tutors`
- **搜索 API**: `https://hi-hi-tutor-real-backend2.vercel.app/api/search`

### 4. 常見問題

#### MongoDB 連接問題
- 確保 `MONGODB_URI` 格式正確
- 檢查 MongoDB Atlas 網絡訪問設置
- 確認用戶名和密碼正確

#### 部署失敗
- 檢查 `app.js` 語法錯誤
- 確認所有依賴都已安裝
- 查看 Vercel 部署日誌

### 5. 當前狀態

✅ **已完成**:
- 移除不支援的 MongoDB 選項 (`bufferMaxEntries`)
- 升級 5 位導師為 featured (isTop: true)
- 修復 API 路由和控制器
- 添加 MongoDB 連接狀態檢查

🔄 **待處理**:
- 設置 MongoDB URI 環境變數
- 重新部署到 Vercel

### 6. 快速部署命令

```bash
# 在 backend 目錄中運行
cd backend
vercel --prod
```

### 7. 環境變數模板

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority
```

## 聯繫支持

如果遇到問題，請檢查：
1. Vercel 部署日誌
2. MongoDB Atlas 連接狀態
3. 環境變數設置 