import { NextRequest, NextResponse } from 'next/server';

// 強制動態渲染，因為此路由使用 request.headers
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const response = await fetch(`${BACKEND_URL}/api/users/${params.id}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: '頭像上傳失敗' },
      { status: 500 }
    );
  }
} 