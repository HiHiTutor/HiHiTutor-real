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

    // 使用相對路徑
    const apiUrl = '/api/auth/request-verification-code';
    console.log('🌐 請求後端 API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    console.log('📥 後端回應狀態:', response.status);
    
    let data;
    try {
      data = await response.json();
      console.log('📦 後端回應內容:', data);
    } catch (error) {
      console.error('❌ 解析後端回應失敗:', error);
      return NextResponse.json(
        { success: false, message: '無法解析後端回應' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('❌ 後端 API 錯誤:', data);
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || '發送驗證碼時發生錯誤',
          action: data.action,
          options: data.options
        },
        { status: response.status }
      );
    }

    console.log('✅ 驗證碼請求成功');
    return NextResponse.json(data);
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