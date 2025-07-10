'use client';

import { useState } from 'react';

const faqData = [
  {
    question: '如何成為 HiHiTutor 的導師？',
    answer: '您可以註冊成為學生帳號後，申請導師升級，提交學歷證明並通過審核，即可成為導師。',
  },
  {
    question: '如何發布找導師的個案？',
    answer: '登入後點擊「我要搵導師」，填寫您想找的科目、時間、地區等資料即可發布。',
  },
  {
    question: '如何支付學費？',
    answer: '學生與導師確認上課後，平台會提供安全的支付方式，保障雙方利益。',
  },
  {
    question: '如果對導師不滿意怎麼辦？',
    answer: '如學生對導師不滿意，可向我們客服反映，我們會協助處理及重新配對。',
  },
  {
    question: '如何確保導師的教學品質？',
    answer: '我們設有嚴格的導師審核制度及用戶評價機制，確保導師具備教學能力。',
  },
  {
    question: '關於我們',
    answer: `
HiHiTutor 致力於為學生和導師搭建最優質的教學平台

【我們的使命】
- 為學生提供最適合的導師配對
- 為導師創造公平的教學機會
- 建立安全、透明的教學環境
- 推動教育資源的公平分配

【我們的特色】
- 智能配對：根據學生的需求和導師的專長，提供最適合的配對建議
- 品質保證：嚴格的導師審核制度，確保教學品質
- 安全支付：安全的支付系統，保障雙方權益
- 專業支援：專業的客服團隊，隨時為您解決問題

【我們的團隊】
HiHiTutor 由一群熱愛教育的專業人士組成，我們擁有豐富的教育經驗和技術背景，致力於為您提供最好的服務。

【加入我們】
無論您是想要尋找導師的學生，還是想要分享知識的導師，都歡迎加入 HiHiTutor 的大家庭。
    `,
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            常見問題
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            以下是我們最常收到的問題，如果您有其他問題，歡迎聯繫我們。
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </h3>
                  <span className="ml-6 flex-shrink-0">
                    <svg
                      className={`h-6 w-6 transform ${
                        openIndex === index ? 'rotate-180' : ''
                      } transition-transform duration-200`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <div className="text-gray-600 whitespace-pre-line">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            還有其他問題？歡迎
            <a
              href="https://wa.me/85295011159"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium ml-1"
            >
              聯繫我們
            </a>
          </p>
        </div>
      </div>
      <div className="w-full flex justify-center mt-10">
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="bg-white text-black border border-gray-300 rounded-md px-4 py-2 shadow hover:bg-gray-50 transition"
        >
          {showAbout ? '▲ 關於我們' : '▼ 關於我們'}
        </button>
      </div>
      {showAbout && (
        <div className="w-full flex justify-center mt-6">
          <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl text-gray-800">
            <h2 className="text-2xl font-bold mb-4">關於我們</h2>
            <p className="mb-4">HiHiTutor 致力於為學生和導師搭建最優質的教學平台</p>
            <h3 className="text-xl font-semibold mt-6 mb-2">我們的使命</h3>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>為學生提供最適合的導師配對</li>
              <li>為導師創造公平的教學機會</li>
              <li>建立安全、透明的教學環境</li>
              <li>推動教育資源的公平分配</li>
            </ul>
            <h3 className="text-xl font-semibold mt-6 mb-2">我們的特色</h3>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li><strong>智能配對：</strong>根據學生的需求和導師的專長，提供最適合的配對建議</li>
              <li><strong>品質保證：</strong>嚴格的導師審核制度，確保教學品質</li>
              <li><strong>安全支付：</strong>安全的支付系統，保障雙方權益</li>
              <li><strong>專業支援：</strong>專業的客服團隊，隨時為您解決問題</li>
            </ul>
            <h3 className="text-xl font-semibold mt-6 mb-2">我們的團隊</h3>
            <p className="mb-4">
              HiHiTutor 由一群熱愛教育的專業人士組成，我們擁有豐富的教育經驗和技術背景，致力於為您提供最好的服務。
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-2">加入我們</h3>
            <p>無論您是想要尋找導師的學生，還是想要分享知識的導師，都歡迎加入 HiHiTutor 的大家庭。</p>
          </div>
        </div>
      )}
    </div>
  );
} 