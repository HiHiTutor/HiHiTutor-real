import React from 'react';

interface ContactInfoWarningProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const ContactInfoWarning: React.FC<ContactInfoWarningProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const getWarningContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>警告：</strong>提供聯絡資料將導致帳號被永久停用
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'detailed':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  平台條款違規警告
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>嚴禁在個人資料中提供任何聯絡方式</li>
                    <li>包括但不限於：電話號碼、電子郵件、社交媒體帳號</li>
                    <li>違反者將被永久停用帳號，無法恢復</li>
                    <li>所有聯絡必須通過平台進行</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>重要提醒：</strong>如導師提供任何聯絡資料，即違反平台條款，帳號將被永久停用。
                </p>
                <p className="mt-1 text-xs text-orange-600">
                  嚴禁輸入電話號碼、電子郵件、社交媒體帳號等聯絡方式。所有聯絡必須通過平台進行。
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {getWarningContent()}
    </div>
  );
};

export default ContactInfoWarning; 