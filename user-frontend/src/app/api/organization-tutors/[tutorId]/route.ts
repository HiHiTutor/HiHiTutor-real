import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://hi-hi-tutor-real-backend2.vercel.app';

export async function PUT(
  request: NextRequest,
  { params }: { params: { tutorId: string } }
) {
  try {
    const { tutorId } = params;
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供認證令牌' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/organization-tutors/${tutorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating organization tutor:', error);
    return NextResponse.json(
      { error: '更新機構導師失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const response = await fetch(`${BACKEND_URL}/api/organization-tutors/${tutorId}`, {
      method: 'DELETE',
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
    console.error('Error deleting organization tutor:', error);
    return NextResponse.json(
      { error: '刪除機構導師失敗' },
      { status: 500 }
    );
  }
} 