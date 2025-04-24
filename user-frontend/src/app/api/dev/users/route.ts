import { NextResponse } from 'next/server';

export async function GET() {
  // 只在開發環境中允許訪問
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { status: 'error', message: '此 API 僅在開發環境中可用' },
      { status: 403 }
    );
  }

  // 獲取所有用戶資料
  const users = global.users ? 
    Object.fromEntries(global.users) : {};
  
  // 獲取所有訪問令牌
  const accessTokens = global.accessTokens ?
    Object.fromEntries(global.accessTokens) : {};

  return NextResponse.json({
    status: 'success',
    data: {
      users,
      accessTokens,
      totalUsers: Object.keys(users).length,
      totalTokens: Object.keys(accessTokens).length
    }
  });
} 