'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function StudentCaseDetailPage() {
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/find-student-cases/${id}`);
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

  const handleApply = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowError(true);
      setErrorMsg('請先登入');
      return;
    }
    setShowError(false);
    setErrorMsg('');
    // 這裡可以實作申請 API
    console.log(`Applying for case: ${id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!caseDetail) {
    return <div>此個案未找到或已被刪除。</div>;
  }

  return (
    <section className="px-4 py-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📄</span>
        <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">個案詳情</h2>
      </div>
      <div className="bg-blue-100 border border-blue-300 rounded-xl p-8">
        <p className="text-gray-600">個案 ID: {caseDetail.id}</p>
        <p className="text-gray-600">科目: {caseDetail.subject}</p>
        <p className="text-gray-600">地點: {caseDetail.location}</p>
        <p className="text-gray-600">收費: {caseDetail.budget}</p>
        <p className="text-gray-600">模式: {caseDetail.mode}</p>
        <p className="text-gray-600">要求: {caseDetail.requirement}</p>
        <button
          onClick={handleApply}
          className="mt-4 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          申請此個案
        </button>
        {showError && (
          <div className="mt-4 bg-red-100 border border-red-300 rounded-xl p-4 text-red-600">
            {errorMsg}
          </div>
        )}
      </div>
    </section>
  );
} 