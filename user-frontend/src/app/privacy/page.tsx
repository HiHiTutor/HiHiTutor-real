'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            隱私權政策
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            最後更新日期：2024年3月15日
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 資料收集</h2>
            <p className="text-gray-600">
              我們收集的個人資料包括：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>基本資料（姓名、電子郵件、電話號碼）</li>
              <li>教育背景和經驗</li>
              <li>支付資訊</li>
              <li>使用記錄和偏好設定</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 資料使用</h2>
            <p className="text-gray-600">
              我們使用您的個人資料來：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>提供和改進我們的服務</li>
              <li>處理付款和退款</li>
              <li>發送服務通知和更新</li>
              <li>回應您的查詢和請求</li>
              <li>防止欺詐和確保安全</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 資料保護</h2>
            <p className="text-gray-600">
              我們採取以下措施保護您的個人資料：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>使用加密技術保護資料傳輸</li>
              <li>實施嚴格的存取控制</li>
              <li>定期進行安全評估</li>
              <li>員工保密培訓</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 資料分享</h2>
            <p className="text-gray-600">
              我們不會出售您的個人資料。我們只在以下情況下分享您的資料：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>獲得您的明確同意</li>
              <li>遵守法律要求</li>
              <li>保護我們的權利和財產</li>
              <li>與服務提供商合作（如支付處理商）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 您的權利</h2>
            <p className="text-gray-600">
              您對您的個人資料擁有以下權利：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>存取您的個人資料</li>
              <li>更正不準確的資料</li>
              <li>要求刪除您的資料</li>
              <li>限制資料處理</li>
              <li>資料可攜性</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookie 使用</h2>
            <p className="text-gray-600">
              我們使用 Cookie 和類似技術來：
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>記住您的偏好設定</li>
              <li>分析網站使用情況</li>
              <li>提供個人化體驗</li>
              <li>改進我們的服務</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 政策更新</h2>
            <p className="text-gray-600">
              我們可能會不時更新本隱私權政策。更新後的版本將在網站上公布，並註明更新日期。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 聯繫我們</h2>
            <p className="text-gray-600">
              如果您對我們的隱私權政策有任何疑問，請
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