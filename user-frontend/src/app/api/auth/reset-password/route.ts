import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: '請提供 token 及新密碼' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || '重設密碼失敗' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('重設密碼 API 錯誤:', error);
    return NextResponse.json(
      { success: false, message: '重設密碼時發生錯誤' },
      { status: 500 }
    );
  }
} 