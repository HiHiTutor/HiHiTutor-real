'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            關於我們
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            HiHiTutor 致力於為學生和導師搭建最優質的教學平台
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">我們的使命</h2>
            <p className="text-gray-600">
              我們相信每個學生都應該獲得優質的教育資源，每位導師都應該有機會分享知識。HiHiTutor 致力於：
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>為學生提供最適合的導師配對</li>
              <li>為導師創造公平的教學機會</li>
              <li>建立安全、透明的教學環境</li>
              <li>推動教育資源的公平分配</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">我們的特色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">智能配對</h3>
                <p className="text-gray-600">
                  根據學生的需求和導師的專長，提供最適合的配對建議
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">品質保證</h3>
                <p className="text-gray-600">
                  嚴格的導師審核制度，確保教學品質
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">安全支付</h3>
                <p className="text-gray-600">
                  安全的支付系統，保障雙方權益
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">專業支援</h3>
                <p className="text-gray-600">
                  專業的客服團隊，隨時為您解決問題
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">我們的團隊</h2>
            <p className="text-gray-600">
              HiHiTutor 由一群熱愛教育的專業人士組成，我們擁有豐富的教育經驗和技術背景，致力於為您提供最好的服務。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">加入我們</h2>
            <p className="text-gray-600">
              無論您是想要尋找導師的學生，還是想要分享知識的導師，都歡迎加入 HiHiTutor 的大家庭。
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <a
                href="/find-tutor"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                尋找導師
              </a>
              <a
                href="/find-student"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                成為導師
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 