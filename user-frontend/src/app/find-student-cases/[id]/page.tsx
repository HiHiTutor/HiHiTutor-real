'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSubjectNames, getRegionName, getSubRegionName, getModeName } from '@/utils/translate';
import { caseApi } from '@/services/api';

// 經驗要求映射
const EXPERIENCES: { [key: string]: string } = {
  'fresh': '無經驗要求',
  'junior': '1-3年經驗',
  'senior': '3-5年經驗',
  'expert': '5年以上經驗'
};

export default function FindStudentCaseDetailPage() {
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

  if (loading) return (
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
            <a
              href={`https://wa.me/85295011159?text=${encodeURIComponent(
                `Hello，我喺 HiHiTutor 見到 caseID ${getCaseId()}，想申請呢單case，唔該晒!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full md:w-auto"
            >
              <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md">
                📱 申請此個案
              </button>
            </a>
            
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