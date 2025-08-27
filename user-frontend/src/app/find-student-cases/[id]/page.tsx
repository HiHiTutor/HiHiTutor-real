'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSubjectNames, getRegionName, getSubRegionName, getModeName } from '@/utils/translate';
import { caseApi } from '@/services/api';
import { useUser } from '@/hooks/useUser';

// 經驗要求映射
const EXPERIENCES: { [key: string]: string } = {
  'fresh': '無經驗要求',
  'junior': '1-3年經驗',
  'senior': '3-5年經驗',
  'expert': '5年以上經驗'
};

export default function FindStudentCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const result = await caseApi.getStudentCaseById(id);
        console.log('📥 API 返回的資料:', result);
        
        // 正確處理 API 回應資料結構
        let caseData = null;
        if (result && result.success && result.data) {
          // 後端返回 { success: true, data: caseItem }
          caseData = result.data;
        } else if (Array.isArray(result)) {
          // 如果是陣列，取第一個
          caseData = result[0];
        } else if (result && result.data) {
          // 其他可能的資料結構
          caseData = result.data;
        } else {
          // 直接使用 result
          caseData = result;
        }
        
        console.log('📦 處理後的個案資料:', caseData);
        setCaseDetail(caseData);
      } catch (error) {
        console.error('❌ 獲取案例失敗:', error);
        setCaseDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  // 等待用戶資料載入完成
  if (userLoading || loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-blue-600 text-lg">載入中...</div>
    </div>
  );
  
  if (!caseDetail) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-red-600 text-lg">此個案未找到或已被刪除。</div>
    </div>
  );

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
    console.log('💰 處理預算，原始資料:', caseDetail.budget);
    
    if (!caseDetail.budget) {
      console.log('❌ 沒有預算資料');
      return '待議';
    }
    
    // 如果是字符串格式
    if (typeof caseDetail.budget === 'string') {
      console.log('📝 預算是字符串:', caseDetail.budget);
      return caseDetail.budget === '' ? '待議' : `${caseDetail.budget}/小時`;
    }
    
    // 如果是數字格式
    if (typeof caseDetail.budget === 'number') {
      console.log('🔢 預算是數字:', caseDetail.budget);
      return `${caseDetail.budget}/小時`;
    }
    
    // 如果是對象格式 { min, max }
    if (typeof caseDetail.budget === 'object' && caseDetail.budget !== null) {
      const { min, max } = caseDetail.budget;
      console.log('📦 預算是對象:', { min, max });
      
      if (!min && !max) return '待議';
      if (min === max) return `${min}/小時`;
      return `${min} - ${max}/小時`;
    }
    
    console.log('❓ 未知預算格式:', caseDetail.budget);
    return '待議';
  };

  // 處理模式
  const getMode = () => {
    console.log('🎯 處理模式，原始資料:', {
      mode: caseDetail.mode,
      modes: caseDetail.modes
    });
    
    // 檢查 modes 陣列
    if (caseDetail.modes && Array.isArray(caseDetail.modes) && caseDetail.modes.length > 0) {
      console.log('📦 使用 modes 陣列:', caseDetail.modes);
      const modeNames = caseDetail.modes.map((mode: any) => {
        const modeName = getModeName(mode);
        console.log(`🎯 模式 ${mode} -> ${modeName}`);
        return modeName;
      });
      return modeNames.join('、');
    }
    
    // 檢查單一 mode
    if (caseDetail.mode) {
      console.log('📝 使用單一 mode:', caseDetail.mode);
      const modeName = getModeName(caseDetail.mode);
      console.log(`🎯 模式 ${caseDetail.mode} -> ${modeName}`);
      return modeName;
    }
    
    console.log('❌ 沒有模式資料');
    return '未指定';
  };

  // 處理要求
  const getRequirements = () => {
    if (caseDetail.requirements) return caseDetail.requirements;
    if (caseDetail.requirement) return caseDetail.requirement;
    if (caseDetail.description) return caseDetail.description;
    if (caseDetail.experience) {
      return EXPERIENCES[caseDetail.experience] || caseDetail.experience;
    }
    return '學生未指定特別要求';
  };

  // 處理申請按鈕點擊
  const handleApplyClick = () => {
    if (!user) {
      // 未登入：直接跳轉到登入頁面
      router.push('/login');
      return;
    }

    if (user.userType === 'student') {
      // 學生用戶：跳轉到升級頁面
      router.push('/upgrade');
      return;
    }

    // 導師用戶：直接跳轉到 WhatsApp
    const message = `Hello，我喺 HiHiTutor 見到 caseID ${getCaseId()}，想申請呢單case，唔該晒!`;
    const whatsappUrl = `https://wa.me/85295011159?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // 獲取按鈕文字
  const getButtonText = () => {
    if (!user) return '登入並申請個案';
    if (user.userType === 'student') return '立即申請成為導師';
    return '📱 申請此個案';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">個案詳情</h2>
          <p className="text-blue-100 text-sm mt-1">個案 ID: {getCaseId()}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📚 科目</h3>
              <p className="text-gray-700">{getSubjects()}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📍 地點</h3>
              <p className="text-gray-700">{getLocation()}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💰 收費</h3>
              <p className="text-gray-700">{getBudget()}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 模式</h3>
              <p className="text-gray-700">{getMode()}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 要求</h3>
            <p className="text-gray-700">{getRequirements()}</p>
          </div>
          
          <div className="pt-4">
            <button 
              onClick={handleApplyClick}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
            >
              {getButtonText()}
              </button>
            
            {showError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  {!user ? '請先登入' : '需要升級為導師才可申請此個案'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 