// 強制動態渲染
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/faqs`, { cache: 'no-store' });
    const data = await backendRes.json();
    return new Response(JSON.stringify(data), {
      status: backendRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Proxy 失敗', error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 