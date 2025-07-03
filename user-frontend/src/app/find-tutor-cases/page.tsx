'use client';

import React, { useEffect, useState } from 'react';
import { caseApi } from '@/services/api';
import CaseCard from '@/components/CaseCard';

export default function FindTutorCasesPage() {
  console.log('💥 進入 page.tsx: /find-tutor-cases ✅');

  const [cases, setCases] = useState([]);

  useEffect(() => {
    console.log('🧪 useEffect 開始執行: 準備呼叫 getAllStudentCases()');

    caseApi.getAllStudentCases()
      .then((res) => {
        console.log('🎯 收到學生個案 API 回應:', res);
        if (res.success && res.data) {
          setCases(res.data);
        } else {
          console.warn('⚠️ 回傳結果無資料或失敗:', res);
        }
      })
      .catch((err) => {
        console.error('❌ 呼叫 getAllStudentCases 發生錯誤:', err);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">📄 補習個案（學生出 Post）</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {cases.length === 0 && <p>😢 暫時無個案</p>}
        {cases.map((c: any, index: number) => {
          console.log(`🧩 渲染個案 #${index}:`, c);
          return <CaseCard key={c.id || index} caseData={c} routeType="student" />;
        })}
      </div>
    </div>
  );
} 