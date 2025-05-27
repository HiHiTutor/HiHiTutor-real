import { NextResponse } from 'next/server';

// 生成6位數驗證碼
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    console.log('📥 收到驗證碼請求');
    const body = await req.json();
    console.log('📦 請求內容:', body);
    
    if (!body.phone) {
      console.log('❌ 缺少電話號碼');
      return NextResponse.json(
        { success: false, message: '請提供電話號碼' },
        { status: 400 }
      );
    }

    // 生成驗證碼
    const code = generateVerificationCode();
    console.log(`[SMS] 模擬發送驗證碼到 ${body.phone}，驗證碼：${code}`);
    
    // 返回成功響應，包含驗證碼（僅用於開發環境）
    return NextResponse.json({
      success: true,
      message: '驗證碼已發送',
      code: code // 在開發環境中返回驗證碼
    });
  } catch (error) {
    console.error('❌ 驗證碼請求失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '發送驗證碼時發生錯誤'
      },
      { status: 500 }
    );
  }
} 