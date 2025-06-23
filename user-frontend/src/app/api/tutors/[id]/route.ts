import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
    
    console.log('🔍 代理導師詳情請求:', `${baseURL}/api/tutors/${id}`);
    
    const response = await fetch(`${baseURL}/api/tutors/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '無法解析回應' }));
      console.error('❌ 後端 API 錯誤:', errorData);
      return NextResponse.json(
        { success: false, message: errorData.message || '獲取導師詳情失敗' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 導師詳情回應:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 代理請求錯誤:', error);
    return NextResponse.json(
      { success: false, message: '內部服務器錯誤' },
      { status: 500 }
    );
  }
} 