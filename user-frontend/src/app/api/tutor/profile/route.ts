import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供認證令牌' },
        { status: 401 }
      );
    }

    const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';
    const apiUrl = `${baseURL}/api/tutors/profile`;
    
    console.log('🔍 代理導師資料更新請求:', apiUrl);
    console.log('📦 更新資料:', body);
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    console.log('📊 後端響應狀態:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '無法解析回應' }));
      console.error('❌ 後端 API 錯誤:', errorData);
      return NextResponse.json(
        { success: false, message: errorData.message || '更新導師資料失敗' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 導師資料更新回應:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 代理請求錯誤:', error);
    return NextResponse.json(
      { success: false, message: '內部服務器錯誤' },
      { status: 500 }
    );
  }
} 