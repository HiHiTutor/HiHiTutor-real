import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hihitutoredu:HKP-01668@hihitutorcluster.1scf1xj.mongodb.net/HiHiTutorReally?retryWrites=true&w=majority&appName=HiHiTutorCluster';

export async function POST(req: Request) {
  let client: MongoClient | null = null;
  
  try {
    console.log('📥 收到註冊請求');
    const body = await req.json();
    console.log('📦 註冊資料:', body);

    // 驗證必要欄位
    const requiredFields = ['name', 'email', 'phone', 'password', 'userType', 'token'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ 缺少必要欄位:', missingFields);
      return NextResponse.json(
        { success: false, message: `缺少必要欄位: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 驗證臨時令牌
    if (!body.token.startsWith('temp_token_')) {
      console.log('❌ 無效的臨時令牌');
      return NextResponse.json(
        { success: false, message: '無效的臨時令牌' },
        { status: 400 }
      );
    }

    // 連接到 MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ 已連接到 MongoDB');

    const db = client.db('HiHiTutorReally');
    const usersCollection = db.collection('users');

    // 檢查用戶是否已存在
    const existingUser = await usersCollection.findOne({
      $or: [
        { email: body.email },
        { phone: body.phone }
      ]
    });

    if (existingUser) {
      console.log('❌ 用戶已存在');
      return NextResponse.json(
        { 
          success: false, 
          message: '此電子郵件或電話號碼已被註冊',
          action: 'user-exists'
        },
        { status: 400 }
      );
    }

    // 創建新用戶
    const newUser = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password, // 注意：在實際應用中應該加密密碼
      userType: body.userType,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    console.log('✅ 用戶已成功創建:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: '註冊成功！請前往登入頁面',
      user: {
        id: result.insertedId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        userType: body.userType
      }
    });
  } catch (error) {
    console.error('❌ 註冊失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '註冊時發生錯誤'
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
      console.log('✅ MongoDB 連接已關閉');
    }
  }
} 