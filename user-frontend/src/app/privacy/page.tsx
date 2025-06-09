'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">隱私權政策</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="mb-6">
              本隱私權政策說明HiHiTutor如何收集、使用、處理和保護您的個人資料。我們重視您的隱私，並致力於保護您的個人資料安全。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 資料收集</h2>
            <p className="mb-4">我們可能收集以下類型的個人資料：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>基本資料：姓名、電子郵件地址、電話號碼、地址等</li>
              <li>帳戶資料：用戶名稱、密碼、帳戶設定等</li>
              <li>教育背景：學歷、專業資格、教學經驗等</li>
              <li>交易資料：付款資訊、交易記錄等</li>
              <li>使用記錄：網站瀏覽記錄、搜尋記錄、互動記錄等</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 資料使用</h2>
            <p className="mb-4">我們使用您的個人資料用於以下目的：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>提供、維護和改進我們的服務</li>
              <li>處理您的註冊和帳戶管理</li>
              <li>處理付款和交易</li>
              <li>與您溝通服務相關事宜</li>
              <li>進行市場研究和分析</li>
              <li>防止欺詐和確保系統安全</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 資料分享</h2>
            <p className="mb-4">我們可能在以下情況下分享您的個人資料：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>與服務提供者分享，以協助我們提供服務</li>
              <li>遵守法律要求或回應法律程序</li>
              <li>保護我們的權利和財產</li>
              <li>在緊急情況下保護用戶或公眾安全</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 資料安全</h2>
            <p className="mb-6">
              我們採取適當的技術和組織措施來保護您的個人資料，防止未經授權的訪問、使用或披露。然而，請注意，沒有任何網際網路傳輸或電子儲存方法是100%安全的。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 您的權利</h2>
            <p className="mb-4">根據適用的資料保護法律，您可能擁有以下權利：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>訪問您的個人資料</li>
              <li>更正不準確的個人資料</li>
              <li>刪除您的個人資料</li>
              <li>限制或反對處理您的個人資料</li>
              <li>資料可攜性</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookie 使用</h2>
            <p className="mb-6">
              我們使用Cookie和類似技術來改善您的使用體驗、分析網站使用情況和提供個人化內容。您可以通過瀏覽器設定控制Cookie的使用。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 政策更新</h2>
            <p className="mb-6">
              我們可能會不時更新本隱私權政策。當我們進行重大更改時，我們會通過網站公告或其他適當方式通知您。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 聯繫我們</h2>
            <p className="mb-6">
              如果您對本隱私權政策有任何疑問或需要行使您的權利，請通過以下方式聯繫我們：
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>電子郵件：privacy@hihitutor.com</li>
              <li>電話：+852 1234 5678</li>
              <li>地址：香港中環金融街8號國際金融中心二期</li>
            </ul>

            <p className="mt-8 text-sm text-gray-600">
              最後更新日期：2024年3月15日
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 