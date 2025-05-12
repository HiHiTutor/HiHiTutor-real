'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            服務條款
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            最後更新日期：2024年3月15日
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 接受條款</h2>
            <p className="text-gray-600">
              使用 HiHiTutor 的服務即表示您同意遵守這些服務條款。如果您不同意這些條款，請勿使用我們的服務。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 服務說明</h2>
            <p className="text-gray-600">
              HiHiTutor 是一個連接學生和導師的平台。我們提供：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>導師搜尋和配對服務</li>
              <li>個案發布和管理</li>
              <li>教學安排和追蹤</li>
              <li>支付處理服務</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 用戶責任</h2>
            <p className="text-gray-600">
              作為用戶，您同意：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>提供準確和完整的個人資料</li>
              <li>保護您的帳戶安全</li>
              <li>遵守所有適用的法律法規</li>
              <li>尊重其他用戶的權利</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 費用和付款</h2>
            <p className="text-gray-600">
              使用我們的服務可能需要支付費用。所有費用將在服務使用前明確告知。付款方式包括：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>信用卡/扣帳卡</li>
              <li>銀行轉帳</li>
              <li>電子錢包</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 隱私保護</h2>
            <p className="text-gray-600">
              我們重視您的隱私。請查看我們的
              <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                隱私權政策
              </a>
              了解我們如何收集、使用和保護您的個人資料。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 免責聲明</h2>
            <p className="text-gray-600">
              我們不保證服務的連續性、及時性、安全性或準確性。我們不對因使用或無法使用我們的服務而產生的任何直接或間接損失負責。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 條款修改</h2>
            <p className="text-gray-600">
              我們保留隨時修改這些服務條款的權利。修改後的條款將在網站上公布，繼續使用我們的服務即表示您接受修改後的條款。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 聯繫我們</h2>
            <p className="text-gray-600">
              如果您對這些服務條款有任何疑問，請
              <a href="/contact" className="text-blue-600 hover:text-blue-800">
                聯繫我們
              </a>
              。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 