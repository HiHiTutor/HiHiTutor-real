import { NextRequest, NextResponse } from 'next/server';

// 強制動態渲染，因為此路由使用 request.headers
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tutorId: string } }
) {
  try {
    const { tutorId } = params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供認證令牌' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/organization-tutors/${tutorId}/toggle-public`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error toggling tutor public status:', error);
    return NextResponse.json(
      { error: '切換導師公開狀態失敗' },
      { status: 500 }
    );
  }
} 