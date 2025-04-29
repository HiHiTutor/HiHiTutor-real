'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const TutorSection = () => {
  const router = useRouter();

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-12 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👩‍🏫</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">成為導師</h2>
      </div>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* 左側圖片 */}
          <div className="w-full md:w-1/2">
            <Image
              src="/tutor-hero.jpg"
              alt="成為導師"
              width={500}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
          
          {/* 右側文字內容 */}
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">加入我們的導師團隊</h3>
            <p className="text-gray-600">
              成為 HiHiTutor 的導師，分享你的專業知識，幫助學生實現學習目標。
              我們提供靈活的工作時間和豐厚的報酬。
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✨ 靈活的工作時間</li>
              <li>💰 豐厚的報酬</li>
              <li>📚 多元的教學機會</li>
              <li>👥 專業的教學平台</li>
            </ul>
            <button
              onClick={() => router.push('/register?role=tutor')}
              className="mt-4 bg-yellow-400 text-white px-6 py-2 rounded-lg hover:bg-yellow-500 transition-all"
            >
              立即申請成為導師
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorSection; 