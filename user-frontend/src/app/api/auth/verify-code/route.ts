import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('📥 收到驗證碼驗證請求');
    const body = await req.json();
    console.log('📦 請求內容:', body);
    
    if (!body.phone || !body.code) {
      console.log('❌ 缺少電話號碼或驗證碼');
      return NextResponse.json(
        { success: false, message: '請提供電話號碼和驗證碼' },
        { status: 400 }
      );
    }

    // 模擬驗證碼驗證
    console.log(`[SMS] 模擬驗證碼 ${body.code} 到 ${body.phone}`);
    
    // 生成正確格式的臨時令牌
    const token = `TEMP-REGISTER-TOKEN-${Math.random().toString(36).substring(2, 15)}`;
    
    // 返回成功響應
    return NextResponse.json({
      success: true,
      message: '驗證成功',
      token
    });
  } catch (error) {
    console.error('❌ 驗證碼驗證失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '驗證碼驗證時發生錯誤'
      },
      { status: 500 }
    );
  }
} 