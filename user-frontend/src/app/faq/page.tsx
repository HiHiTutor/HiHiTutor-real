'use client';

import { useState } from 'react';

const faqData = [
  {
    question: '「尋導師」流程',
    answer: null, // 由JSX渲染
  },
  {
    question: '「招學生」流程',
    answer: null, // 由JSX渲染
  },
  {
    question: '如何支付學費？',
    answer: '本平台會代收第一堂堂費作為配對及留位費用。家長/學生可透過「轉數快」繳交相關堂費，FPS ID: 117665562，帳戶名稱: HiHiTutor Limited。如需協助，請聯絡我們(https://wa.me/85295011159)。',
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
                    {faq.question === '「尋導師」流程' ? (
                      <>
                        <div>第一步: 根據學習需要，篩選最合適導師</div>
                        <br />
                        <div>方法1 – 自助搜尋導師</div>
                        <div>
                          前往
                          <a href="https://www.hihitutor.com/tutors" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">導師列表</a>
                          自行篩選合適導師, 並按 "立即預約上堂"，配對專員會盡快為你協調課堂安排。
                        </div>
                        <br />
                        <div>方法2 – 招募導師</div>
                        <div>
                          前往
                          <a href="https://www.hihitutor.com/post/student-case" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">發帖尋導師</a>
                          並填寫課堂要求，配對專員核實後，會協助刊登於本平台的「補習個案」。配對專員將與有興趣申請個案的導師接洽課堂安排。
                        </div>
                        <br />
                        <div>方法3 – 直接聯絡配對專員</div>
                        <div>
                          <a href="https://api.whatsapp.com/send?phone=85295011159&text=我想搵導師唔該!" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">WhatsApp</a>
                          與配對專員直接聯絡，核實課堂資料後，配對專員會為你建議合適導師，並協助接洽課堂安排。
                        </div>
                        <br />
                        <div>第二步: 確認上堂細節</div>
                        <div>
                          當家長/學生確認課堂詳情後，包括導師、上堂時間、地點、堂費等，本平台會代收第一堂堂費作為配對及留位費用。本平台收取相關費用後，則協助家長/學生和導師雙方協助交換聯絡資料，雙方根據協定時間開始上上第一堂。而由第二堂開始，堂費則直接交予導師，而交付方式則由家長/學生與導師自行協定。原則上，家長/學生在配對過程中是完全無須繳交任何額外費用。
                        </div>
                      </>
                    ) : faq.question === '「招學生」流程' ? (
                      <>
                        <div>第一步：</div>
                        <div>
                          <a href="https://www.hihitutor.com/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">註冊</a>
                          成為HiHiTutor 用戶。
                        </div>
                        <br />
                        <div>第二步：</div>
                        <div>
                          到 
                          <a href="https://www.hihitutor.com/profile" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">帳戶設定</a>
                          填寫導師資料並上載相關學歷證明，經配對專員審核後，帳戶會升級成導師帳戶。
                        </div>
                        <br />
                        <div>第三步：</div>
                        <div>自助搜尋導師</div>
                        <div>
                          前往
                          <a href="https://www.hihitutor.com/find-student-cases" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">補習個案</a>
                          找導心儀補習個案, 並按 "📱 申請此個案"，配對專員會盡快為你協調課堂安排。
                        </div>
                        <br />
                        <div>第四步：</div>
                        <div>確認上堂細節</div>
                        <div>
                          當導師確認課堂詳情後，包括上堂時間、地點、堂費等，本平台會代收第一堂堂費作為配對及留位費用。本平台收取相關費用後，則協助家長/學生和導師雙方協助交換聯絡資料，雙方根據協定時間開始上上第一堂。而由第二堂開始，堂費則直接交予導師，而交付方式則由家長/學生與導師自行協定。
                        </div>
                      </>
                    ) : faq.answer}
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
    </div>
  );
} 