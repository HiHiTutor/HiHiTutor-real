'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();

  useEffect(() => {
    // 立即重定向到 WhatsApp
    window.location.href = 'https://wa.me/85295011159';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">正在重定向...</h1>
        <p className="text-gray-600">正在為您跳轉到 WhatsApp 聯絡頁面</p>
        <p className="text-sm text-gray-500 mt-2">
          如果沒有自動跳轉，請
          <a 
            href="https://wa.me/85295011159" 
            className="text-blue-600 hover:text-blue-800 ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            點擊這裡
          </a>
        </p>
      </div>
    </div>
  );
} 