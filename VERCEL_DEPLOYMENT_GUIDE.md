# Vercel 部署指南 - 地區數據庫

## 🚀 部署步驟

### 1. 準備 MongoDB 數據庫

#### 選項 A: MongoDB Atlas (推薦)
1. 前往 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 創建免費帳戶或登入現有帳戶
3. 創建新集群 (選擇免費層 M0)
4. 創建數據庫用戶和密碼
5. 獲取連接字符串

#### 選項 B: 本地 MongoDB
1. 安裝 MongoDB Community Server
2. 啟動 MongoDB 服務
3. 創建數據庫 `hihitutor`

### 2. 設置環境變量

在 Vercel 項目設置中添加以下環境變量：

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hihitutor?retryWrites=true&w=majority
```

**注意**: 將 `username`、`password`、`cluster` 替換為實際值

### 3. 部署到 Vercel

#### 方法 A: 使用 Vercel CLI
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署
vercel --prod
```

#### 方法 B: 使用 GitHub 集成
1. 將代碼推送到 GitHub
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中導入項目
3. 選擇 GitHub 倉庫
4. 配置環境變量
5. 部署

### 4. 初始化地區數據庫

部署完成後，運行初始化腳本：

```bash
# 方法 A: 通過 Vercel 函數
curl -X POST https://your-app.vercel.app/api/init-regions

# 方法 B: 本地運行
cd backend
node scripts/initRegions.js
```

## 📊 數據庫結構

### Region Collection
```javascript
{
  _id: ObjectId,
  value: "hong-kong-island",        // 地區值
  label: "香港島",                   // 地區標籤
  regions: [                        // 子地區數組
    {
      value: "central",             // 子地區值
      label: "中環"                 // 子地區標籤
    }
  ],
  isActive: true,                   // 是否啟用
  sortOrder: 2,                     // 排序順序
  createdAt: Date,                  // 創建時間
  updatedAt: Date                   // 更新時間
}
```

## 🔧 API 端點

### 獲取所有地區
```
GET /api/regions
```

### 根據地區值獲取標籤
```
GET /api/regions/label/:value
```

### 根據子地區值獲取標籤
```
GET /api/regions/subregion/label/:value
```

## 📋 地區數據

### 香港島 (hong-kong-island)
- 中環 (central)
- 上環 (sheung-wan)
- 西環 (sai-wan)
- 西營盤 (sai-ying-pun)
- 石塘咀 (shek-tong-tsui)
- 灣仔 (wan-chai)
- 銅鑼灣 (causeway-bay)
- 金鐘 (admiralty)
- 跑馬地 (happy-valley)
- 天后 (tin-hau)
- 大坑 (tai-hang)
- 北角 (north-point)
- 鰂魚涌 (quarry-bay)
- 太古 (taikoo)
- 西灣河 (sai-wan-ho)
- 筲箕灣 (shau-kei-wan)
- 柴灣 (chai-wan)
- 杏花邨 (heng-fa-chuen)

### 九龍 (kowloon)
- 尖沙咀 (tsim-sha-tsui)
- 佐敦 (jordan)
- 油麻地 (yau-ma-tei)
- 旺角 (mong-kok)
- 太子 (prince-edward)
- 深水埗 (sham-shui-po)
- 長沙灣 (cheung-sha-wan)
- 紅磡 (hung-hom)
- 土瓜灣 (to-kwa-wan)
- 何文田 (ho-man-tin)
- 九龍塘 (kowloon-tong)
- 新蒲崗 (san-po-kong)
- 鑽石山 (diamond-hill)
- 樂富 (lok-fu)
- 慈雲山 (tsz-wan-shan)
- 牛頭角 (ngau-tau-kok)
- 藍田 (lam-tin)
- 觀塘 (kwun-tong)
- 油塘 (yau-tong)

### 新界 (new-territories)
- 沙田 (sha-tin)
- 馬鞍山 (ma-on-shan)
- 大圍 (tai-wai)
- 火炭 (fo-tan)
- 大埔 (tai-po)
- 太和 (tai-wo)
- 粉嶺 (fan-ling)
- 上水 (sheung-shui)
- 將軍澳 (tseung-kwan-o)
- 坑口 (hang-hau)
- 寶琳 (po-lam)
- 康城 (lohas-park)
- 屯門 (tuen-mun)
- 兆康 (siu-hong)
- 元朗 (yuen-long)
- 朗屏 (long-ping)
- 天水圍 (tin-shui-wai)
- 荃灣 (tsuen-wan)
- 葵芳 (kwai-fong)
- 葵涌 (kwai-chung)
- 青衣 (tsing-yi)

### 離島 (islands)
- 東涌 (tung-chung)
- 梅窩 (mui-wo)
- 大澳 (tai-o)
- 坪洲 (ping-chau)
- 長洲 (cheung-chau)
- 南丫島 (lamma-island)
- 愉景灣 (discovery-bay)
- 貝澳 (pui-o)

## 🧪 測試

### 測試 API 連接
```bash
curl https://your-app.vercel.app/api/regions
```

### 測試地區標籤
```bash
curl https://your-app.vercel.app/api/regions/label/hong-kong-island
# 應該返回: {"success":true,"data":{"value":"hong-kong-island","label":"香港島"}}
```

### 測試子地區標籤
```bash
curl https://your-app.vercel.app/api/regions/subregion/label/central
# 應該返回: {"success":true,"data":{"parentRegion":{"value":"hong-kong-island","label":"香港島"},"subRegion":{"value":"central","label":"中環"}}}
```

## 🚨 故障排除

### 常見問題

1. **MongoDB 連接失敗**
   - 檢查 MONGODB_URI 環境變量
   - 確認 MongoDB 服務正在運行
   - 檢查防火牆設置

2. **API 返回備用數據**
   - 檢查數據庫是否已初始化
   - 運行初始化腳本

3. **部署失敗**
   - 檢查 vercel.json 配置
   - 確認所有依賴已安裝
   - 檢查 Node.js 版本

### 日誌查看
```bash
vercel logs your-app-name
```

## 📞 支持

如果遇到問題，請檢查：
1. Vercel 部署日誌
2. MongoDB 連接狀態
3. 環境變量設置
4. API 端點響應

## 🔄 更新數據

要更新地區數據，可以：
1. 修改 `backend/scripts/initRegions.js`
2. 重新運行初始化腳本
3. 或者通過 API 直接更新數據庫
