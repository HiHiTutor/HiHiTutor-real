'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteTracePage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('🧨 ROUTE TRACE ACTIVATED');
    console.log('📍 Current pathname:', pathname);
    console.log('🔍 Search params:', Object.fromEntries(searchParams.entries()));
    console.log('📁 Component: src/app/route-trace/page.tsx');
    console.log('⏰ Timestamp:', new Date().toISOString());
  }, [pathname, searchParams]);

  return (
    <div className="p-8 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
      <h1 className="text-2xl font-bold text-yellow-800 mb-4">🧨 路由追蹤工具</h1>
      <div className="space-y-2 text-sm">
        <p><strong>當前路徑:</strong> {pathname}</p>
        <p><strong>搜尋參數:</strong> {JSON.stringify(Object.fromEntries(searchParams.entries()))}</p>
        <p><strong>組件檔案:</strong> src/app/route-trace/page.tsx</p>
        <p><strong>時間戳:</strong> {new Date().toISOString()}</p>
      </div>
      <div className="mt-4 p-4 bg-white rounded border">
        <h2 className="font-bold mb-2">路由測試連結:</h2>
        <div className="space-y-2">
          <a href="/find-tutor-cases" className="block text-blue-600 hover:underline">/find-tutor-cases</a>
          <a href="/find-student-cases" className="block text-blue-600 hover:underline">/find-student-cases</a>
          <a href="/testlog" className="block text-blue-600 hover:underline">/testlog</a>
        </div>
      </div>
    </div>
  );
} 