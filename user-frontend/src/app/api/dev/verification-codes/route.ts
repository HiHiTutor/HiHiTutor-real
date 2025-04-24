import { NextResponse } from 'next/server';

export async function GET() {
  // 只在開發環境中允許訪問
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { status: 'error', message: '此 API 僅在開發環境中可用' },
      { status: 403 }
    );
  }

  // 獲取所有驗證碼和令牌的狀態
  const verificationCodes = global.verificationCodes ? 
    Object.fromEntries(global.verificationCodes) : {};
  
  const validRegisterTokens = global.validRegisterTokens ?
    Object.fromEntries(global.validRegisterTokens) : {};

  return NextResponse.json({
    status: 'success',
    data: {
      verificationCodes,
      validRegisterTokens
    }
  });
} 