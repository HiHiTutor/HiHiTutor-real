'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: '如何成為 HiHiTutor 的導師？',
    answer: '要成為 HiHiTutor 的導師，您需要：\n1. 註冊一個導師帳戶\n2. 填寫個人資料和教學經驗\n3. 上傳相關證書和資格證明\n4. 等待我們的審核團隊審核\n5. 審核通過後即可開始接案'
  },
  {
    question: '如何發布找導師的個案？',
    answer: '發布找導師個案的步驟：\n1. 登入您的學生帳戶\n2. 點擊「發布個案」\n3. 填寫個案詳情（科目、地點、預算等）\n4. 提交個案\n5. 等待導師申請'
  },
  {
    question: '如何支付學費？',
    answer: '我們提供多種支付方式：\n1. 信用卡/扣帳卡\n2. 銀行轉帳\n3. 電子錢包\n所有支付都經過安全加密，確保您的交易安全。'
  },
  {
    question: '如果對導師不滿意怎麼辦？',
    answer: '如果您對導師的教學不滿意：\n1. 首先與導師溝通，表達您的疑慮\n2. 如果問題無法解決，可以聯繫我們的客服\n3. 我們會協助您解決問題，必要時可以更換導師'
  },
  {
    question: '如何確保導師的教學品質？',
    answer: '我們通過以下方式確保教學品質：\n1. 嚴格的導師審核制度\n2. 學生評價系統\n3. 定期教學品質檢查\n4. 專業的教學支援團隊'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          {faqs.map((faq, index) => (
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

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-4"
                  >
                    <div className="text-gray-600 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            還有其他問題？歡迎
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-800 font-medium ml-1"
            >
              聯繫我們
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 