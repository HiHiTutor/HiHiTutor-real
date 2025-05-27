import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    
    // 使用相對路徑，讓 Next.js 的 rewrites 處理
    const response = await fetch(`/api/find-student-cases${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching student cases:', error);
    return NextResponse.json(
      { success: false, message: '獲取學生案例時發生錯誤' },
      { status: 500 }
    );
  }
} 