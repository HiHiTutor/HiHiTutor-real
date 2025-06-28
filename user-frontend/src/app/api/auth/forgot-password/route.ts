import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account } = body;

    if (!account) {
      return NextResponse.json(
        { success: false, message: '請提供 email 或電話號碼' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || '忘記密碼請求失敗' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('忘記密碼 API 錯誤:', error);
    return NextResponse.json(
      { success: false, message: '處理忘記密碼請求時發生錯誤' },
      { status: 500 }
    );
  }
} 