const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  project: "hi-hi-tutor-real-backend2",
  envVar: {
    key: "MONGODB_URI",
    expectedPrefix: "mongodb+srv://"
  },
  fallbackUri: "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority",
  redeployIfUpdated: true,
  testConnection: true
};

// 檢查 Vercel CLI 是否安裝
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI 已安裝');
    return true;
  } catch (error) {
    console.log('❌ Vercel CLI 未安裝，正在安裝...');
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI 安裝成功');
      return true;
    } catch (installError) {
      console.error('❌ Vercel CLI 安裝失敗:', installError.message);
      return false;
    }
  }
}

// 檢查環境變數
function checkEnvironmentVariable() {
  console.log(`🔍 檢查環境變數: ${config.envVar.key}`);
  
  try {
    // 檢查本地環境變數
    const envValue = process.env[config.envVar.key];
    
    if (envValue) {
      console.log(`📋 本地環境變數 ${config.envVar.key}: ${envValue.substring(0, 20)}...`);
      
      if (envValue.startsWith(config.envVar.expectedPrefix)) {
        console.log('✅ 本地環境變數格式正確');
        return envValue;
      } else {
        console.log('⚠️ 本地環境變數格式不正確');
      }
    } else {
      console.log('⚠️ 本地環境變數未設置');
    }
    
    // 檢查 Vercel 環境變數
    console.log('🔍 檢查 Vercel 環境變數...');
    const vercelEnv = execSync(`vercel env ls ${config.envVar.key}`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    if (vercelEnv.includes(config.envVar.key)) {
      console.log('✅ Vercel 環境變數已設置');
      return 'vercel_env_set';
    } else {
      console.log('❌ Vercel 環境變數未設置');
      return null;
    }
    
  } catch (error) {
    console.log('❌ 檢查環境變數時發生錯誤:', error.message);
    return null;
  }
}

// 設置環境變數
function setEnvironmentVariable() {
  console.log(`🔧 設置環境變數: ${config.envVar.key}`);
  
  if (!config.fallbackUri.includes('<username>')) {
    console.log('⚠️ 請提供有效的 MongoDB URI');
    console.log(`📝 預期格式: ${config.fallbackUri}`);
    return false;
  }
  
  try {
    // 提示用戶輸入 MongoDB URI
    console.log('📝 請輸入 MongoDB URI:');
    console.log('格式: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    
    // 這裡需要用戶手動輸入，所以我們提供指導
    console.log('💡 請在 Vercel Dashboard 中設置環境變數:');
    console.log(`1. 前往 https://vercel.com/dashboard`);
    console.log(`2. 選擇項目: ${config.project}`);
    console.log(`3. 進入 Settings > Environment Variables`);
    console.log(`4. 添加變數: ${config.envVar.key}`);
    console.log(`5. 值: 你的 MongoDB URI`);
    console.log(`6. 選擇環境: Production, Preview, Development`);
    
    return false;
  } catch (error) {
    console.error('❌ 設置環境變數時發生錯誤:', error.message);
    return false;
  }
}

// 測試 MongoDB 連接
function testMongoDBConnection() {
  if (!config.testConnection) {
    console.log('⏭️ 跳過連接測試');
    return true;
  }
  
  console.log('🔍 測試 MongoDB 連接...');
  
  try {
    // 創建臨時測試腳本
    const testScript = `
      const mongoose = require('mongoose');
      require('dotenv').config();
      
      (async () => {
        try {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          console.log('✅ MongoDB 連接成功');
          await mongoose.disconnect();
          process.exit(0);
        } catch (error) {
          console.error('❌ MongoDB 連接失敗:', error.message);
          process.exit(1);
        }
      })();
    `;
    
    fs.writeFileSync('temp_mongo_test.js', testScript);
    
    execSync('node temp_mongo_test.js', { stdio: 'inherit' });
    
    // 清理臨時文件
    fs.unlinkSync('temp_mongo_test.js');
    
    console.log('✅ MongoDB 連接測試成功');
    return true;
  } catch (error) {
    console.error('❌ MongoDB 連接測試失敗:', error.message);
    return false;
  }
}

// 重新部署
function redeploy() {
  if (!config.redeployIfUpdated) {
    console.log('⏭️ 跳過重新部署');
    return true;
  }
  
  console.log('🚀 開始重新部署...');
  
  try {
    // 檢查是否在正確的目錄
    if (!fs.existsSync('app.js')) {
      console.error('❌ 請在 backend 目錄中運行此腳本');
      return false;
    }
    
    // 部署到 Vercel
    console.log('📤 部署到 Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('✅ 部署成功');
    return true;
  } catch (error) {
    console.error('❌ 部署失敗:', error.message);
    return false;
  }
}

// 主函數
async function main() {
  console.log('🚀 開始檢查環境變數並重新部署');
  console.log(`📋 項目: ${config.project}`);
  console.log(`🔑 環境變數: ${config.envVar.key}`);
  console.log('');
  
  // 檢查 Vercel CLI
  if (!checkVercelCLI()) {
    return;
  }
  
  // 檢查環境變數
  const envValue = checkEnvironmentVariable();
  
  if (!envValue) {
    console.log('⚠️ 環境變數未正確設置');
    if (!setEnvironmentVariable()) {
      console.log('❌ 無法設置環境變數，請手動設置後重新運行');
      return;
    }
  }
  
  // 測試連接
  if (!testMongoDBConnection()) {
    console.log('❌ MongoDB 連接測試失敗，請檢查 URI');
    return;
  }
  
  // 重新部署
  if (!redeploy()) {
    console.log('❌ 重新部署失敗');
    return;
  }
  
  console.log('🎉 所有步驟完成！');
}

// 運行主函數
main().catch(console.error); 