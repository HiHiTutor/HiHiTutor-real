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

    // 調用後端 API 進行驗證
    const backendUrl = process.env.BACKEND_API_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';
    const backendResponse = await fetch(`${backendUrl}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: body.phone,
        code: body.code
      })
    });

    const data = await backendResponse.json();
    
    // 返回後端的響應
    return NextResponse.json(data, { status: backendResponse.status });
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