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
    answer: null, // 由JSX渲染
  },
  {
    question: '如果家長/學生認為導師不適合，我可以要求更換嗎？',
    answer: null, // 由JSX渲染
  },
  {
    question: '家長/學生可否在補習開始前約見導師以確保導師適合學生的需要？',
    answer: 'HiHiTutor 負責為家長把關，篩選最合適導師，所以我們會盡力核實導師資歷。但家長如仍希望在正式補習前與導師會面，我們會嘗試安排，而會面將會在本公司職員在場之下進行。HiHiTutor 會收取家長/學生港幣500元之行政費用。',
  },
  {
    question: '家長/學生可否在導師首次補習前取消已預約補習服務？',
    answer: '當個案確立後，即導師口頭承諾接納補習，家長/學生亦口頭承諾接納HiHiTutor介紹的導師，家長/學生請勿因任何理由而在導師開始前取消服務，行政費用亦將不會退回。',
  },
  {
    question: '學生需要補不同科目 導師可以接受嗎？',
    answer: '當然可以。HiHiTutor 致力推動家長、學生與導師「教學相長」。如家長/學生與導師完成課堂後，認為導師能力許可，希望協助教授其他科目，HiHiTutor 不會另外加收行政費，以支持導師繼續用心教學。',
  },
  {
    question: '導師如何增加自己被挑選中的機會？',
    answer: '1. 主動WhatsApp 聯絡配對專員申請個案。\n2. 導師必須清楚個案每一項細節是否附合自己要求，如地點、時間等。\n3. 自我介紹簡潔易明。\n4. 將最新時間表遞交給配對專員，方便篩選合適補習個案。\n5. 過往紀錄良好，沒有被家長中止補習紀錄。\n6. 導師態度良好。',
  },
  {
    question: '如果導師已經口頭承諾接納補習之後決定放棄，應該怎樣做？',
    answer: '導師與職員口頭接受個案後，因任何原因(包括生病)決定放棄個案，導師須繳付全數行政費用。',
  },
  {
    question: '如導師配對後被解僱，導師還要繳付行政費用嗎？',
    answer: '所有已繳交行政費用不作退款。',
  },
  {
    question: '如果導師於首課完成後認為補習地點不適合，可以要求終止補習嗎？',
    answer: '本公司在確認補習導師人選前，已經把家長/學生提供的補習地點刊登於網上，並且於電話確認時，會將更詳細的地點資料通知導師。導師在接受補習前，有責任自行查閱地圖，確認有關地點資料，不得答應補習後因地點問題而終止補習。我們仍會按照原先協議，收取全數行政費用。',
  },
  {
    question: '為什麼接受個案後，因事未能開始教授仍要收取完行政費用？',
    answer: '由於導師在接受個案前，已經有充分的資料以助了解學生的基本情況，作為一個負責任的導師，不可能在沒有充分考慮之情況下答允，因此舉會令家長/學生對HiHiTutor的信心盡失，本公司有需要收上述的行政費。本公司呼籲導師在答應接受個案以前，應充分考慮是否合適，避免口頭承諾接納補習後放棄個案。',
  },
  {
    question: '首次與家長/學生見面，導師應該帶備什麼資料？',
    answer: '導師應帶備身份證明文件以及學歷證明，提升家長/學生對你的信任。',
  },
  {
    question: '如果導師因事未能補習，導師可以自行找他人代課嗎？',
    answer: '任何情況下，導師均不可自行任何人士代課。導師如因事未能補習，請通知本公司負責職員，導師請勿自行作任何決定，包括自行取消補習或找其他人士代課。導師如因為自行作任何決定(包括取消補習/找其他人士代課一節或多節/與家長自行作其他安排/減少堂數)，必須負擔全部責任。',
  },
  {
    question: '如果導師沒有在指定日期繳付行政費用，HiHiTutor會採取什麼行動？',
    answer: '如導師須繳交任何行政費用，導師將會收到一封確認信。導師可隨時查閱確認信內其個案資料詳情及所需繳付之費用。如行政費用過期達十天或以上，我們會委託「小額錢債」代為收取有關原行政費用及20%附加費，同時或會終止導師之會員資格。',
  },
  {
    question: '如已繳付行政費用，是否需要保留收條？',
    answer: '無論使用銀行轉賬（網上/櫃員機）或銀行現金存款，均需要保留收條，以茲識別。本公司有權向導師要求提供有關收條以作確認，如導師未能提供有關資料，本公司會要求導師馬上重新付費；即使導師正向銀行申請查詢戶口資料，導師仍須先付費，待查詢結果，得悉已付款後再與本公司聯絡，跟進退還多收費用事宜。',
  },
  {
    question: '如個案出現問題，但已到期繳付，可以向HiHiTutor職員解釋有關情況嗎？',
    answer: '你需要把具體情況向負責職員交代，我們會酌情處理每一個案，但我們保留採取任何處理方案的權利。',
  },
  {
    question: '如果我要更改首課補習時間，須如何處理?',
    answer: '請盡快聯絡配對專員。',
  },
  {
    question: '導師安全問題',
    answer: '本公司不擔保導師人生安全，希望導師注意人生安全。HiHiTutor明確聲明導師的人生安全或其他個人利益得失非HiHiTutor控制範圍之內。本公司概不接納或承擔有關導師和家長或學生之間之任何法律責任。',
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
            配對流程
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            常見問題。
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
                          <a href="https://api.whatsapp.com/send?phone=85295011159&text=Hello，我想搵導師，請問可以幫我配對嗎？唔該晒！" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">WhatsApp</a>
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
                          <a href="https://www.hihitutor.com/tutor/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">導師儀表板</a>
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
                    ) : faq.question === '如何支付學費？' ? (
                      <>
                        <div>本平台會代收第一堂堂費作為配對及留位費用。家長/學生可透過「轉數快」繳交相關堂費，FPS ID: 117665562，帳戶名稱: HiHiTutor Limited。</div>
                        <br />
                        <div>如需協助，請 <a href="https://wa.me/85295011159?text=Hello，我有關於支付學費的問題，請問可以幫我嗎？唔該晒！" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">聯絡我們</a>。</div>
                      </>
                    ) : faq.question === '如果家長/學生認為導師不適合，我可以要求更換嗎？' ? (
                      <>
                        <div>敬請聯絡<a href="https://wa.me/85295011159" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">配對專員</a>，我們會嘗試了解課堂情況，同時向導師反映，協助調解。</div>
                        <br />
                        <div>HiHiTutor 同時亦明白，導師與學生磨合需時，任何進步都需要時間。希望家長可多與導師溝通，互相了解合理期望，從而調整課堂安排。</div>
                        <br />
                        <div>如必要時更換導師，本平台雖然不會收取額外手續費，只會代收新導師一堂堂費作為行政費用，但學生同時亦重新適應教法，提出更換前亦請家長認真考慮。</div>
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
            <a
              href="https://wa.me/85295011159"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              聯絡我們
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 