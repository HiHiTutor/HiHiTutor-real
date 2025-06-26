const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 開始簡化部署流程');
console.log('📋 項目: hi-hi-tutor-real-backend2');
console.log('');

// 檢查是否在正確的目錄
if (!fs.existsSync('app.js')) {
  console.error('❌ 請在 backend 目錄中運行此腳本');
  process.exit(1);
}

try {
  // 檢查 Vercel 登入狀態
  console.log('🔍 檢查 Vercel 登入狀態...');
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ 已登入 Vercel');
  } catch (error) {
    console.log('❌ 未登入 Vercel，請先登入');
    console.log('💡 請運行: vercel login');
    console.log('📝 或者使用 token: vercel --token YOUR_TOKEN');
    process.exit(1);
  }

  // 檢查環境變數
  console.log('🔍 檢查環境變數...');
  try {
    const envList = execSync('vercel env ls', { stdio: 'pipe', encoding: 'utf8' });
    if (envList.includes('MONGODB_URI')) {
      console.log('✅ MONGODB_URI 環境變數已設置');
    } else {
      console.log('⚠️ MONGODB_URI 環境變數未設置');
      console.log('💡 請在 Vercel Dashboard 中設置:');
      console.log('1. 前往 https://vercel.com/dashboard');
      console.log('2. 選擇項目: hi-hi-tutor-real-backend2');
      console.log('3. 進入 Settings > Environment Variables');
      console.log('4. 添加變數: MONGODB_URI');
      console.log('5. 值: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
      console.log('6. 選擇環境: Production, Preview, Development');
    }
  } catch (error) {
    console.log('⚠️ 無法檢查環境變數:', error.message);
  }

  // 部署到 Vercel
  console.log('🚀 開始部署...');
  console.log('📤 部署到 Vercel (Production)...');
  
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('✅ 部署完成！');
  
} catch (error) {
  console.error('❌ 部署失敗:', error.message);
  process.exit(1);
} 