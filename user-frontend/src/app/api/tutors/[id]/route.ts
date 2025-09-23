import { NextRequest, NextResponse } from 'next/server';

// 強制動態渲染
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
    
    console.log('🔍 代理導師詳情請求:', `${baseURL}/api/tutors/detail/${id}`);
    console.log('🌐 環境變數 NEXT_PUBLIC_API_BASE:', process.env.NEXT_PUBLIC_API_BASE);
    console.log('🔗 使用的 baseURL:', baseURL);
    
    const response = await fetch(`${baseURL}/api/tutors/detail/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📊 後端響應狀態:', response.status);
    console.log('📊 後端響應標頭:', Object.fromEntries(response.headers.entries()));

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