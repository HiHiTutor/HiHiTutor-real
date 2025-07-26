'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: identifier }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('重設密碼連結已發送到您的電郵信箱。');
      } else {
        setMessage(data.message || '請填寫正確登入資訊');
      }
    } catch (error) {
      setMessage('發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">忘記密碼</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              請輸入您的電子郵件
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? '處理中...' : '重設密碼'}
          </button>
          {message && <p className="text-center text-sm text-gray-600">{message}</p>}
          <div className="text-center">
            <Link href="/login" className="text-blue-500 hover:underline">
              返回登入
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 