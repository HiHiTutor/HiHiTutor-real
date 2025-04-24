import { NextResponse } from 'next/server';
import { requestVerificationCode } from '@/services/verificationService';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    
    if (!phone) {
      return NextResponse.json(
        { status: 'error', message: '請提供電話號碼' },
        { status: 400 }
      );
    }

    const response = requestVerificationCode(phone);

    // 在開發環境中顯示驗證碼
    if (process.env.NODE_ENV === 'development') {
      console.log(`📨 驗證碼已發送至 ${phone}，驗證碼為：${response.code}`);
    }

    // 根據環境決定是否回傳驗證碼
    return NextResponse.json({
      status: 'success',
      message: `驗證碼已發送至 ${phone}`,
      retryAfter: 90,
      ...(process.env.NODE_ENV === 'development' ? { code: response.code } : {})
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: '請求處理失敗' },
      { status: 500 }
    );
  }
} 