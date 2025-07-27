import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';

// 強制動態渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    console.log('🔍 前端 API 路由 - 接收到的 token:', token ? '存在' : '不存在');
    
    if (!token) {
      console.log('❌ 前端 API 路由 - 沒有 token');
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    console.log('🚀 前端 API 路由 - 轉發請求到後端:', `${BACKEND_URL}/api/tutors/profile`);

    const response = await fetch(`${BACKEND_URL}/api/tutors/profile`, {
      headers: {
        'Authorization': token, // 直接傳遞完整的 Authorization header
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 前端 API 路由 - 後端回應狀態:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ 前端 API 路由 - 後端回應錯誤:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ 前端 API 路由 - 成功獲取資料');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 前端 API 路由 - 錯誤:', error);
    return NextResponse.json(
      { error: '獲取導師資料失敗' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/tutors/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    return NextResponse.json(
      { error: '更新導師資料失敗' },
      { status: 500 }
    );
  }
} 