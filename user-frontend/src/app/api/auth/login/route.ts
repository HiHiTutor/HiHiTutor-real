import { NextResponse } from 'next/server';
import { login } from '@/services/authService';
import { LoginResponse } from '@/types/auth';

export async function POST(req: Request) {
  try {
    const { account, password } = await req.json();

    if (!account || !password) {
      return NextResponse.json(
        { status: 'error', message: '請提供帳號和密碼' },
        { status: 400 }
      );
    }

    const response = login(account, password);

    return NextResponse.json(response, {
      status: response.status === 'success' ? 200 : 401
    });
  } catch (error) {
    console.log('❌ 登入失敗：請求處理失敗');
    return NextResponse.json(
      { status: 'error', message: '請求處理失敗' },
      { status: 500 }
    );
  }
} 