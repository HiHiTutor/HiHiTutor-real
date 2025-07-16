import { NextRequest, NextResponse } from 'next/server';

// 強制動態渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
    
    // 構建查詢參數
    const queryString = searchParams.toString();
    const apiUrl = `${baseURL}/api/tutors${queryString ? `?${queryString}` : ''}`;
    
    console.log('🔍 代理導師列表請求:', apiUrl);
    console.log('🌐 環境變數 NEXT_PUBLIC_API_BASE:', process.env.NEXT_PUBLIC_API_BASE);
    console.log('🔗 使用的 baseURL:', baseURL);
    console.log('📋 查詢參數:', Object.fromEntries(searchParams.entries()));
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📊 後端響應狀態:', response.status);
    console.log('📊 後端響應標頭:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '無法解析回應' }));
      console.error('❌ 後端 API 錯誤:', errorData);
      return NextResponse.json(
        { success: false, message: errorData.message || '獲取導師列表失敗' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 導師列表回應:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 代理請求錯誤:', error);
    return NextResponse.json(
      { success: false, message: '內部服務器錯誤' },
      { status: 500 }
    );
  }
} 