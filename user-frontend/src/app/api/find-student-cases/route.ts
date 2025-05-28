import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    
    // 在 Vercel 無伺服器環境中，process.env.NEXT_PUBLIC_API_BASE 可能不可用
    // 所以我們需要硬編碼後端 URL 或使用運行時環境變數
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 
                      process.env.API_BASE || 
                      'https://hi-hi-tutor-real-backend2.vercel.app';
    
    // 確保 backendUrl 不以斜線結尾
    const cleanBackendUrl = backendUrl.replace(/\/$/, '');
    const apiUrl = `${cleanBackendUrl}/api/find-student-cases${queryString ? `?${queryString}` : ''}`;
    
    console.log('🚀 Backend URL:', backendUrl);
    console.log('🚀 Full API URL:', apiUrl);
    console.log('🚀 Query string:', queryString);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // 確保不使用緩存
    });

    console.log('📥 Backend response status:', response.status);
    console.log('📥 Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          message: '後端 API 回應錯誤',
          error: `HTTP ${response.status}: ${errorText}`,
          backendUrl: cleanBackendUrl,
          timestamp: new Date().toISOString()
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Backend response data keys:', Object.keys(data));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching student cases:', error);
    
    // 提供更詳細的錯誤信息
    const errorDetails = {
      success: false,
      message: '獲取學生案例時發生錯誤',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString(),
      environment: {
        NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
        API_BASE: process.env.API_BASE,
        NODE_ENV: process.env.NODE_ENV
      }
    };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
} 