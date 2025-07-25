import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
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
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: '文件上傳失敗' },
      { status: 500 }
    );
  }
} 