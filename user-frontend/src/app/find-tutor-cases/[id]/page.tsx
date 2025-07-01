'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSubjectNames, getRegionName, getSubRegionName, getModeName } from '@/utils/translate';
import { caseApi } from '@/services/api';

// 教學模式映射
const MODES: { [key: string]: string } = {
  'online': '網課',
  'offline': '面授',
  'in-person': '面授',
  'one-on-one': '一對一',
  'small-group': '小班教學',
  'large-center': '大型補習社'
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
        const result = await caseApi.getStudentCaseById(id);
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

  // 處理個案 ID
  const getCaseId = () => {
    return caseDetail.id || caseDetail._id || '無ID';
  };

  // 處理科目
  const getSubjects = () => {
    if (!caseDetail.subjects || caseDetail.subjects.length === 0) return '未指定';
    
    // 如果是陣列，使用翻譯函數
    if (Array.isArray(caseDetail.subjects)) {
      return getSubjectNames(caseDetail.subjects);
    }
    
    // 如果是單一值，直接返回
    return caseDetail.subjects;
  };

  // 處理模式
  const getMode = () => {
    const modes = caseDetail.modes || [];
    if (modes.length === 0 && !caseDetail.mode) return '未指定';
    
    // 只使用 modes 數組，避免重複
    if (modes.length > 0) {
      return modes.map((mode: string) => getModeName(mode)).join('、');
    }
    
    // 如果沒有 modes 數組，使用單一 mode
    if (caseDetail.mode) {
      return getModeName(caseDetail.mode);
    }
    
    return '未指定';
  };

  // 處理地點
  const getLocation = () => {
    const modes = caseDetail.modes || [];
    const hasInPerson = modes.includes('in-person');
    
    if (!hasInPerson) return '不適用（純網課）';
    
    const regions = caseDetail.regions || [];
    const subRegions = caseDetail.subRegions || [];
    
    if (regions.length === 0 && subRegions.length === 0) return '未指定';
    
    const regionNames = regions.map(getRegionName);
    const subRegionNames = subRegions.map(getSubRegionName);
    
    const allLocations = [...regionNames, ...subRegionNames];
    return allLocations.length > 0 ? allLocations.join('、') : '未指定';
  };

  // 處理收費
  const getPrice = () => {
    // 支援新的數據結構
    if (caseDetail.duration && caseDetail.price && caseDetail.weeklyLessons) {
      let display = '';
      if (caseDetail.duration) {
        const unit = caseDetail.durationUnit === 'hours' ? '小時' : '分鐘';
        display += `每堂${caseDetail.duration}${unit}`;
      }
      if (caseDetail.price) display += `，每堂HKD ${caseDetail.price}`;
      if (caseDetail.weeklyLessons) display += `，每週${caseDetail.weeklyLessons}堂`;
      return display;
    }
    
    // 支援舊的數據結構
    if (caseDetail.lessonDetails) {
      const { duration, pricePerLesson, lessonsPerWeek } = caseDetail.lessonDetails;
      let display = '';
      if (duration) display += `每堂${duration}分鐘`;
      if (pricePerLesson) display += `，每堂HKD ${pricePerLesson}`;
      if (lessonsPerWeek) display += `，每週${lessonsPerWeek}堂`;
      return display || '待議';
    }
    
    // 支援 budget 字段
    if (caseDetail.budget) {
      if (typeof caseDetail.budget === 'string' && caseDetail.budget.trim() !== '') {
        return `每堂HKD ${caseDetail.budget}`;
      }
      if (typeof caseDetail.budget === 'object' && caseDetail.budget.min && caseDetail.budget.max) {
        return `每堂HKD ${caseDetail.budget.min} - ${caseDetail.budget.max}`;
      }
    }
    
    return '待議';
  };

  // 處理要求
  const getRequirements = () => {
    if (caseDetail.requirement) return caseDetail.requirement;
    if (caseDetail.requirements) return caseDetail.requirements;
    if (caseDetail.description) return caseDetail.description;
    if (caseDetail.experience) {
      return EXPERIENCES[caseDetail.experience] || caseDetail.experience;
    }
    return '學生未指定特別要求';
  };

  return (
    <section className="px-4 py-8 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📝</span>
        <h2 className="text-2xl font-bold border-l-4 border-blue-400 pl-3">補習個案</h2>
      </div>
      <div className="bg-blue-100 border border-blue-300 rounded-xl p-8">
        <p className="text-gray-600">個案 ID：{getCaseId()}</p>
        <p className="text-gray-600">標題：{caseDetail.title || '未命名個案'}</p>
        <p className="text-gray-600">科目：{getSubjects()}</p>
        <p className="text-gray-600">地點：{getLocation()}</p>
        <p className="text-gray-600">收費：{getPrice()}</p>
        <p className="text-gray-600">模式：{getMode()}</p>
        <p className="text-gray-600">要求：{getRequirements()}</p>
        <div>
          <a
            href={`https://wa.me/85284158743?text=${encodeURIComponent(
              `Hello，我喺 HiHiTutor 見到 caseID ${getCaseId()}，想申請呢單case，唔該晒!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              申請此個案
            </button>
          </a>
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