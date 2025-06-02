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

    // 調用後端 API 發送驗證碼
    const backendUrl = process.env.BACKEND_API_URL || 'https://hi-hi-tutor-real-backend2.vercel.app/api';
    const backendResponse = await fetch(`${backendUrl}/auth/request-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: body.phone
      })
    });

    const data = await backendResponse.json();
    
    // 返回後端的響應
    return NextResponse.json(data, { status: backendResponse.status });
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