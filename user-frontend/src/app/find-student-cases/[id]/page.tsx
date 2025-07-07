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