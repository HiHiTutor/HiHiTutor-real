'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSubjectNames, getRegionName, getSubRegionName, getModeName } from '@/utils/translate';

// 教學模式映射
const MODES: { [key: string]: string } = {
  'online': '網課',
  'offline': '面授',
  'in-person': '面授'
};

// 經驗要求映射
const EXPERIENCES: { [key: string]: string } = {
  'fresh': '無經驗要求',
  'junior': '1-3年經驗',
  'senior': '3-5年經驗',
  'expert': '5年以上經驗'
};

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/find-tutor-cases/${id}`);
        if (response.ok) {
          const result = await response.json();
          setCaseDetail(result.data);
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

  // 處理科目資料
  const getSubjects = () => {
    if (!caseDetail.subjects) return "無科目資料";
    
    // 如果是字串，轉換為陣列
    const subjects = Array.isArray(caseDetail.subjects) 
      ? caseDetail.subjects 
      : [caseDetail.subjects];
    
    return subjects.join('、');
  };

  // 處理預算資料
  const getBudget = () => {
    if (!caseDetail.budget) return "價格待議";
    
    if (typeof caseDetail.budget === 'string') {
      return caseDetail.budget;
    }
    
    if (typeof caseDetail.budget === 'object' && caseDetail.budget !== null) {
      const { min, max } = caseDetail.budget;
      if (min && max) {
        return `${min} - ${max}/小時`;
      }
    }
    
    return "價格待議";
  };

  // 處理地區資料
  const getLocation = () => {
    const region = caseDetail.region || '';
    const subRegion = caseDetail.subRegion || '';
    return [region, subRegion].filter(Boolean).join(' ');
  };

  return (
    <section className="px-4 py-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📝</span>
        <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">學生個案詳情</h2>
      </div>
      <div className="bg-blue-100 border border-blue-300 rounded-xl p-8">
        <p className="text-gray-600">個案 ID：{caseDetail.id || '無ID'}</p>
        <p className="text-gray-600">科目：{getSubjectNames(caseDetail.subjects, caseDetail.category, caseDetail.subCategory)}</p>
        <p className="text-gray-600">地點：{getRegionName(caseDetail.region)} {getSubRegionName(caseDetail.subRegion)}</p>
        <p className="text-gray-600">收費：{getBudget()}</p>
        <p className="text-gray-600">模式：{getModeName(caseDetail.mode)}</p>
        <p className="text-gray-600">要求：{EXPERIENCES[caseDetail.experience] || caseDetail.experience || '未指定'}</p>
        <div>
          <button
            onClick={handleApply}
            className="mt-4 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            申請此個案
          </button>
          {showError && (
            <div className="mt-4 text-red-600">需要升級為導師才可申請此個案</div>
          )}
        </div>
      </div>
    </section>
  );
} 