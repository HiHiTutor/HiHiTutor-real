'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FindTutorCaseDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // 取得用戶身份（模擬，實際可從 context/auth API 取得）
    setUserType(localStorage.getItem('userType'));
    const fetchCase = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/find-tutor-cases/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCaseDetail(data);
        } else {
          setCaseDetail(null);
        }
      } catch (error) {
        setCaseDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!caseDetail) return <div>此個案未找到或已被刪除。</div>;

  const handleApply = async () => {
    if (userType !== 'tutor') {
      setShowError(true);
      return;
    }
    // 這裡可以實作申請 API
    setShowError(false);
    console.log(`Applying for case: ${id}`);
  };

  return (
    <section className="px-4 py-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📝</span>
        <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">學生個案詳情</h2>
      </div>
      <div className="bg-blue-100 border border-blue-300 rounded-xl p-8">
        <p className="text-gray-600">個案 ID：{caseDetail.id}</p>
        <p className="text-gray-600">科目：{caseDetail.subject}</p>
        <p className="text-gray-600">地點：{caseDetail.location}</p>
        <p className="text-gray-600">收費：{caseDetail.budget}</p>
        <p className="text-gray-600">模式：{caseDetail.mode}</p>
        <p className="text-gray-600">要求：{caseDetail.requirement}</p>
        <button
          onClick={handleApply}
          className="mt-4 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          申請此個案
        </button>
        {showError && (
          <div className="mt-4 bg-red-100 border border-red-300 rounded-xl p-4 text-red-600">
            需要升級為導師才可申請此個案
          </div>
        )}
      </div>
    </section>
  );
} 