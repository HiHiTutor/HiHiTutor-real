import mongoose from 'mongoose';
import StudentCase from '../../../../../../backend/models/StudentCase';

export async function GET(req: Request) {
  try {
    // 連接 MongoDB（如已連線會自動跳過）
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // 解析查詢參數
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    let query: any = {};
    if (featured === 'true') query.featured = true;

    const allCases = await StudentCase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 0);

    return new Response(JSON.stringify({
      success: true,
      data: {
        cases: allCases,
        total: allCases.length
      },
      message: '成功獲取學生案例列表'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching student cases:', error);
    return new Response(JSON.stringify({ success: false, message: '獲取學生案例時發生錯誤' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 