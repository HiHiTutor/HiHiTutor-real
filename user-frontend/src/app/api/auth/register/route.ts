import { NextResponse } from 'next/server';
import { isTokenValid, getTokenPhone, markTokenAsUsed } from '@/services/verificationService';
import { registerUser } from '@/services/userService';
import { RegisterFormData } from '@/types/auth';

export async function POST(req: Request) {
  try {
    const data: RegisterFormData = await req.json();
    const { token } = data;

    console.log("📥 用戶提交的註冊令牌：", token);

    // 驗證 token
    if (!token || !isTokenValid(token)) {
      console.log('❌ 註冊失敗：無效的註冊令牌');
      return NextResponse.json(
        { status: 'error', message: '無效的註冊令牌' },
        { status: 401 }
      );
    }

    // 獲取 token 對應的電話號碼
    const phone = getTokenPhone(token);
    if (!phone) {
      console.log('❌ 註冊失敗：無法獲取電話號碼');
      return NextResponse.json(
        { status: 'error', message: '無效的註冊令牌' },
        { status: 401 }
      );
    }

    // 將電話號碼加入註冊資料
    data.phone = phone;

    // 註冊用戶
    const response = registerUser(data);

    if (response.status === 'success') {
      // 標記令牌為已使用
      markTokenAsUsed(token);
      console.log(`✅ 註冊成功：${phone}`);
    } else {
      console.log(`❌ 註冊失敗：${response.message}`);
    }

    return NextResponse.json(response, { 
      status: response.status === 'success' ? 200 : 400 
    });
  } catch (error) {
    console.log('❌ 註冊失敗：請求處理失敗');
    return NextResponse.json(
      { status: 'error', message: '請求處理失敗' },
      { status: 500 }
    );
  }
} 