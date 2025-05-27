import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 使用完整的後端 API URL
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/request-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error requesting verification code:', error);
    return NextResponse.json(
      { success: false, message: '發送驗證碼時發生錯誤' },
      { status: 500 }
    );
  }
} 