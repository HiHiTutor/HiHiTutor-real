import { NextResponse } from 'next/server';
import { verifyCode } from '@/services/verificationService';

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    
    if (!phone || !code) {
      console.log('❌ 驗證失敗：缺少參數');
      return NextResponse.json(
        { status: 'error', message: '缺少參數' },
        { status: 400 }
      );
    }

    const response = verifyCode(phone, code);

    // 在開發環境中顯示驗證結果
    if (process.env.NODE_ENV === 'development') {
      if (response.status === 'success') {
        console.log(`✅ 驗證成功：${phone}`);
      } else {
        console.log(`❌ 驗證失敗：${response.message}`);
      }
    }

    return NextResponse.json(response, { status: response.status === 'success' ? 200 : 400 });
  } catch (error) {
    console.log('❌ 驗證失敗：請求處理失敗');
    return NextResponse.json(
      { status: 'error', message: '請求處理失敗' },
      { status: 500 }
    );
  }
} 