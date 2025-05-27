import { NextResponse } from 'next/server';

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

    // 模擬發送驗證碼
    console.log(`[SMS] 模擬發送驗證碼到 ${body.phone}`);
    
    // 返回成功響應
    return NextResponse.json({
      success: true,
      message: '驗證碼已發送'
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