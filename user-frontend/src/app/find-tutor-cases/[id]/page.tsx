'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSubjectNames, getRegionName, getSubRegionName, getModeName } from '@/utils/translate';
import { caseApi } from '@/services/api';

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
  const id = typeof params?.id === 'string' ? params.id : '';
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // 從 localStorage 獲取完整的用戶資料
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('解析用戶資料失敗:', error);
      }
    }

    const fetchCase = async () => {
      try {
        const result = await caseApi.getTutorCaseById(id);
        console.log('📥 API 返回的資料:', result);
        setCaseDetail(Array.isArray(result) ? result[0] : result?.data);
      } catch (error) {
        console.error('❌ 獲取案例失敗:', error);
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
    // 檢查用戶是否已登入
    if (!user) {
      setShowError(true);
      return;
    }

    // 檢查用戶是否為導師（同時檢查 userType 和 role）
    const isTutor = user.userType === 'tutor' || user.role === 'tutor';
    if (!isTutor) {
      setShowError(true);
      return;
    }

    setShowError(false);
    console.log(`Applying for case: ${id}`);
    try {
      await caseApi.applyCase(id, user.id);
      // TODO: 顯示成功訊息
    } catch (error) {
      console.error('申請失敗:', error);
      // TODO: 顯示錯誤訊息
    }
  };

  // 處理個案 ID
  const getCaseId = () => {
    return caseDetail.id || caseDetail._id || '無ID';
  };

  // 處理科目
  const getSubjects = () => {
    if (!caseDetail.subjects) return '未指定';
    return getSubjectNames(caseDetail.subjects);
  };

  // 處理地點
  const getLocation = () => {
    const regions = caseDetail.regions || [];
    const subRegions = caseDetail.subRegions || [];
    
    if (regions.length === 0 && subRegions.length === 0) {
      return '未指定';
    }

    const regionNames = regions.map(getRegionName);
    const subRegionNames = subRegions.map(getSubRegionName);
    
    return [...regionNames, ...subRegionNames].join('、');
  };

  // 處理預算
  const getBudget = () => {
    if (!caseDetail.budget) return '待議';
    const { min, max } = caseDetail.budget;
    if (!min && !max) return '待議';
    if (min === max) return `${min}/小時`;
    return `${min} - ${max}/小時`;
  };

  // 處理模式
  const getMode = () => {
    if (!caseDetail.mode && (!caseDetail.modes || caseDetail.modes.length === 0)) {
      return '未指定';
    }
    if (caseDetail.mode) {
      return getModeName(caseDetail.mode);
    }
    return caseDetail.modes.map(getModeName).join('、');
  };

  // 處理要求
  const getRequirements = () => {
    if (caseDetail.requirements) return caseDetail.requirements;
    if (caseDetail.requirement) return caseDetail.requirement;
    if (caseDetail.description) return caseDetail.description;
    if (caseDetail.experience) {
      return EXPERIENCES[caseDetail.experience] || caseDetail.experience;
    }
    return '導師未指定特別要求';
  };

  return (
    <section className="px-4 py-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👩‍🏫</span>
        <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-3">導師個案詳情</h2>
      </div>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-8">
        <p className="text-gray-600">個案 ID：{getCaseId()}</p>
        <p className="text-gray-600">科目：{getSubjects()}</p>
        <p className="text-gray-600">地點：{getLocation()}</p>
        <p className="text-gray-600">收費：{getBudget()}</p>
        <p className="text-gray-600">模式：{getMode()}</p>
        <p className="text-gray-600">要求：{getRequirements()}</p>
        <div>
          <button
            onClick={handleApply}
            className="mt-4 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            申請此個案
          </button>
          {showError && (
            <div className="mt-4 text-red-600">
              {!user ? '請先登入' : '需要升級為導師才可申請此個案'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 