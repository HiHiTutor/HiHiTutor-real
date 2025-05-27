import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('📥 收到註冊請求');
    const body = await req.json();
    console.log('📦 註冊資料:', body);

    // 驗證必要欄位
    const requiredFields = ['name', 'email', 'phone', 'password', 'userType', 'token'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ 缺少必要欄位:', missingFields);
      return NextResponse.json(
        { success: false, message: `缺少必要欄位: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 驗證臨時令牌
    if (!body.token.startsWith('temp_token_')) {
      console.log('❌ 無效的臨時令牌');
      return NextResponse.json(
        { success: false, message: '無效的臨時令牌' },
        { status: 400 }
      );
    }

    // 模擬註冊成功
    console.log('✅ 註冊成功');
    return NextResponse.json({
      success: true,
      message: '註冊成功',
      user: {
        id: 'user_' + Date.now(),
        name: body.name,
        email: body.email,
        phone: body.phone,
        userType: body.userType
      }
    });
  } catch (error) {
    console.error('❌ 註冊失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '註冊時發生錯誤'
      },
      { status: 500 }
    );
  }
} 